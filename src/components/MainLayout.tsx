"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, LogOut, LayoutDashboard, ClipboardList, UserPlus, User } from 'lucide-react';
import Logo from '@/components/Logo';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { session, username, userRole, logout, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsSheetOpen(false); // Fecha o sheet após o logout
  };

  const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-primary dark:text-gray-50 dark:hover:text-primary">
      {icon}
      {label}
    </Link>
  );

  const sidebarContent = (
    <div className="flex h-full max-h-screen flex-col gap-4 p-4">
      <div className="flex h-16 items-center justify-center border-b px-4 lg:px-6">
        <Logo />
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-2 text-sm font-medium lg:px-4">
          {username && (
            <div className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              <span>{username} ({userRole})</span>
            </div>
          )}
          <NavLink to="/service-orders" icon={<ClipboardList className="h-4 w-4" />} label="Ordens de Serviço" onClick={() => setIsSheetOpen(false)} />
          {userRole === 'technician' && (
            <NavLink to="/technician-dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Minhas Ordens" onClick={() => setIsSheetOpen(false)} />
          )}
          {userRole === 'admin' && (
            <NavLink to="/register-technician" icon={<UserPlus className="h-4 w-4" />} label="Cadastrar Técnico" onClick={() => setIsSheetOpen(false)} />
          )}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button onClick={handleLogout} className="w-full" variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Redirecionamento é tratado pelo AuthContext
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        {sidebarContent}
      </div>
      {/* Mobile Header and Content */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6 md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px] sm:w-[320px] p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center">
            <Logo />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;