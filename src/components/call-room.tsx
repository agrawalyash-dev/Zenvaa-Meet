import { type RefObject } from "react";
import { UserIcon } from "@phosphor-icons/react";
import { CallControls } from "@/components/call-controls";

interface CallRoomProps {
  callCode: string;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  remoteConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

export function CallRoom({
  callCode,
  localVideoRef,
  remoteVideoRef,
  remoteConnected,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}: CallRoomProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 min-h-0">
        <div className="relative rounded-lg border bg-muted overflow-hidden min-h-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {!remoteConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-accent">
              <UserIcon className="size-8" />
              <p className="text-sm">Waiting for {callCode} to connect…</p>
            </div>
          )}
        </div>

        <div className="relative rounded-lg border bg-muted overflow-hidden min-h-0">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-xs">
            You
          </span>
        </div>
      </div>

      <CallControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={onToggleMute}
        onToggleCamera={onToggleCamera}
        onEndCall={onEndCall}
      />
    </div>
  );
}
