
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Ticket, respondToTicket } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TicketItemProps {
  ticket: Ticket;
  onUpdate: () => void;
}

export const TicketItem: React.FC<TicketItemProps> = ({ ticket, onUpdate }) => {
  const { user } = useAuth();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />
  };
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };
  
  const canRespond = user?.isAdmin && ticket.status === "pending";
  
  const handleRespond = async (status: "approved" | "rejected") => {
    if (!canRespond) return;
    
    try {
      setIsSubmitting(true);
      await respondToTicket(ticket.id, status, response);
      toast.success(`Ticket ${status === "approved" ? "approved" : "rejected"} successfully`);
      onUpdate();
    } catch (error) {
      console.error("Error responding to ticket:", error);
      toast.error("Failed to respond to ticket");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full border-l-4" style={{ borderLeftColor: 
      ticket.status === "pending" ? "#eab308" : 
      ticket.status === "approved" ? "#22c55e" : "#ef4444" 
    }}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ticket.title}</CardTitle>
            <CardDescription>
              Submitted on {format(new Date(ticket.createdAt), "PPP")}
            </CardDescription>
          </div>
          <Badge className={statusColors[ticket.status]} variant="outline">
            <span className="flex items-center gap-1">
              {statusIcons[ticket.status]}
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {ticket.description && (
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
            <p className="text-sm whitespace-pre-line">{ticket.description}</p>
          </div>
        )}
        
        {ticket.response && (
          <div className="mt-4 bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Response:</p>
            <p className="text-sm whitespace-pre-line">{ticket.response}</p>
          </div>
        )}
        
        {canRespond && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Respond to ticket:</p>
            <Textarea 
              value={response} 
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response here..."
              className="mb-2"
              rows={3}
            />
          </div>
        )}
      </CardContent>
      
      {canRespond && (
        <CardFooter className="flex gap-2 justify-end">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleRespond("rejected")}
            disabled={isSubmitting}
          >
            Reject
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleRespond("approved")}
            disabled={isSubmitting}
          >
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
