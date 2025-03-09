
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/components/users/UserList";
import { TicketList } from "@/components/tickets/TicketList";
import { InviteCard } from "@/components/ui/InviteCard";
import { useEffect } from "react";
import { getMyInvites, type Invite } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [activeTab, setActiveTab] = useState("users");

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
            <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="invites">Invites</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6">
                <UserList />
              </TabsContent>
              <TabsContent value="tickets" className="mt-6">
                <TicketList />
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
