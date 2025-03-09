
import React from "react";
import { AuthForm } from "@/components/auth/AuthForm";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/90">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Project Invite</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the platform
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
