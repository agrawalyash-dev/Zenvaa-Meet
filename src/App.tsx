import { GithubLogoIcon, InfoIcon } from "@phosphor-icons/react";
import { StartScreen } from "@/components/start-screen";
import { WaitingRoom } from "@/components/waiting-room";
import { CallRoom } from "@/components/call-room";
import { useCall } from "@/hooks/useCall";

const App = () => {
  const {
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
  } = useCall();

  return (
    <div className="flex flex-col h-screen w-full max-w-7xl mx-auto md:border-x overflow-hidden">
      <header className="h-20 md:h-28 py-2 flex items-center justify-center border-b overflow-hidden shrink-0">
        <img className="h-full" src="/logo.png" />
      </header>

      <main className="flex-1 min-h-0">
        {stage === "home" && (
          <StartScreen
            onCreateCall={createCall}
            onJoinCall={joinCall}
            isCreating={isCreating}
            isJoining={isJoining}
            joinError={joinError ?? mediaError}
          />
        )}

        {stage === "waiting" && callCode && (
          <WaitingRoom callCode={callCode} onCancel={cancelWaiting} />
        )}

        {stage === "in-call" && callCode && (
          <CallRoom
            callCode={callCode}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            remoteConnected={remoteConnected}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onEndCall={endCall}
          />
        )}
      </main>

      <div className="h-12 flex items-center justify-between border-t px-3 sm:px-4 text-muted-foreground">
        <div className="text-xs sm:text-sm truncate">
          &copy; 2026 Zenvaa Meet{" "}
          <span className="hidden sm:inline">- By Yash Agrawal</span>
        </div>
        <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          <a
            target="_blank"
            href="https://agrawalyash.notion.site/Zenvaa-Meet-Case-Study-3a75c8bb362a809aa28ee1ea55fb54e4?pvs=74"
          >
            <InfoIcon className="size-4 sm:size-5" />
          </a>
          <a
            target="_blank"
            href="https://github.com/agrawalyash-dev/Zenvaa-Meet"
          >
            <GithubLogoIcon className="size-4 sm:size-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
