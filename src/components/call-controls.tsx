import { Button } from "@/components/ui/button";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneDisconnectIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from "@phosphor-icons/react";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button
        size="icon"
        variant={isMuted ? "default" : "outline"}
        onClick={onToggleMute}
        className="size-11 rounded-full"
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted
          ? <MicrophoneSlashIcon className="size-5" />
          : <MicrophoneIcon className="size-5" />}
      </Button>

      <Button
        size="icon"
        variant={isCameraOff ? "default" : "outline"}
        onClick={onToggleCamera}
        className="size-11 rounded-full"
        aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
      >
        {isCameraOff
          ? <VideoCameraSlashIcon className="size-5" />
          : <VideoCameraIcon className="size-5" />}
      </Button>

      <Button
        size="icon"
        variant="destructive"
        onClick={onEndCall}
        className="size-11 rounded-full"
        aria-label="End call"
      >
        <PhoneDisconnectIcon className="size-5" />
      </Button>
    </div>
  );
}
