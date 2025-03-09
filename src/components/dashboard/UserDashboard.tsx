
import React, { useEffect, useState } from "react";
import { getMyInvites, getMyTickets, type Invite, type Ticket } from "@/services/api";
import { InviteCard } from "@/components/ui/InviteCard";
import { TicketForm } from "@/components/tickets/TicketForm";
import { TicketList } from "@/components/tickets/TicketList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [activeTab, setActiveTab] = useState("tickets");

  const fetchInvites = async () => {
    try {
      const userInvites = await getMyInvites();
      setInvites(userInvites);
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col gap-8">
        <Card className="glass-panel animate-in shadow-lg border border-border/30">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">User Dashboard</CardTitle>
            <CardDescription>
              Welcome back, {user?.name}!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="invites">Invites</TabsTrigger>
              </TabsList>
              <TabsContent value="tickets" className="mt-6 space-y-6">
                <TicketForm onTicketCreated={() => {}} />
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Your Tickets</h3>
                  <TicketList />
                </div>
              </TabsContent>
              <TabsContent value="invites" className="mt-6">
                <InviteCard invites={invites} onNewInvite={fetchInvites} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
