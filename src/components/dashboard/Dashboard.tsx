
import React from "react";
import { AdminDashboard } from "./AdminDashboard";
import { UserDashboard } from "./UserDashboard";
import { useAuth } from "@/context/AuthContext";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return user.isAdmin ? <AdminDashboard /> : <UserDashboard />;
};
