import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, CopyIcon, XIcon } from "@phosphor-icons/react";

interface WaitingRoomProps {
  callCode: string;
  onCancel: () => void;
}

export function WaitingRoom({ callCode, onCancel }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(callCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Call created</CardTitle>
          <CardDescription>
            Share this code with the other person.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center justify-between rounded-md border px-4 py-3 font-mono text-lg tracking-widest hover:bg-accent transition-colors"
          >
            {callCode}
            {copied
              ? <CheckIcon className="size-4 shrink-0" />
              : <CopyIcon className="size-4 shrink-0 text-muted-foreground" />}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Waiting for the other person to join…
          </div>

          <Button variant="outline" onClick={onCancel}>
            <XIcon className="size-4" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
