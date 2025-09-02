import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { queryClient } from "./lib/queryClient";
import { socketService } from "./lib/socket";
import Home from "@/pages/home";
import MovieDetail from "@/pages/movie-detail";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  React.useEffect(() => {
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    // Ne trebaš reload, authService će poslati event
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navigation 
        onAuthOpen={() => setAuthModalOpen(true)}
      />
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/movie/:id" component={MovieDetail} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
