import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightIcon, VideoCameraIcon } from "@phosphor-icons/react";

interface StartScreenProps {
  onCreateCall: () => void;
  onJoinCall: (callCode: string) => void;
  isCreating?: boolean;
  isJoining?: boolean;
  joinError?: string | null;
}

export function StartScreen({
  onCreateCall,
  onJoinCall,
  isCreating,
  isJoining,
  joinError,
}: StartScreenProps) {
  const [code, setCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) onJoinCall(code.trim().toUpperCase());
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Start a call</CardTitle>
          <CardDescription>
            Create a new call or join one with a call code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1">
                Create
              </TabsTrigger>
              <TabsTrigger value="join" className="flex-1">
                Join
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4">
              <Button
                onClick={onCreateCall}
                disabled={isCreating}
                className="w-full"
              >
                <VideoCameraIcon className="size-4" />
                {isCreating ? "Creating call…" : "Start new call"}
              </Button>
            </TabsContent>

            <TabsContent value="join" className="mt-4">
              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <Input
                  placeholder="Enter call code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoCapitalize="characters"
                  autoComplete="off"
                />
                {joinError && (
                  <p className="text-sm text-destructive">{joinError}</p>
                )}
                <Button
                  type="submit"
                  disabled={!code.trim() || isJoining}
                  className="w-full"
                >
                  {isJoining ? "Joining…" : "Join call"}
                  <ArrowRightIcon className="size-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
