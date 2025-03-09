
import React from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Shield, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openWebPlayer = () => {
    window.open("https://hd.vcomputer.ru", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && (
        <header className="border-b backdrop-blur-md bg-background/70 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 
                className="text-xl font-bold cursor-pointer" 
                onClick={() => navigate("/dashboard")}
              >
                vcomputer
              </h1>
              {user?.isAdmin && (
                <Badge variant="outline" className="hidden sm:flex items-center bg-primary/10 text-primary border-primary/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Админ
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={openWebPlayer}
                className="hidden sm:flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Смотреть онлайн
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
};
