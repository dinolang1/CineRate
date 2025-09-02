import React from "react";
import { Link, useLocation } from "wouter";
import { Film, Home, Star, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authService } from "@/lib/auth";

interface NavigationProps {
  onAuthOpen?: () => void;
}

export function Navigation({ onAuthOpen }: NavigationProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [authState, setAuthState] = React.useState(authService.getAuthState());

  // Slušaj promjene u auth state
  React.useEffect(() => {
    const unsubscribe = authService.onAuthChange(() => {
      setAuthState(authService.getAuthState());
    });
    
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/profile", label: "My Reviews", icon: Star },
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant="ghost"
              className={`
                ${mobile ? 'justify-start w-full' : ''} 
                text-gray-300 hover:text-yellow-400 hover:bg-gray-800
                ${isActive ? 'text-yellow-400 bg-gray-800' : ''}
              `}
              onClick={() => mobile && setIsOpen(false)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 text-yellow-400 font-bold text-xl">
              <Film className="w-6 h-6" />
              <span>CineRate</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* User Profile or Login */}
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 hover:bg-transparent">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={authState.user?.profilePicture || undefined} />
                      <AvatarFallback className="bg-yellow-400 text-black">
                        {authState.user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{authState.user?.username}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={onAuthOpen}
                className="bg-yellow-400 text-black hover:bg-yellow-500"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-gray-300">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-gray-700">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile={true} />

                  {!authState.isAuthenticated && (
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        onAuthOpen?.();
                      }}
                      className="bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
