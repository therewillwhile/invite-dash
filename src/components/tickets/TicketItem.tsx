
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { respondToTicket, type Ticket, type User } from "@/services/api";
import { Check, X, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface TicketItemProps {
  ticket: Ticket;
  user?: User | null;
  onStatusChange: () => void;
}

export const TicketItem: React.FC<TicketItemProps> = ({
  ticket,
  user,
  onStatusChange,
}) => {
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject">("approve");
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const handleDialogOpen = (mode: "approve" | "reject") => {
    setDialogMode(mode);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await respondToTicket(ticket.id, dialogMode, response);
      toast.success(
        `Ticket ${dialogMode === "approve" ? "approved" : "rejected"} successfully`
      );
      setIsDialogOpen(false);
      setResponse("");
      onStatusChange();
    } catch (error) {
      console.error("Failed to respond to ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{ticket.title}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
          {getStatusBadge()}
        </CardHeader>
        
        {ticket.description && (
          <CardContent className="pb-2">
            <p className="text-sm">{ticket.description}</p>
          </CardContent>
        )}
        
        {ticket.response && (
          <CardContent className="pb-2 pt-0">
            <div className="bg-muted p-3 rounded-md mt-2">
              <div className="text-xs font-semibold mb-1 flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                Response:
              </div>
              <p className="text-sm">{ticket.response}</p>
            </div>
          </CardContent>
        )}
        
        {currentUser?.isAdmin && ticket.status === "pending" && (
          <CardFooter className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
              onClick={() => handleDialogOpen("approve")}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              onClick={() => handleDialogOpen("reject")}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "approve" ? "Approve" : "Reject"} Ticket
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "approve"
                ? "Add an optional message for the user."
                : "Please provide a reason for rejecting this request."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Ticket: {ticket.title}</p>
            </div>
            <Textarea
              placeholder={
                dialogMode === "approve"
                  ? "Optional message for the user"
                  : "Reason for rejection"
              }
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              required={dialogMode === "reject"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={dialogMode === "reject" && !response.trim() || isSubmitting}
              className={
                dialogMode === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting ? "Processing..." : dialogMode === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
