
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type User, makeAdmin } from "@/services/api";
import { ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

interface UserItemProps {
  user: User;
  onUpdate: () => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, onUpdate }) => {
  const handleMakeAdmin = async () => {
    try {
      await makeAdmin(user.id);
      toast.success(`${user.name} is now an admin`);
      onUpdate();
    } catch (error) {
      console.error("Failed to make user admin:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {user.name}
          {user.isAdmin && (
            <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </CardTitle>
        <Badge variant="outline" className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {user.inviteCount === Infinity ? "∞" : user.inviteCount} invites
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          {user.invitedUsers.length > 0 ? (
            <>
              <span className="font-medium">Invited users: </span>
              {user.invitedUsers.length}
            </>
          ) : (
            "No invited users yet"
          )}
        </div>
        {user.invitedBy && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Invited by: </span>
            {user.invitedBy}
          </div>
        )}
      </CardContent>
      {!user.isAdmin && (
        <CardFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center"
            onClick={handleMakeAdmin}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Make Admin
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
