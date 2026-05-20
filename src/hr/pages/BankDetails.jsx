import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getSession, getEmployee, updateEmployee } from '../utils/hrStorage';
import { ArrowLeft, Landmark, CreditCard, ShieldCheck, Check, Edit2, Loader2, Sparkles, Eye, EyeOff, Lock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Tilt } from 'react-tilt';

export default function BankDetails() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);

  const [form, setForm] = useState({
    holderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    branchName: '',
    upiId: ''
  });

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'employee') {
      navigate('/employee-login');
      return;
    }
    setSession(s);

    const loadData = async () => {
      try {
        const emp = await getEmployee(s.employeeId);
        if (emp) {
          setEmployee(emp);
          if (emp.bankDetails) {
            setForm({
              holderName: emp.bankDetails.holderName || '',
              bankName: emp.bankDetails.bankName || '',
              accountNumber: emp.bankDetails.accountNumber || '',
              confirmAccountNumber: emp.bankDetails.accountNumber || '',
              ifscCode: emp.bankDetails.ifscCode || '',
              branchName: emp.bankDetails.branchName || '',
              upiId: emp.bankDetails.upiId || ''
            });
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        }
      } catch (err) {
        toast.error('Failed to load bank details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (employee?.bankDetails && !employee?.allowBankEdit) {
      return toast.error('Editing is locked. Please request permission from Admin.');
    }
    if (form.accountNumber !== form.confirmAccountNumber) {
      return toast.error('Account numbers do not match');
    }
    if (form.accountNumber.length < 9) {
      return toast.error('Invalid Account Number');
    }
    if (form.ifscCode.length !== 11) {
      return toast.error('IFSC code must be exactly 11 characters');
    }

    setSaving(true);
    try {
      const bankDetails = {
        holderName: form.holderName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode.toUpperCase(),
        branchName: form.branchName,
        upiId: form.upiId
      };

      await updateEmployee(session.employeeId, { 
        bankDetails,
        allowBankEdit: false 
      });
      setEmployee({ ...employee, bankDetails, allowBankEdit: false });
      setIsEditing(false);
      toast.success('Bank details saved securely!');
    } catch (err) {
      toast.error('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const maskAccount = (acc) => {
    if (!acc) return '';
    if (showFullAccount) return acc;
    if (acc.length <= 4) return acc;
    return '•••• •••• •••• ' + acc.slice(-4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0c0d1b] to-[#17112d] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-white/40 font-heading tracking-widest text-sm uppercase">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0c0d1b] to-[#17112d] text-white flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <button 
            onClick={() => navigate('/employee-login/dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs tracking-widest uppercase font-semibold text-white/50">SECURE BANK PORTAL</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center">
        
        {/* Banner */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Landmark className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
            Secure Salary Account Setup
          </h1>
          <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
            Log your banking credentials below to ensure seamless salary disbursement and automated payslip compilation.
          </p>
        </div>

        {/* Outer Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Card Mockup Showcase (left side) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-6">
            <Tilt options={{ max: 15, scale: 1.05, speed: 400 }}>
              <div className="w-80 h-48 rounded-2xl glass-panel relative overflow-hidden p-6 flex flex-col justify-between border border-white/10 bg-gradient-to-br from-[#1d1b38] via-[#0f0e21] to-[#2b2157] shadow-[0_20px_50px_rgba(139,92,246,0.15)] group">
                {/* Gloss overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none"></div>
                
                {/* Chip and Type */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-widest text-purple-400 font-semibold uppercase">Zexora Corporate</span>
                    <span className="text-[8px] text-white/30 uppercase mt-0.5">Salary Disbursement Card</span>
                  </div>
                  <CreditCard className="w-8 h-8 text-white/20" />
                </div>

                {/* Account Number */}
                <div className="my-2 flex items-center justify-between">
                  <p className="text-lg font-mono font-semibold tracking-wider text-white">
                    {employee?.bankDetails ? maskAccount(employee.bankDetails.accountNumber) : '•••• •••• •••• ••••'}
                  </p>
                  {employee?.bankDetails && (
                    <button 
                      onClick={() => setShowFullAccount(!showFullAccount)}
                      className="text-white/40 hover:text-white transition-colors ml-2"
                      title={showFullAccount ? 'Hide account number' : 'Show account number'}
                    >
                      {showFullAccount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Card Holder & IFSC */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-white/30">Account Holder</span>
                    <span className="text-xs font-semibold text-white/80 tracking-wide uppercase truncate max-w-[130px]">
                      {employee?.bankDetails ? employee.bankDetails.holderName : session?.name || 'Your Full Name'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] uppercase tracking-wider text-white/30">Bank / IFSC</span>
                    <span className="text-xs font-semibold font-mono text-purple-400 uppercase">
                      {employee?.bankDetails ? `${employee.bankDetails.bankName.slice(0, 10)} / ${employee.bankDetails.ifscCode}` : 'IFSC Code'}
                    </span>
                  </div>
                </div>
              </div>
            </Tilt>

            {/* Shield Notice */}
            <div className="w-80 glass-panel p-4 rounded-xl border border-white/5 bg-white/5 flex gap-3 items-start">
              <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white/80">Corporate Encryption Standards</p>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                  Your financial records are encrypted. Information is solely queried during salary settlement cycles by validated system services.
                </p>
              </div>
            </div>
          </div>

          {/* Form details (right side) */}
          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              {!isEditing && employee?.bankDetails ? (
                // View Mode
                <motion.div
                  key="view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-8 rounded-3xl space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-400" /> Account Active
                    </h3>
                    {employee?.allowBankEdit ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all border border-purple-500/30 flex items-center gap-2 text-xs font-bold"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Details
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-white/40 text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 select-none">
                        <Lock className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Editing Locked
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Account Holder Name</p>
                      <p className="text-sm font-semibold text-white mt-1">{employee.bankDetails.holderName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Bank Name</p>
                      <p className="text-sm font-semibold text-white mt-1">{employee.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Account Number</p>
                      <p className="text-sm font-semibold text-white font-mono mt-1">{showFullAccount ? employee.bankDetails.accountNumber : '•••• •••• ' + employee.bankDetails.accountNumber.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">IFSC Code</p>
                      <p className="text-sm font-semibold text-white font-mono mt-1 uppercase">{employee.bankDetails.ifscCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Branch Name</p>
                      <p className="text-sm font-semibold text-white mt-1">{employee.bankDetails.branchName || 'Not Specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">UPI ID</p>
                      <p className="text-sm font-semibold text-white mt-1">{employee.bankDetails.upiId || '—'}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Edit Mode
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-8 rounded-3xl"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <h3 className="font-heading font-bold text-lg text-white">Enter Banking Credentials</h3>
                    {employee?.bankDetails && (
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-white/40 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Account Holder Name</label>
                        <input 
                          type="text" 
                          value={form.holderName} 
                          onChange={(e) => setForm({ ...form, holderName: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm" 
                          placeholder="As in bank records" 
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Bank Name</label>
                        <input 
                          type="text" 
                          value={form.bankName} 
                          onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm" 
                          placeholder="e.g. HDFC Bank" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Account Number</label>
                        <input 
                          type="password" 
                          value={form.accountNumber} 
                          onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm font-mono" 
                          placeholder="Enter account number" 
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Confirm Account Number</label>
                        <input 
                          type="text" 
                          value={form.confirmAccountNumber} 
                          onChange={(e) => setForm({ ...form, confirmAccountNumber: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm font-mono" 
                          placeholder="Re-enter account number" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">IFSC Code</label>
                        <input 
                          type="text" 
                          value={form.ifscCode} 
                          onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm font-mono uppercase" 
                          placeholder="e.g. HDFC0001234" 
                          maxLength={11}
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Branch Name</label>
                        <input 
                          type="text" 
                          value={form.branchName} 
                          onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm" 
                          placeholder="e.g. Connaught Place" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">UPI ID (Optional)</label>
                      <input 
                        type="text" 
                        value={form.upiId} 
                        onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white text-sm font-mono" 
                        placeholder="e.g. name@okhdfcbank" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={saving}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Saving Securely...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" /> Save and Verify Account
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>
    </div>
  );
}
