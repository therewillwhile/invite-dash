
import React, { useEffect, useState } from "react";
import { getAllTickets, getMyTickets, type Ticket } from "@/services/api";
import { TicketItem } from "./TicketItem";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const TicketList: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.isAdmin ? "all" : "my");

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      if (user?.isAdmin) {
        const allTickets = await getAllTickets();
        setTickets(allTickets);
      }
      
      const userTickets = await getMyTickets();
      setMyTickets(userTickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  return (
    <div className="w-full space-y-4">
      {user?.isAdmin && (
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="my">My Tickets</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tickets found
              </div>
            ) : (
              tickets
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((ticket) => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onUpdate={fetchTickets}
                  />
                ))
            )}
          </TabsContent>
          <TabsContent value="my" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading tickets...</div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You haven't submitted any tickets yet
              </div>
            ) : (
              myTickets
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((ticket) => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onUpdate={fetchTickets}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {!user?.isAdmin && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading tickets...</div>
          ) : myTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't submitted any tickets yet
            </div>
          ) : (
            myTickets
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((ticket) => (
                <TicketItem
                  key={ticket.id}
                  ticket={ticket}
                  onUpdate={fetchTickets}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
};
