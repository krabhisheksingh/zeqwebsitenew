import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Shield, User, X, Mail } from 'lucide-react';
import { findEmployee, setSession, seedInitialData, findEmployeeByEmail, getEmployee, updateEmployee, findEmployeeByIdOrUsername } from '../utils/hrStorage';
import { auth, provider } from '../utils/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
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

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({ id: '', email: '', newPassword: '', confirmPassword: '' });
  const [verifiedEmpId, setVerifiedEmpId] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);

  const handleVerifyRecovery = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const emp = await findEmployeeByIdOrUsername(forgotForm.id.trim());
      if (emp && emp.email.trim().toLowerCase() === forgotForm.email.trim().toLowerCase()) {
        if (emp.status !== 'active') {
          setForgotError('Account is deactivated. Contact HR.');
        } else {
          setVerifiedEmpId(emp.id);
          setForgotStep(2);
        }
      } else {
        setForgotError('Invalid Employee ID/Username or Email address.');
      }
    } catch (err) {
      setForgotError('Failed to verify identity.');
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    if (forgotForm.newPassword.length < 4) {
      setForgotError('Password must be at least 4 characters long.');
      return;
    }

    setForgotLoading(true);

    try {
      await updateEmployee(verifiedEmpId, { password: forgotForm.newPassword });
      toast.success('Password updated successfully!');
      setShowForgot(false);
      setForgotStep(1);
      setVerifiedEmpId('');
      setForgotForm({ id: '', email: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setForgotError('Failed to reset password.');
    }
    setForgotLoading(false);
  };

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
          role: result.role,
          employeeId: result.id,
          name: result.fullName,
          permissions: result.permissions || [],
        });
        if (result.role === 'superadmin' || result.role === 'admin') {
          navigate('/employee-login/admin');
        } else {
          navigate('/employee-login/dashboard');
        }
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const emp = await findEmployeeByEmail(user.email);
      if (emp) {
        if (emp.status !== 'active') {
          setError('Account is deactivated. Contact HR.');
          await signOut(auth);
        } else {
          setSession({
            role: emp.role,
            employeeId: emp.id,
            name: emp.fullName,
            permissions: emp.permissions || [],
          });
          if (emp.role === 'superadmin' || emp.role === 'admin') {
            navigate('/employee-login/admin');
          } else {
            navigate('/employee-login/dashboard');
          }
        }
      } else {
        setError('This Gmail is not registered in our system.');
        await signOut(auth);
      }
    } catch (err) {
      setError('Google Sign-In failed or was cancelled.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{ className: 'glass-panel', style: { background: 'rgba(10,10,15,0.8)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } }} />
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
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-accent-cyan hover:text-white transition-colors hover:underline">Forgot Password?</button>
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

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">OR</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="relative z-10">Sign in with Gmail</span>
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[10px] text-white/20 mt-8 font-mono tracking-widest uppercase">
          Zexora Quvixo HR Systems v2.0
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowForgot(false); setForgotStep(1); setForgotError(''); setVerifiedEmpId(''); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-md glass-panel rounded-3xl border border-white/10 p-8 relative overflow-hidden z-10 bg-background/80"
            >
              <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-accent-violet/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-heading font-bold text-white">Password Recovery</h3>
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setForgotStep(1); setForgotError(''); setVerifiedEmpId(''); }}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleVerifyRecovery} className="space-y-5 relative z-10">
                  <p className="text-xs text-white/50 leading-relaxed">
                    Enter your Employee ID and registered email address to verify your account identity.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Employee ID</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-cyan transition-colors" />
                      <input 
                        type="text" required placeholder="e.g. EMP001"
                        value={forgotForm.id} onChange={(e) => setForgotForm({ ...forgotForm, id: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-accent-cyan transition-all text-sm placeholder:text-white/20" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-cyan transition-colors" />
                      <input 
                        type="email" required placeholder="demo@zexoraquvixo.in"
                        value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-accent-cyan transition-all text-sm placeholder:text-white/20" 
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{forgotError}</p>
                  )}

                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-cyan text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2">
                    {forgotLoading ? (
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
                    ) : 'VERIFY IDENTITY'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5 relative z-10">
                  <p className="text-xs text-white/50 leading-relaxed">
                    Identity verified for <span className="text-accent-cyan font-semibold">{verifiedEmpId}</span>. Please choose a new secure password.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">New Password</label>
                    <div className="relative group">
                      <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-cyan transition-colors" />
                      <input 
                        type={showForgotPass ? "text" : "password"} required placeholder="••••••••"
                        value={forgotForm.newPassword} onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                        className="w-full pl-11 pr-11 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-accent-cyan transition-all text-sm placeholder:text-white/20" 
                      />
                      <button type="button" onClick={() => setShowForgotPass(!showForgotPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                        {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Confirm Password</label>
                    <div className="relative group">
                      <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-cyan transition-colors" />
                      <input 
                        type={showForgotPass ? "text" : "password"} required placeholder="••••••••"
                        value={forgotForm.confirmPassword} onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                        className="w-full pl-11 pr-11 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-accent-cyan transition-all text-sm placeholder:text-white/20" 
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{forgotError}</p>
                  )}

                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-violet to-purple-600 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2">
                    {forgotLoading ? (
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
                    ) : 'RESET PASSWORD'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
