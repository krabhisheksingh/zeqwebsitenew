import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, Shield, User } from 'lucide-react';
import { findEmployee, setSession, seedInitialData } from '../utils/hrStorage';

seedInitialData();

const SUPER_ADMIN = {
  username: import.meta.env.VITE_ADMIN_USER || 'superadmin',
  password: import.meta.env.VITE_ADMIN_PASS || 'Admin@2025',
};

export default function HRLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (form.username === SUPER_ADMIN.username && form.password === SUPER_ADMIN.password) {
      setSession({ role: 'superadmin', username: 'superadmin', name: 'Super Admin' });
      navigate('/employee-login/admin');
    } else {
      const emp = findEmployee(form.username, form.password);
      if (emp) {
        setSession({ role: 'employee', username: emp.username, employeeId: emp.id, name: emp.fullName });
        navigate('/employee-login/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(60,100,255,0.3)]">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Portal</h1>
          <p className="text-foreground/50 mt-1 text-sm">Zexora Quvixo · HR System</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold mb-6 text-foreground">Sign in to continue</h2>

          <form onSubmit={submit} className="flex flex-col gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  name="username"
                  value={form.username}
                  onChange={handle}
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Password</label>
              <div className="relative">
                <LogIn className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(60,100,255,0.3)] hover:shadow-[0_0_30px_rgba(60,100,255,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
              ) : (
                <>Sign In <LogIn className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-foreground/30 mt-6">Both employees and administrators log in here.</p>
        </div>
      </motion.div>
    </div>
  );
}
