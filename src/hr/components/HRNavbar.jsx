import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, User } from 'lucide-react';
import { getSession, clearSession } from '../utils/hrStorage';

export default function HRNavbar({ title }) {
  const navigate = useNavigate();
  const session = getSession();

  const logout = () => {
    clearSession();
    navigate('/employee-login');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-accent" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">Zexora HR</span>
          {title && <span className="text-foreground/40 text-sm ml-2">/ {title}</span>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-foreground/60">
          <User className="w-4 h-4" />
          <span>{session?.name}</span>
          {session?.role === 'superadmin' && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/30">Admin</span>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-foreground/60 hover:text-red-500 transition-colors border border-border/40 hover:border-red-500/40 px-3 py-1.5 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
