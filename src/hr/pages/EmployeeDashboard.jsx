import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, History, FileText, Bell, User, CheckCircle2, 
  XCircle, AlertCircle, Calendar, Home, LogOut, Menu,
  Briefcase, DollarSign, File, HelpCircle, Award, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getSession, getTodayRecord, checkIn, checkOut, startBreak, endBreak,
  getEmployeeAttendance, getEmployeeLeaves, applyLeave,
  getAnnouncements, updateEmployee, getEmployees, HOLIDAYS_2026, clearSession,
  getEmployeeTasks, addTask, getEmployeePayslips, getEmployeeDocuments,
  getEmployeeTickets, addTicket, getRecognitions
} from '../utils/hrStorage';
import { Tilt } from 'react-tilt';
import toast, { Toaster } from 'react-hot-toast';

const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }) => {
  const cfg = {
    present: 'bg-green-500/15 text-green-400 border-green-500/30',
    absent: 'bg-red-500/15 text-red-400 border-red-500/30',
    'half-day': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/15 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-medium capitalize flex items-center justify-center ${cfg[status] || 'bg-white/10 text-white/60 border-white/20'}`}>
      {status}
    </span>
  );
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [tab, setTab] = useState('overview');
  const [todayRec, setTodayRec] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [empData, setEmpData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // Forms
  const [leaveForm, setLeaveForm] = useState({ type: 'sick', fromDate: '', toDate: '', reason: '' });
  const [profileForm, setProfileForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [taskForm, setTaskForm] = useState({ name: '', category: 'Calls Made', hours: '' });
  const [ticketForm, setTicketForm] = useState({ category: 'IT Issue', subject: '', description: '', priority: 'Medium' });

  useEffect(() => {
    if (!session || session.role !== 'employee') {
      navigate('/employee-login');
      return;
    }
    refresh();
    // eslint-disable-next-line
  }, [navigate]);

  const refresh = async () => {
    setDataLoading(true);
    try {
      const [today, hist, lvs, anns, allEmps, tks, pays, docs, tckts, recs] = await Promise.all([
        getTodayRecord(session.employeeId),
        getEmployeeAttendance(session.employeeId, 30),
        getEmployeeLeaves(session.employeeId),
        getAnnouncements(),
        getEmployees(),
        getEmployeeTasks(session.employeeId),
        getEmployeePayslips(session.employeeId),
        getEmployeeDocuments(session.employeeId),
        getEmployeeTickets(session.employeeId),
        getRecognitions()
      ]);
      setTodayRec(today);
      setHistory(hist);
      setLeaves(lvs);
      setAnnouncements(anns);
      setTasks(tks);
      setPayslips(pays);
      setDocuments(docs);
      setTickets(tckts);
      setRecognitions(recs);
      setEmpData(allEmps.find((e) => e.id === session.employeeId) || null);
    } catch (err) {
      toast.error('Error loading data');
      console.error(err);
    }
    setDataLoading(false);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/employee-login');
  };

  const handleCheckIn = async () => {
    if (todayRec) return;
    await checkIn(session.employeeId, session.name);
    await refresh();
    toast.success(`Checked in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, {
      style: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const handleCheckOut = async () => {
    if (!todayRec || todayRec.checkOut) return;
    await checkOut(session.employeeId);
    await refresh();
    toast.success(`Checked out at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleStartBreak = async () => {
    if (!todayRec || todayRec.checkOut || todayRec.onBreak) return;
    await startBreak(session.employeeId);
    await refresh();
    toast('Break started ☕');
  };

  const handleEndBreak = async () => {
    if (!todayRec || !todayRec.onBreak) return;
    await endBreak(session.employeeId);
    await refresh();
    toast.success('Break ended, back to work!');
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      toast.error('Please fill all fields'); return;
    }
    try {
      await applyLeave({ ...leaveForm, employeeId: session.employeeId, employeeName: session.name });
      setLeaveForm({ type: 'sick', fromDate: '', toDate: '', reason: '' });
      await refresh();
      toast.success('Leave request submitted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit leave.');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.name || !taskForm.hours) return toast.error('Please fill all fields');
    try {
      await addTask({ ...taskForm, employeeId: session.employeeId, employeeName: session.name, status: 'Completed' });
      setTaskForm({ name: '', category: 'Calls Made', hours: '' });
      await refresh();
      toast.success('Task logged successfully!');
    } catch (err) {
      toast.error('Failed to log task');
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) return toast.error('Please fill all fields');
    try {
      await addTicket({ ...ticketForm, employeeId: session.employeeId, employeeName: session.name });
      setTicketForm({ category: 'IT Issue', subject: '', description: '', priority: 'Medium' });
      await refresh();
      toast.success('Ticket submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit ticket');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!empData) return;
    if (profileForm.oldPass !== empData.password) { toast.error('Current password incorrect'); return; }
    if (profileForm.newPass.length < 6) { toast.error('Min 6 characters required'); return; }
    if (profileForm.newPass !== profileForm.confirmPass) { toast.error('Passwords do not match'); return; }
    await updateEmployee(session.employeeId, { password: profileForm.newPass });
    setProfileForm({ oldPass: '', newPass: '', confirmPass: '' });
    await refresh();
    toast.success('Password updated successfully!');
  };

  const NAV_ITEMS = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leaves', icon: FileText },
    { id: 'tasks', label: 'Work Log', icon: Briefcase },
    { id: 'payslip', label: 'Payslips', icon: DollarSign },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'helpdesk', label: 'Help Desk', icon: HelpCircle },
    { id: 'holidays', label: 'Calendar', icon: Calendar },
    { id: 'recognition', label: 'Wall of Fame', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (!session) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{
        className: 'glass-panel',
        style: { background: 'rgba(10,10,15,0.8)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-violet/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/20 blur-[120px] mix-blend-screen opacity-50" style={{ animation: 'pulse 8s infinite alternate' }}></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed lg:relative z-50 h-full w-64 glass-panel border-r border-y-0 border-l-0 border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(79,142,247,0.5)]">
            <span className="font-bold text-white tracking-tighter">ZQ</span>
          </div>
          <h2 className="font-heading font-bold text-lg tracking-wide text-white">Zexora Quvixo</h2>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                  active ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }`}>
                {active && <motion.div layoutId="active-pill" className="absolute inset-0 border border-white/20 rounded-xl bg-white/5" />}
                <item.icon className={`w-5 h-5 z-10 transition-colors ${active ? 'text-accent-cyan' : 'group-hover:text-white/80'}`} />
                <span className="z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-semibold border border-red-500/20">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 px-6 flex items-center justify-between glass-panel border-b border-x-0 border-t-0 border-border z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 capitalize">
              {NAV_ITEMS.find(n => n.id === tab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div onClick={() => setTab('announcements')} className="relative cursor-pointer hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center">
                <Bell className="w-5 h-5 text-white/70" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-white">{session.name}</p>
                <p className="text-xs text-white/40">{empData?.designation || 'Employee'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-violet to-accent-cyan p-0.5">
                <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                  <User className="w-5 h-5 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {dataLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin"></div>
              </div>
              <p className="text-white/40 font-heading tracking-widest text-sm uppercase">Loading Ecosystem...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-8 pb-20">
                
                {/* ── OVERVIEW TAB ── */}
                {tab === 'overview' && (
                  <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Good Morning, {session.name.split(' ')[0]} <span className="inline-block animate-bounce">👋</span></h2>
                        <p className="text-white/60">Ready to conquer the day? Here is your summary.</p>
                      </div>
                      <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-accent/20 to-transparent pointer-events-none"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Present Days', val: history.filter(h => h.status === 'present').length, icon: CheckCircle2, color: 'text-green-400' },
                        { label: 'Pending Leaves', val: leaves.filter(l => l.status === 'pending').length, icon: FileText, color: 'text-yellow-400' },
                        { label: 'Unread Notifications', val: 3, icon: Bell, color: 'text-red-400' },
                        { label: 'Tasks Completed', val: 12, icon: Briefcase, color: 'text-accent-cyan' },
                      ].map((s, i) => (
                        <Tilt key={i} options={{ max: 15, scale: 1.05, speed: 400 }}>
                          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group cursor-pointer">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">{s.label}</p>
                              <p className={`text-3xl font-heading font-bold ${s.color}`}>{s.val}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                              <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                          </div>
                        </Tilt>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                        <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-accent"/> Today's Shift</h3>
                        {todayRec ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                              <div>
                                <p className="text-sm text-white/50">Checked In At</p>
                                <p className="text-xl font-bold text-green-400">{fmt(todayRec.checkIn)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-white/50">Status</p>
                                <p className="text-xl font-bold text-white">{todayRec.onBreak ? '☕ On Break' : '👨‍💻 Working'}</p>
                              </div>
                            </div>
                            {!todayRec.checkOut && (
                              <div className="flex gap-4">
                                <button onClick={todayRec.onBreak ? handleEndBreak : handleStartBreak} className="flex-1 py-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold hover:bg-yellow-500/30 transition-all text-sm">
                                  {todayRec.onBreak ? 'RESUME WORK' : 'START BREAK'}
                                </button>
                                <button onClick={handleCheckOut} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold hover:bg-red-500/30 transition-all text-sm flex items-center justify-center gap-2">
                                  <XCircle className="w-4 h-4" /> CHECK OUT
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
                            <p className="text-white/50 mb-4">You haven't checked in yet today.</p>
                            <button onClick={handleCheckIn} className="px-8 py-3 rounded-full bg-accent text-white font-bold hover:shadow-[0_0_20px_rgba(79,142,247,0.4)] transition-all transform hover:scale-105">
                              Check In Now
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-accent-violet"/> Recent Activity</h3>
                        <div className="space-y-4">
                          {announcements.slice(0,3).map(a => (
                            <div key={a.id} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                              <p className="text-sm font-medium text-white">{a.title}</p>
                              <p className="text-xs text-white/40 mt-1">{fmtDate(a.postedAt)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ATTENDANCE TAB ── */}
                {tab === 'attendance' && (
                  <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                      <div>
                        <h3 className="text-4xl font-heading font-bold text-white">{new Date().toLocaleTimeString()}</h3>
                        <p className="text-white/50 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {!todayRec && (
                          <button onClick={handleCheckIn} className="px-8 py-4 rounded-2xl bg-green-500/20 text-green-400 border border-green-500/30 font-bold hover:bg-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5"/> INITIATE CHECK-IN
                          </button>
                        )}
                        {todayRec && !todayRec.checkOut && (
                          <>
                            <button onClick={todayRec.onBreak ? handleEndBreak : handleStartBreak} className="px-6 py-4 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold hover:bg-yellow-500/30 transition-all flex items-center gap-2">
                              {todayRec.onBreak ? 'RESUME WORK' : 'START BREAK'}
                            </button>
                            <button onClick={handleCheckOut} className="px-8 py-4 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2">
                              <XCircle className="w-5 h-5"/> CHECK-OUT
                            </button>
                          </>
                        )}
                        {todayRec?.checkOut && (
                          <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-bold">SHIFT COMPLETED</div>
                        )}
                      </div>
                    </div>

                    <div className="glass-panel rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-white/10">
                        <h3 className="font-heading font-bold text-lg">Attendance Log (Last 30 Days)</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Date</th>
                              <th className="px-6 py-4 font-semibold">Check In</th>
                              <th className="px-6 py-4 font-semibold">Check Out</th>
                              <th className="px-6 py-4 font-semibold">Hours</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {history.length === 0 ? (
                              <tr><td colSpan="5" className="p-8 text-center text-white/40">No records found.</td></tr>
                            ) : history.map((r, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{fmtDate(r.date)}</td>
                                <td className="px-6 py-4 text-green-400">{fmt(r.checkIn)}</td>
                                <td className="px-6 py-4 text-red-400">{r.checkOut ? fmt(r.checkOut) : '—'}</td>
                                <td className="px-6 py-4 text-white/70">{r.totalHours ? `${r.totalHours}h` : '—'}</td>
                                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LEAVES TAB ── */}
                {tab === 'leave' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="font-heading font-bold text-lg mb-6 text-white">Apply for Leave</h3>
                        <form onSubmit={handleLeaveSubmit} className="flex flex-col gap-5">
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Leave Type</label>
                            <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm appearance-none">
                              <option value="sick">Sick Leave</option>
                              <option value="casual">Casual Leave</option>
                              <option value="earned">Earned Leave</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">From Date</label>
                            <input type="date" value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" required style={{colorScheme: 'dark'}}/>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">To Date</label>
                            <input type="date" value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" required style={{colorScheme: 'dark'}}/>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Reason</label>
                            <textarea rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm resize-none" placeholder="Brief reason..." required />
                          </div>
                          <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-violet text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                            Submit Request
                          </button>
                        </form>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden h-fit">
                      <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-heading font-bold text-lg text-white">My Leave Requests</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Type</th>
                              <th className="px-6 py-4 font-semibold">Dates</th>
                              <th className="px-6 py-4 font-semibold">Reason</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {leaves.length === 0 ? (
                              <tr><td colSpan="4" className="p-8 text-center text-white/40">No leave requests found.</td></tr>
                            ) : leaves.map((l, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white capitalize">{l.type}</td>
                                <td className="px-6 py-4 text-white/70">{fmtDate(l.fromDate)} <span className="text-white/30 mx-1">→</span> {fmtDate(l.toDate)}</td>
                                <td className="px-6 py-4 text-white/60 max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                                <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── HOLIDAYS TAB ── */}
                {tab === 'holidays' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-accent/10 to-transparent">
                      <h3 className="font-heading font-bold text-xl text-white">Official Holidays 2026</h3>
                      <p className="text-white/50 text-sm mt-1">Zexora Quvixo India Calendar</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Festival / Occasion</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Day</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {HOLIDAYS_2026.map((h, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white text-base">{h.name}</td>
                              <td className="px-6 py-4 text-accent-cyan font-mono">{h.date}</td>
                              <td className="px-6 py-4 text-white/60">{h.day}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── TASKS TAB ── */}
                {tab === 'tasks' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="font-heading font-bold text-lg mb-6 text-white">Log Work Task</h3>
                        <form onSubmit={handleTaskSubmit} className="flex flex-col gap-5">
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Task Name</label>
                            <input type="text" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="e.g. Followed up with 10 leads" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Category</label>
                            <select value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm appearance-none">
                              <option value="Calls Made">Calls Made</option>
                              <option value="Leads Generated">Leads Generated</option>
                              <option value="Emails Sent">Emails Sent</option>
                              <option value="Meetings">Meetings</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Time Spent (Hours)</label>
                            <input type="number" step="0.5" value={taskForm.hours} onChange={(e) => setTaskForm({ ...taskForm, hours: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="e.g. 2.5" required />
                          </div>
                          <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                            Log Task
                          </button>
                        </form>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden h-fit">
                      <div className="p-6 border-b border-white/10">
                        <h3 className="font-heading font-bold text-lg text-white">Today's Logged Tasks</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Task</th>
                              <th className="px-6 py-4 font-semibold">Category</th>
                              <th className="px-6 py-4 font-semibold">Hours</th>
                              <th className="px-6 py-4 font-semibold">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {tasks.length === 0 ? (
                              <tr><td colSpan="4" className="p-8 text-center text-white/40">No tasks logged today.</td></tr>
                            ) : tasks.map((t, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{t.name}</td>
                                <td className="px-6 py-4 text-white/60"><span className="px-3 py-1 rounded-full border border-white/10 text-xs bg-white/5">{t.category}</span></td>
                                <td className="px-6 py-4 text-accent-cyan">{t.hours}h</td>
                                <td className="px-6 py-4 text-white/40">{fmt(t.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PAYSLIP TAB ── */}
                {tab === 'payslip' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400"/> Salary Slips</h3>
                      <p className="text-white/40 text-sm">Download your monthly payslips</p>
                    </div>
                    <div className="p-8">
                      {payslips.length === 0 ? (
                        <div className="text-center py-12">
                          <DollarSign className="w-12 h-12 text-white/10 mx-auto mb-4" />
                          <p className="text-white/40">No payslips have been generated for your account yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {payslips.map((p, i) => (
                            <Tilt key={i} options={{ max: 5, scale: 1.02 }}>
                              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-400/30 hover:bg-green-400/5 transition-all group">
                                <h4 className="text-xl font-heading font-bold text-white mb-1">{p.month} {p.year}</h4>
                                <p className="text-green-400 font-mono text-lg mb-4">₹{p.netPay?.toLocaleString()}</p>
                                <button className="w-full py-3 rounded-xl bg-white/5 text-white/80 font-medium group-hover:bg-green-400/20 group-hover:text-green-300 transition-all border border-white/10 flex items-center justify-center gap-2">
                                  <FileText className="w-4 h-4"/> Download PDF
                                </button>
                              </div>
                            </Tilt>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── DOCUMENTS TAB ── */}
                {tab === 'documents' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-panel p-6 rounded-3xl text-center border-dashed border-2 border-white/20 hover:border-accent-cyan/50 transition-colors cursor-pointer group">
                        <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/10 group-hover:scale-110 transition-all">
                          <File className="w-8 h-8 text-white/40 group-hover:text-accent-cyan" />
                        </div>
                        <h4 className="text-white font-bold mb-1">Upload Document</h4>
                        <p className="text-xs text-white/40 mb-4">Click to browse or drag & drop (PDF/IMG)</p>
                        <button className="px-6 py-2 rounded-full bg-white/10 text-white/80 font-medium text-sm group-hover:bg-accent-cyan/20 group-hover:text-accent-cyan transition-colors border border-white/10">Browse Files</button>
                      </div>
                    </div>
                    <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden h-fit">
                      <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">My Documents</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Document Name</th>
                              <th className="px-6 py-4 font-semibold">Uploaded</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                              <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {documents.length === 0 ? (
                              <tr><td colSpan="4" className="p-8 text-center text-white/40">No documents uploaded.</td></tr>
                            ) : documents.map((d, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-accent-cyan" /> {d.name}
                                </td>
                                <td className="px-6 py-4 text-white/60">{fmtDate(d.uploadedAt)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs rounded border ${d.status === 'verified' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                    {d.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button className="text-accent hover:text-accent-cyan underline text-xs">View</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── HELPDESK TAB ── */}
                {tab === 'helpdesk' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="font-heading font-bold text-lg mb-6 text-white">Raise a Ticket</h3>
                        <form onSubmit={handleTicketSubmit} className="flex flex-col gap-5">
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Category</label>
                            <select value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm appearance-none">
                              <option value="IT Issue">IT Issue</option>
                              <option value="HR Query">HR Query</option>
                              <option value="Salary / Payroll">Salary / Payroll</option>
                              <option value="General">General</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Subject</label>
                            <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="Brief subject" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Description</label>
                            <textarea rows={3} value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm resize-none" placeholder="Explain your issue..." required />
                          </div>
                          <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-violet text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                            Submit Ticket
                          </button>
                        </form>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden h-fit">
                      <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">My Support Tickets</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                            <tr>
                              <th className="px-6 py-4 font-semibold">ID</th>
                              <th className="px-6 py-4 font-semibold">Subject</th>
                              <th className="px-6 py-4 font-semibold">Category</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {tickets.length === 0 ? (
                              <tr><td colSpan="4" className="p-8 text-center text-white/40">No tickets raised.</td></tr>
                            ) : tickets.map((t, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                                <td className="px-6 py-4 font-mono text-accent-cyan text-xs">#{t.id.slice(0,6)}</td>
                                <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{t.subject}</td>
                                <td className="px-6 py-4 text-white/60">{t.category}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs rounded border capitalize ${t.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : t.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── RECOGNITION WALL ── */}
                {tab === 'recognition' && (
                  <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-transparent">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                      <h2 className="text-3xl font-heading font-bold text-white mb-2 flex items-center gap-3">
                        <Award className="w-8 h-8 text-yellow-400" /> Wall of Fame
                      </h2>
                      <p className="text-white/60">Celebrating our top performers and milestones at Zexora Quvixo.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recognitions.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-white/40 glass-panel rounded-3xl">No recognitions yet. Keep up the great work!</div>
                      ) : recognitions.map((r, i) => (
                        <Tilt key={i} options={{ max: 10, scale: 1.02 }}>
                          <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden group">
                            <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 transition-colors pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                <Award className="w-6 h-6 text-yellow-400" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-lg">{r.employeeName}</h4>
                                <p className="text-xs text-yellow-400 font-mono tracking-wider">{r.badgeTitle}</p>
                              </div>
                            </div>
                            <p className="text-white/70 text-sm italic">"{r.message}"</p>
                            <p className="text-right text-xs text-white/30 mt-4">{fmtDate(r.awardedAt)}</p>
                          </div>
                        </Tilt>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── ANNOUNCEMENTS TAB ── */}
                {tab === 'announcements' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {announcements.length === 0 ? (
                      <div className="col-span-full p-12 text-center text-white/40 glass-panel rounded-3xl">No announcements yet.</div>
                    ) : announcements.map((a) => (
                      <Tilt key={a.id} options={{ max: 5, scale: 1.02 }}>
                        <div className="glass-panel p-8 rounded-3xl h-full flex flex-col relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/10 rounded-full blur-[40px] pointer-events-none"></div>
                          <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                            <h4 className="font-heading font-bold text-xl text-white">{a.title}</h4>
                            <span className="text-xs font-mono text-accent-cyan px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 shrink-0">{fmtDate(a.postedAt)}</span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed relative z-10 flex-1">{a.body}</p>
                        </div>
                      </Tilt>
                    ))}
                  </div>
                )}

                {/* ── PROFILE TAB ── */}
                {tab === 'profile' && empData && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 glass-panel p-8 rounded-3xl text-center relative overflow-hidden">
                      <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent/20 blur-[60px] pointer-events-none mix-blend-screen"></div>
                      <div className="w-32 h-32 mx-auto rounded-full glass-panel border-4 border-white/10 flex items-center justify-center mb-6 relative z-10 overflow-hidden bg-black/40">
                        <User className="w-16 h-16 text-white/50" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-white relative z-10">{empData.fullName}</h3>
                      <p className="text-accent-cyan font-medium mb-6 relative z-10">{empData.designation}</p>
                      
                      <div className="space-y-4 text-left relative z-10">
                        {[
                          ['Employee ID', empData.id],
                          ['Department', empData.department],
                          ['Email', empData.email],
                          ['Phone', empData.phone]
                        ].map(([label, val]) => (
                          <div key={label} className="bg-black/30 p-3 rounded-xl border border-white/5">
                            <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{label}</p>
                            <p className="text-sm text-white font-medium">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl h-fit">
                      <h3 className="text-xl font-heading font-bold text-white mb-6">Security Settings</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                        {[['Current Password', 'oldPass'], ['New Password', 'newPass'], ['Confirm New Password', 'confirmPass']].map(([label, field]) => (
                          <div key={field} className="space-y-1.5 relative">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">{label}</label>
                            <div className="relative">
                              <input type={showPass ? "text" : "password"} value={profileForm[field]} onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-accent text-white text-sm" placeholder="••••••••" required />
                              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                                {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button type="submit" className="px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20">
                          Update Password
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
