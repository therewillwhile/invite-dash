import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Apple, Smartphone, ExternalLink } from "lucide-react";

const Index: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const openWebPlayer = () => {
    window.open("https://hd.vcomputer.ru", "_blank");
  };

  const openAppleApp = () => {
    window.open("https://apps.apple.com/us/app/swiftfin/id1604098728", "_blank");
  };

  const openAndroidApp = () => {
    window.open("https://play.google.com/store/apps/details?id=org.jellyfin.androidtv&hl=ru", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/90">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={openWebPlayer}
            className="flex gap-2 items-center"
            variant="outline"
          >
            <ExternalLink size={16} />
            Смотреть онлайн
          </Button>
          <Button
            onClick={openAppleApp}
            className="flex gap-2 items-center"
            variant="outline"
          >
            <Apple size={16} />
            iOS приложение
          </Button>
          <Button
            onClick={openAndroidApp}
            className="flex gap-2 items-center"
            variant="outline"
          >
            <Smartphone size={16} />
            Android приложение
          </Button>
        </div>
        
        <div className="text-center mb-8 animate-in">
          <h1 className="text-4xl font-bold mb-2">vcomputer</h1>
          <p className="text-muted-foreground">
            Приватный онлайн кинотеатр
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
