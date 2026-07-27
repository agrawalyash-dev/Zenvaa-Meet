import { useCallback, useEffect, useRef, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Role = "caller" | "callee";
type Stage = "home" | "waiting" | "in-call";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useCall() {
  const [role, setRole] = useState<Role | null>(null);
  const [callCode, setCallCode] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("home");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const roleRef = useRef<Role | null>(null);
  const callCodeRef = useRef<string | null>(null);

  const remoteDescSetRef = useRef(false);
  const addedCandidateIdsRef = useRef(new Set<string>());
  const pendingLocalCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const remoteEndedHandledRef = useRef(false);

  const convex = useConvex();
  const createCallMutation = useMutation(api.calls.createCall);
  const submitAnswerMutation = useMutation(api.calls.submitAnswer);
  const endCallMutation = useMutation(api.calls.endCall);
  const deleteCallMutation = useMutation(api.calls.deleteCall);
  const addIceCandidateMutation = useMutation(
    api.iceCandidates.addIceCandidate,
  );

  const watchedCall = useQuery(
    api.calls.watchCall,
    callCode ? { callCode } : "skip",
  );

  const incomingCandidates = useQuery(
    api.iceCandidates.getIceCandidates,
    role && callCode
      ? { callCode, from: role === "caller" ? "callee" : "caller" }
      : "skip",
  );

  const sendCandidate = useCallback(
    (candidate: RTCIceCandidate) => {
      if (!callCodeRef.current || !roleRef.current) return;
      addIceCandidateMutation({
        callCode: callCodeRef.current,
        from: roleRef.current,
        candidate: JSON.stringify(candidate),
      });
    },
    [addIceCandidateMutation],
  );

  const flushPendingCandidates = useCallback(() => {
    pendingLocalCandidatesRef.current.forEach(sendCandidate);
    pendingLocalCandidatesRef.current = [];
  }, [sendCandidate]);

  const setupPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      if (callCodeRef.current && roleRef.current) {
        sendCandidate(event.candidate);
      } else {
        pendingLocalCandidatesRef.current.push(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setRemoteConnected(true);
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setRemoteConnected(false);
      }
    };

    return pc;
  }, [sendCandidate]);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      setMediaError(
        "Couldn't access camera/microphone. Check permissions and try again.",
      );
      throw err;
    }
  }, []);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    remoteDescSetRef.current = false;
    addedCandidateIdsRef.current.clear();
    pendingLocalCandidatesRef.current = [];
    roleRef.current = null;
    callCodeRef.current = null;

    setRole(null);
    setCallCode(null);
    setRemoteConnected(false);
    setIsMuted(false);
    setIsCameraOff(false);
    setStage("home");
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [stage]);

  useEffect(() => {
    const pc = pcRef.current;
    if (!pc || role !== "caller") return;
    if (watchedCall?.calleeAnswer && !remoteDescSetRef.current) {
      remoteDescSetRef.current = true;
      pc.setRemoteDescription(JSON.parse(watchedCall.calleeAnswer)).then(() => {
        setStage("in-call");
      });
    }
  }, [watchedCall, role]);

  useEffect(() => {
    if (stage === "home") return;
    if (!watchedCall) return; // still loading, or already deleted
    if (watchedCall.status === "ended" && !remoteEndedHandledRef.current) {
      remoteEndedHandledRef.current = true;
      cleanup();
    }
  }, [watchedCall, stage, cleanup]);

  useEffect(() => {
    const pc = pcRef.current;
    if (!pc || !incomingCandidates) return;
    incomingCandidates.forEach((c) => {
      if (addedCandidateIdsRef.current.has(c._id)) return;
      addedCandidateIdsRef.current.add(c._id);
      pc.addIceCandidate(JSON.parse(c.candidate)).catch(() => {
      });
    });
  }, [incomingCandidates]);

  const createCall = useCallback(async () => {
    setIsCreating(true);
    setMediaError(null);
    remoteEndedHandledRef.current = false;
    try {
      const stream = await getLocalStream();
      const pc = setupPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const { callCode: newCode } = await createCallMutation({
        offer: JSON.stringify(offer),
      });

      roleRef.current = "caller";
      callCodeRef.current = newCode;
      setRole("caller");
      setCallCode(newCode);
      flushPendingCandidates();
      setStage("waiting");
    } finally {
      setIsCreating(false);
    }
  }, [
    getLocalStream,
    setupPeerConnection,
    createCallMutation,
    flushPendingCandidates,
  ]);

  const joinCall = useCallback(
    async (code: string) => {
      setIsJoining(true);
      setJoinError(null);
      setMediaError(null);
      remoteEndedHandledRef.current = false;
      try {
        const call = await convex.query(api.calls.getCallByCode, {
          callCode: code,
        });

        if (!call) {
          setJoinError("Call not found. Check the code and try again.");
          return;
        }
        if (call.status === "ended") {
          setJoinError("This call has already ended.");
          return;
        }

        roleRef.current = "callee";
        callCodeRef.current = code;

        const stream = await getLocalStream();
        const pc = setupPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(JSON.parse(call.callerOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await submitAnswerMutation({
          callCode: code,
          answer: JSON.stringify(answer),
        });

        setRole("callee");
        setCallCode(code);
        flushPendingCandidates();
        setStage("in-call");
      } catch {
        setJoinError("Something went wrong joining the call.");
      } finally {
        setIsJoining(false);
      }
    },
    [
      convex,
      getLocalStream,
      setupPeerConnection,
      submitAnswerMutation,
      flushPendingCandidates,
    ],
  );

  const endCall = useCallback(() => {
    const code = callCodeRef.current;
    remoteEndedHandledRef.current = true;
    cleanup();
    if (code) {
      endCallMutation({ callCode: code });
      setTimeout(() => {
        deleteCallMutation({ callCode: code });
      }, 3000);
    }
  }, [cleanup, endCallMutation, deleteCallMutation]);

  const cancelWaiting = useCallback(() => {
    endCall();
  }, [endCall]);

  const toggleMute = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
  }, []);

  useEffect(() => {
    return () => {
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    stage,
    callCode,
    isCreating,
    isJoining,
    joinError,
    mediaError,
    remoteConnected,
    isMuted,
    isCameraOff,
    localVideoRef,
    remoteVideoRef,
    createCall,
    joinCall,
    cancelWaiting,
    endCall,
    toggleMute,
    toggleCamera,
  };
}
