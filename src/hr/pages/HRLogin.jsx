import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Shield, User } from 'lucide-react';
import { findEmployee, setSession, seedInitialData } from '../utils/hrStorage';

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
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    // Seed initial admin & demo employee if empty
    seedInitialData().then(() => setSeeding(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (form.username === SUPER_ADMIN.username && form.password === SUPER_ADMIN.password) {
        setSession({ role: 'superadmin', name: 'Super Admin' });
        navigate('/employee-login/admin');
        return;
      }
      
      const { result, reason } = await findEmployee(form.username, form.password);
      if (result) {
        setSession({
          role: result.role, employeeId: result.id, name: result.fullName,
        });
        navigate('/employee-login/dashboard');
      } else {
        const msgs = {
          not_found: 'Username not found.',
          wrong_password: 'Incorrect password.',
          inactive: 'Account is deactivated. Contact HR.',
        };
        setError(msgs[reason] || 'Login failed.');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Cinematic 3D Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-accent-violet/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/10 blur-[150px] mix-blend-screen opacity-60" style={{ animation: 'pulse 8s infinite alternate' }}></div>
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-accent to-accent-cyan p-0.5 shadow-[0_0_40px_rgba(79,142,247,0.4)] mb-6 relative group cursor-pointer"
          >
            <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center relative overflow-hidden">
              <Shield className="w-10 h-10 text-white/90 relative z-10" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-wide">Zexora Quvixo</h1>
          <p className="text-white/40 mt-2 tracking-widest text-sm uppercase">Global Intelligence Ecosystem</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={error ? 'error' : 'normal'}
            initial={error ? { x: [-10, 10, -10, 10, 0] } : false}
            transition={{ duration: 0.4 }}
            className={`glass-panel rounded-3xl p-8 relative overflow-hidden transition-colors duration-300 ${error ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

            {seeding ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin"></div>
                </div>
                <p className="text-white/40 font-heading text-sm uppercase tracking-widest">Initializing Core...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-6 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Employee ID / Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-cyan transition-colors" />
                    <input 
                      name="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required autoComplete="username" placeholder="e.g. EMP001"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-accent-cyan focus:bg-white/5 transition-all text-sm placeholder:text-white/20" 
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent-cyan group-focus-within:w-[80%] transition-all duration-300 opacity-0 group-focus-within:opacity-100 blur-[1px]"></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Password</label>
                  <div className="relative group">
                    <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-cyan transition-colors" />
                    <input 
                      name="password" type={showPass ? 'text' : 'password'} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required autoComplete="current-password" placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-accent-cyan focus:bg-white/5 transition-all text-sm placeholder:text-white/20" 
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent-cyan group-focus-within:w-[80%] transition-all duration-300 opacity-0 group-focus-within:opacity-100 blur-[1px]"></div>
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>
                  </motion.div>
                )}

                <div className="flex justify-between items-center px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded bg-black/40 border border-white/20 checked:bg-accent-cyan accent-accent-cyan cursor-pointer" />
                    <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">Remember me</span>
                  </label>
                  <button type="button" className="text-xs text-accent-cyan hover:text-white transition-colors hover:underline">Forgot Password?</button>
                </div>

                <button type="submit" disabled={loading}
                  className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-cyan text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all disabled:opacity-60 disabled:hover:shadow-none flex items-center justify-center gap-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  {loading ? (
                    <svg className="animate-spin w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
                  ) : (
                    <span className="relative z-10 tracking-wider">SECURE LOGIN</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[10px] text-white/20 mt-8 font-mono tracking-widest uppercase">
          Zexora Quvixo HR Systems v2.0
        </p>
      </motion.div>
    </div>
  );
}
