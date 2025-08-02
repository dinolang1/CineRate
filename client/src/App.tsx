import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { AuthModal } from "@/components/auth-modal";
import Home from "@/pages/home";
import MovieDetail from "@/pages/movie-detail";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import React from "react";

function Router() {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // This would typically trigger a navigation or update URL params
    // For now, we'll just update the state which can be used by the Home component
  };

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation 
        onSearch={handleSearch}
        onAuthOpen={() => setAuthModalOpen(true)}
      />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/movie/:id" component={MovieDetail} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>

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
