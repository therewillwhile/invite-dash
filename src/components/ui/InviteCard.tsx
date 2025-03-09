
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle } from "lucide-react";
import { createInvite, type Invite } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface InviteCardProps {
  invites: Invite[];
  onNewInvite: () => void;
}

export const InviteCard: React.FC<InviteCardProps> = ({ invites, onNewInvite }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const baseUrl = window.location.origin;

  const handleCreateInvite = async () => {
    if (!user) return;

    try {
      setIsCreating(true);
      await createInvite();
      onNewInvite();
      toast.success("Invite created successfully");
    } catch (error) {
      console.error("Failed to create invite:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    const inviteLink = `${baseUrl}/?invite=${code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(code);
    toast.success("Invite link copied to clipboard");
    
    setTimeout(() => {
      setCopied(null);
    }, 3000);
  };

  const availableInvites = user?.isAdmin ? "∞" : user?.inviteCount || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Invite Users</CardTitle>
        <CardDescription>
          You have {availableInvites} invite{availableInvites !== 1 && "s"} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button
            onClick={handleCreateInvite}
            className="w-full"
            disabled={!user?.isAdmin && (user?.inviteCount || 0) <= 0 || isCreating}
          >
            {isCreating ? "Creating..." : "Generate New Invite Link"}
          </Button>
        </div>
        
        {invites.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium">Your Invites</h3>
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.code}
                  className={`flex items-center gap-2 p-3 rounded-md ${
                    invite.used
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 border border-primary/20"
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center">
                      <div className="font-mono mr-2">{invite.code}</div>
                      {invite.used && <span className="text-xs">(Used)</span>}
                    </div>
                    <div className="text-xs truncate">
                      Created: {new Date(invite.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {!invite.used && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(invite.code)}
                      className="h-8 w-8"
                    >
                      {copied === invite.code ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No invites generated yet
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Note: Each user can only use one invite code
      </CardFooter>
    </Card>
  );
};
