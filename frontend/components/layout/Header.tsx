'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              AW
            </div>
            <span className="ml-2 text-xl font-bold text-primary hidden sm:inline-block">
              AgriWaste
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink href="/" active={isActive('/')}>
            Accueil
          </NavLink>
          <NavLink href="/catalog" active={isActive('/catalog')}>
            Catalogue
          </NavLink>
          <NavLink href="/marketplace" active={isActive('/marketplace')}>
            Marketplace
          </NavLink>
          <NavLink href="/about" active={isActive('/about')}>
            À Propos
          </NavLink>
        </nav>

        {/* Authentication Buttons */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    {user?.profile_picture && (
                      <AvatarImage src={user.profile_picture} alt={user.username} />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Tableau de Bord</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" className="font-medium">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Inscription
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden ml-2"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-primary text-xl">AgriWaste</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4">
                <MobileNavLink href="/" active={isActive('/')}>Accueil</MobileNavLink>
                <MobileNavLink href="/catalog" active={isActive('/catalog')}>Catalogue</MobileNavLink>
                <MobileNavLink href="/marketplace" active={isActive('/marketplace')}>Marketplace</MobileNavLink>
                <MobileNavLink href="/about" active={isActive('/about')}>À Propos</MobileNavLink>

                <div className="pt-4 border-t border-border">
                  {isAuthenticated ? (
                    <>
                      <MobileNavLink href="/dashboard" active={isActive('/dashboard')}>Tableau de Bord</MobileNavLink>
                      <MobileNavLink href="/profile" active={isActive('/profile')}>Profil</MobileNavLink>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 rounded-md text-destructive hover:bg-muted transition-colors"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 mt-2">
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Connexion
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Inscription
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

// Desktop Nav Link component
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative px-3 py-2 rounded-md text-sm font-medium transition-colors">
      <span className={active ? 'text-primary' : 'text-foreground hover:text-primary'}>{children}</span>
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-3"
          layoutId="activeNavIndicator"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

// Mobile Nav Link component
function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`px-4 py-2 rounded-md transition-colors ${
        active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
      }`}
    >
      {children}
    </Link>
  );
} 