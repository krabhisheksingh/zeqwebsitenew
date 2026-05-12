import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Shield, User, UserPlus } from 'lucide-react';
import { findEmployee, setSession, seedInitialData, registerEmployee } from '../utils/hrStorage';

const SUPER_ADMIN = {
  username: import.meta.env.VITE_ADMIN_USER || 'superadmin',
  password: import.meta.env.VITE_ADMIN_PASS || 'Admin@2025',
};

const INIT_REG = { fullName: '', department: '', designation: '', email: '', phone: '', username: '', password: '', confirmPassword: '' };

export default function HRLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState(INIT_REG);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => { seedInitialData().finally(() => setSeeding(false)); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    if (form.username === SUPER_ADMIN.username && form.password === SUPER_ADMIN.password) {
      setSession({ role: 'superadmin', username: 'superadmin', name: 'Super Admin' });
      navigate('/employee-login/admin');
      return;
    }

    try {
      const { result, reason } = await findEmployee(form.username, form.password);
      if (result) {
        setSession({ role: 'employee', username: result.username, employeeId: result.id, name: result.fullName });
        navigate('/employee-login/dashboard');
      } else {
        const msgs = {
          not_found: 'Username not found.',
          wrong_password: 'Incorrect password.',
          pending_approval: 'Your registration is pending admin approval. Please wait.',
          rejected: 'Your registration was not approved. Please contact HR.',
          inactive: 'Your account is inactive. Please contact HR.',
        };
        setError(msgs[reason] || 'Invalid credentials.');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (regForm.password !== regForm.confirmPassword) { setError('Passwords do not match.'); return; }
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { ok, msg } = await registerEmployee({
        fullName: regForm.fullName, department: regForm.department, designation: regForm.designation,
        email: regForm.email, phone: regForm.phone, username: regForm.username, password: regForm.password,
      });
      if (ok) {
        setSuccess('Registration submitted! Your account will be activated once an admin approves it.');
        setRegForm(INIT_REG);
        setTimeout(() => { setSuccess(''); setMode('login'); }, 4000);
      } else {
        setError(msg);
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
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

        {/* Tab Switch */}
        <div className="flex gap-1 bg-card/40 border border-border/30 rounded-2xl p-1 mb-4">
          <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'login' ? 'bg-accent text-white shadow-lg' : 'text-foreground/60 hover:text-foreground'}`}>
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'register' ? 'bg-accent text-white shadow-lg' : 'text-foreground/60 hover:text-foreground'}`}>
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-8">
          {seeding && <div className="text-center text-foreground/40 text-sm py-4">Connecting to server...</div>}

          {/* ── LOGIN ── */}
          {!seeding && mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input name="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required autoComplete="username" placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground outline-none focus:border-accent transition-all text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Password</label>
                <div className="relative">
                  <LogIn className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required autoComplete="current-password" placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground outline-none focus:border-accent transition-all text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</motion.p>}
              <button type="submit" disabled={loading}
                className="mt-2 w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(60,100,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
                  : <><span>Sign In</span><LogIn className="w-4 h-4" /></>}
              </button>
              <p className="text-center text-xs text-foreground/30">Employees and administrators log in here.</p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {!seeding && mode === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <p className="text-sm text-foreground/60 mb-1">Fill in your details. Your account will be reviewed and activated by an administrator.</p>
              {[
                ['Full Name', 'fullName', 'text'], ['Department', 'department', 'text'],
                ['Designation', 'designation', 'text'], ['Email', 'email', 'email'],
                ['Phone', 'phone', 'tel'], ['Username', 'username', 'text'],
              ].map(([label, field, type]) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">{label}</label>
                  <input type={type} value={regForm[field]} onChange={(e) => setRegForm({ ...regForm, [field]: e.target.value })}
                    required placeholder={label}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground outline-none focus:border-accent transition-all text-sm" />
                </div>
              ))}
              {/* Passwords side by side */}
              <div className="grid grid-cols-2 gap-3">
                {[['Password', 'password'], ['Confirm Password', 'confirmPassword']].map(([label, field]) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">{label}</label>
                    <input type="password" value={regForm[field]} onChange={(e) => setRegForm({ ...regForm, [field]: e.target.value })}
                      required placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground outline-none focus:border-accent transition-all text-sm" />
                  </div>
                ))}
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</motion.p>}
              {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">{success}</motion.p>}
              <button type="submit" disabled={loading}
                className="mt-1 w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(60,100,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
                  : <><UserPlus className="w-4 h-4" /><span>Submit Registration</span></>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
