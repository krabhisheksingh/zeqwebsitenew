import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, FileText, Download, CheckCircle2, 
  XCircle, Bell, Calendar, Home, LogOut, Menu,
  Briefcase, DollarSign, File, HelpCircle, Award, ShieldAlert, Clock, Plus, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getSession, getEmployees, getAttendance, getLeaves,
  getAnnouncements, updateLeaveStatus, addAnnouncement,
  exportAttendanceCSV, getDashboardStats, HOLIDAYS_2026, clearSession,
  getAllTasks, getAllTickets, updateTicketStatus, getAllDocuments, updateDocumentStatus,
  getAllPayslips, addPayslip, addRecognition, getRecognitions, addEmployee, updateEmployee
} from '../utils/hrStorage';
import { Tilt } from 'react-tilt';
import toast, { Toaster } from 'react-hot-toast';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

const StatusBadge = ({ status }) => {
  const cfg = {
    present: 'bg-green-500/15 text-green-400 border-green-500/30',
    absent: 'bg-red-500/15 text-red-400 border-red-500/30',
    'half-day': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/15 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    inactive: 'bg-white/10 text-white/50 border-white/20',
    open: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
    verified: 'bg-green-500/15 text-green-400 border-green-500/30',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium capitalize flex items-center justify-center max-w-min ${cfg[status] || 'bg-white/10 text-white/60 border-white/20'}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [tab, setTab] = useState('overview');
  
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Forms
  const [annForm, setAnnForm] = useState({ title: '', body: '' });
  const [payForm, setPayForm] = useState({ employeeId: '', month: '', year: new Date().getFullYear(), netPay: '' });
  const [recForm, setRecForm] = useState({ employeeId: '', badgeTitle: 'Star Performer', message: '' });
  const [empForm, setEmpForm] = useState({ id: '', fullName: '', email: '', phone: '', department: 'Engineering', designation: '', password: '' });
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editEmpForm, setEditEmpForm] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!session || session.role !== 'superadmin') {
      navigate('/employee-login');
      return;
    }
    refresh();
  }, [navigate]);

  const refresh = async () => {
    setDataLoading(true);
    try {
      const [st, emps, att, lvs, anns, tks, tkts, docs, pays, recs] = await Promise.all([
        getDashboardStats(), getEmployees(), getAttendance(), getLeaves(), getAnnouncements(),
        getAllTasks(), getAllTickets(), getAllDocuments(), getAllPayslips(), getRecognitions()
      ]);
      setStats(st); setEmployees(emps); setAttendance(att); setLeaves(lvs); setAnnouncements(anns);
      setTasks(tks); setTickets(tkts); setDocuments(docs); setPayslips(pays); setRecognitions(recs);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
    setDataLoading(false);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/employee-login');
  };

  const handleLeaveAction = async (id, status) => {
    await updateLeaveStatus(id, status);
    toast.success(`Leave ${status}`);
    refresh();
  };

  const handleTicketAction = async (id, status) => {
    await updateTicketStatus(id, status);
    toast.success(`Ticket marked as ${status}`);
    refresh();
  };

  const handleDocAction = async (id, status) => {
    await updateDocumentStatus(id, status);
    toast.success(`Document marked as ${status}`);
    refresh();
  };

  const handleAnnSubmit = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.body) return toast.error('Fill all fields');
    await addAnnouncement(annForm);
    setAnnForm({ title: '', body: '' });
    toast.success('Announcement posted');
    refresh();
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payForm.employeeId || !payForm.month || !payForm.netPay) return toast.error('Fill all fields');
    const emp = employees.find(e => e.id === payForm.employeeId);
    if (!emp) return toast.error('Invalid Employee ID');
    await addPayslip({ ...payForm, employeeName: emp.fullName });
    setPayForm({ employeeId: '', month: '', year: new Date().getFullYear(), netPay: '' });
    toast.success('Payslip generated');
    refresh();
  };

  const handleRecSubmit = async (e) => {
    e.preventDefault();
    if (!recForm.employeeId || !recForm.message) return toast.error('Fill all fields');
    const emp = employees.find(e => e.id === recForm.employeeId);
    if (!emp) return toast.error('Invalid Employee ID');
    await addRecognition({ ...recForm, employeeName: emp.fullName });
    setRecForm({ employeeId: '', badgeTitle: 'Star Performer', message: '' });
    toast.success('Recognition awarded!');
    refresh();
  };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    if (!empForm.id || !empForm.fullName || !empForm.password) return toast.error('Missing core fields');
    try {
      await addEmployee({ ...empForm, role: 'employee', status: 'active', createdAt: new Date().toISOString() });
      setShowAddEmp(false);
      toast.success('Employee provisioned');
      refresh();
    } catch(err) { toast.error('Failed to provision employee'); }
  };

  const startEditEmp = (emp) => {
    setEditingEmpId(emp.id);
    setEditEmpForm(emp);
  };

  const handleEmpUpdate = async (id) => {
    try {
      await updateEmployee(id, editEmpForm);
      setEditingEmpId(null);
      toast.success('Employee updated');
      refresh();
    } catch (err) {
      toast.error('Failed to update employee');
    }
  };

  const NAV_ITEMS = [
    { id: 'overview', label: 'Command Center', icon: Home },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: FileText },
    { id: 'announcements', label: 'Broadcasts', icon: Bell },
    { id: 'tasks', label: 'Task Management', icon: Briefcase },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'documents', label: 'Docs Vault', icon: File },
    { id: 'helpdesk', label: 'Support Desk', icon: HelpCircle },
    { id: 'recognition', label: 'Recognition', icon: Award },
    { id: 'holidays', label: 'Calendar', icon: Calendar },
  ];

  if (!session) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{ className: 'glass-panel', style: { background: 'rgba(10,10,15,0.8)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-violet/10 blur-[150px] mix-blend-screen opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px] mix-blend-screen opacity-50" style={{ animation: 'pulse 8s infinite alternate' }}></div>
      </div>

      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />}
      </AnimatePresence>

      <motion.aside className={`fixed lg:relative z-50 h-full w-64 glass-panel border-r border-y-0 border-l-0 border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-heading font-bold text-lg tracking-wide text-white">Superadmin</h2>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${active ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
                {active && <motion.div layoutId="admin-active-pill" className="absolute inset-0 border border-white/20 rounded-xl bg-white/5" />}
                <item.icon className={`w-5 h-5 z-10 transition-colors ${active ? 'text-accent-violet' : 'group-hover:text-white/80'}`} />
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

      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        <header className="h-20 px-6 flex items-center justify-between glass-panel border-b border-x-0 border-t-0 border-border z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 capitalize">
              {NAV_ITEMS.find(n => n.id === tab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">System Admin</p>
              <p className="text-[10px] text-accent-violet font-mono tracking-widest uppercase">Level 0 Clearance</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {dataLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-2 border-accent-violet border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-8 pb-20">
                
                {tab === 'overview' && stats && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Total Employees', val: stats.totalEmployees, icon: Users, color: 'text-accent' },
                        { label: 'Present Today', val: stats.presentToday, icon: CheckCircle2, color: 'text-green-400' },
                        { label: 'On Leave Today', val: stats.onLeaveToday, icon: FileText, color: 'text-yellow-400' },
                        { label: 'Pending Leaves', val: stats.pendingLeaves, icon: Bell, color: 'text-accent-violet' },
                      ].map((s, i) => (
                        <Tilt key={i} options={{ max: 15, scale: 1.05 }}>
                          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group cursor-pointer border-t border-t-white/10">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-1">{s.label}</p>
                              <p className={`text-4xl font-heading font-bold ${s.color}`}>{s.val}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                              <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                          </div>
                        </Tilt>
                      ))}
                    </div>

                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-accent-violet/10 rounded-full blur-[80px] pointer-events-none"></div>
                      <h3 className="font-heading font-bold text-2xl text-white mb-2 relative z-10">Zexora Quvixo HR Framework v2.0</h3>
                      <p className="text-white/50 max-w-xl relative z-10">
                        Welcome to the Superadmin Command Center. From here, you possess absolute authority over the employee ecosystem, payroll modules, support desking, and global broadcasts.
                      </p>
                    </div>
                  </div>
                )}

                {tab === 'employees' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-heading font-bold text-lg">Workforce Directory</h3>
                      <button onClick={() => setShowAddEmp(!showAddEmp)} className="px-5 py-2 rounded-xl bg-accent-violet/20 text-accent-violet font-semibold text-sm hover:bg-accent-violet/30 transition-all border border-accent-violet/30 flex items-center gap-2">
                        {showAddEmp ? <XCircle className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>} {showAddEmp ? 'Close Form' : 'Add Employee'}
                      </button>
                    </div>
                    {showAddEmp && (
                      <div className="p-6 border-b border-white/10 bg-black/20">
                        <form onSubmit={handleEmpSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <input type="text" placeholder="Emp ID (e.g. EMP002)" value={empForm.id} onChange={(e) => setEmpForm({...empForm, id: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm" required/>
                          <input type="text" placeholder="Full Name" value={empForm.fullName} onChange={(e) => setEmpForm({...empForm, fullName: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm" required/>
                          <div className="relative">
                            <input type={showPass ? "text" : "password"} placeholder="Password" value={empForm.password} onChange={(e) => setEmpForm({...empForm, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-accent-violet text-white text-sm" required/>
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                              {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                          </div>
                          <input type="text" placeholder="Department" value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm"/>
                          <input type="text" placeholder="Designation" value={empForm.designation} onChange={(e) => setEmpForm({...empForm, designation: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm"/>
                          <input type="email" placeholder="Email" value={empForm.email} onChange={(e) => setEmpForm({...empForm, email: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm"/>
                          <button type="submit" className="md:col-span-2 lg:col-span-3 py-3 rounded-xl bg-accent-violet text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">Provision Employee</button>
                        </form>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">ID</th>
                            <th className="px-6 py-4 font-semibold">Name & Details</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Contact</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {employees.map((e, i) => {
                            const isEditing = editingEmpId === e.id;
                            return (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-accent-cyan">{e.id}</td>
                                <td className="px-6 py-4 font-medium text-white">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input type="text" value={editEmpForm.fullName} onChange={(ev) => setEditEmpForm({...editEmpForm, fullName: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full" placeholder="Full Name" />
                                      <input type="text" value={editEmpForm.designation} onChange={(ev) => setEditEmpForm({...editEmpForm, designation: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full" placeholder="Designation" />
                                      <div className="relative">
                                        <input type={showPass ? "text" : "password"} value={editEmpForm.password} onChange={(ev) => setEditEmpForm({...editEmpForm, password: ev.target.value})} className="bg-black/40 border border-white/10 rounded pl-2 pr-8 py-1 text-xs w-full" placeholder="New Password" />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                                          {showPass ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>{e.fullName}<br/><span className="text-[10px] text-white/40">{e.designation}</span></>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-white/60">
                                  {isEditing ? (
                                    <input type="text" value={editEmpForm.department} onChange={(ev) => setEditEmpForm({...editEmpForm, department: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full" />
                                  ) : e.department}
                                </td>
                                <td className="px-6 py-4 text-white/50 text-xs">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input type="email" value={editEmpForm.email} onChange={(ev) => setEditEmpForm({...editEmpForm, email: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full" placeholder="Email" />
                                      <input type="text" value={editEmpForm.phone} onChange={(ev) => setEditEmpForm({...editEmpForm, phone: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full" placeholder="Phone" />
                                    </div>
                                  ) : <>{e.email}<br/>{e.phone}</>}
                                </td>
                                <td className="px-6 py-4">
                                  {isEditing ? (
                                    <select value={editEmpForm.status} onChange={(ev) => setEditEmpForm({...editEmpForm, status: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs">
                                      <option value="active">Active</option>
                                      <option value="inactive">Inactive</option>
                                    </select>
                                  ) : <StatusBadge status={e.status} />}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {isEditing ? (
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => handleEmpUpdate(e.id)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/40">Save</button>
                                      <button onClick={() => setEditingEmpId(null)} className="px-3 py-1 bg-white/10 text-white/60 rounded text-xs hover:bg-white/20">Cancel</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => startEditEmp(e)} className="text-accent-cyan hover:text-white underline text-xs">Edit</button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'attendance' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-accent/10 to-transparent">
                      <h3 className="font-heading font-bold text-lg text-white">Global Attendance Logs</h3>
                      <button onClick={exportAttendanceCSV} className="px-5 py-2 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2">
                        <Download className="w-4 h-4"/> Export CSV
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Check In</th>
                            <th className="px-6 py-4 font-semibold">Check Out</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {attendance.slice(0, 50).map((r, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{fmtDate(r.date)}</td>
                              <td className="px-6 py-4 text-white/80">{r.employeeName} <span className="text-xs text-white/30 ml-2">({r.employeeId})</span></td>
                              <td className="px-6 py-4 text-green-400">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
                              <td className="px-6 py-4 text-red-400">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
                              <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'leave' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">Leave Approvals</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold">Dates</th>
                            <th className="px-6 py-4 font-semibold">Reason</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {leaves.map((l, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{l.employeeName}</td>
                              <td className="px-6 py-4 text-white/60 capitalize">{l.type}</td>
                              <td className="px-6 py-4 text-white/60 text-xs">{fmtDate(l.fromDate)} → {fmtDate(l.toDate)}</td>
                              <td className="px-6 py-4 text-white/40 max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                              <td className="px-6 py-4 text-right">
                                {l.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleLeaveAction(l._docId, 'approved')} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40"><CheckCircle2 className="w-4 h-4"/></button>
                                    <button onClick={() => handleLeaveAction(l._docId, 'rejected')} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40"><XCircle className="w-4 h-4"/></button>
                                  </div>
                                ) : <StatusBadge status={l.status} />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── ADMIN TASKS ── */}
                {tab === 'tasks' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">Global Task Logs</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Task</th>
                            <th className="px-6 py-4 font-semibold">Category</th>
                            <th className="px-6 py-4 font-semibold">Hours</th>
                            <th className="px-6 py-4 font-semibold">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tasks.map((t, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{t.employeeName}</td>
                              <td className="px-6 py-4 text-white/70 max-w-[200px] truncate">{t.name}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px]">{t.category}</span></td>
                              <td className="px-6 py-4 text-accent-cyan font-mono">{t.hours}h</td>
                              <td className="px-6 py-4 text-white/40 text-xs">{fmtDate(t.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── ADMIN PAYROLL ── */}
                {tab === 'payroll' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 glass-panel p-6 rounded-3xl h-fit">
                      <h3 className="font-heading font-bold text-lg mb-6 text-white">Generate Payslip</h3>
                      <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
                        <select value={payForm.employeeId} onChange={(e) => setPayForm({...payForm, employeeId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white text-sm appearance-none" required>
                          <option value="">Select Employee...</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.id})</option>)}
                        </select>
                        <input type="text" placeholder="Month (e.g. May)" value={payForm.month} onChange={(e) => setPayForm({...payForm, month: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white text-sm" required/>
                        <input type="number" placeholder="Net Pay (₹)" value={payForm.netPay} onChange={(e) => setPayForm({...payForm, netPay: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white text-sm" required/>
                        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500/80 to-green-600 text-white font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center gap-2"><DollarSign className="w-4 h-4"/> Issue Payslip</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">Issued Payslips</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Employee</th>
                              <th className="px-6 py-4 font-semibold">Period</th>
                              <th className="px-6 py-4 font-semibold">Amount</th>
                              <th className="px-6 py-4 font-semibold">Issued On</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {payslips.map((p, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{p.employeeName}</td>
                                <td className="px-6 py-4 text-white/70">{p.month} {p.year}</td>
                                <td className="px-6 py-4 text-green-400 font-mono">₹{p.netPay.toLocaleString()}</td>
                                <td className="px-6 py-4 text-white/40 text-xs">{fmtDate(p.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ADMIN DOCUMENTS ── */}
                {tab === 'documents' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">Document Verification</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Document</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {documents.map((d, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{d.employeeName}</td>
                              <td className="px-6 py-4 text-white/70 flex items-center gap-2"><FileText className="w-4 h-4 text-accent-cyan"/>{d.name}</td>
                              <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                              <td className="px-6 py-4 text-right">
                                {d.status === 'pending' && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleDocAction(d.id, 'verified')} className="p-1.5 rounded-lg bg-green-500/20 text-green-400"><CheckCircle2 className="w-4 h-4"/></button>
                                    <button onClick={() => handleDocAction(d.id, 'rejected')} className="p-1.5 rounded-lg bg-red-500/20 text-red-400"><XCircle className="w-4 h-4"/></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── ADMIN HELPDESK ── */}
                {tab === 'helpdesk' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">Support Tickets</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">ID</th>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Subject</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tickets.map((t, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-accent-cyan text-xs">#{t.id.slice(0,6)}</td>
                              <td className="px-6 py-4 font-medium text-white">{t.employeeName}</td>
                              <td className="px-6 py-4 text-white/70 max-w-[200px] truncate">{t.subject}</td>
                              <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                              <td className="px-6 py-4 text-right">
                                {t.status === 'open' && (
                                  <button onClick={() => handleTicketAction(t.id, 'resolved')} className="px-3 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">Mark Resolved</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── ADMIN RECOGNITION ── */}
                {tab === 'recognition' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 glass-panel p-6 rounded-3xl h-fit border-yellow-500/20">
                      <h3 className="font-heading font-bold text-lg mb-6 text-yellow-400 flex items-center gap-2"><Award className="w-5 h-5"/> Award Badge</h3>
                      <form onSubmit={handleRecSubmit} className="flex flex-col gap-4">
                        <select value={recForm.employeeId} onChange={(e) => setRecForm({...recForm, employeeId: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white text-sm appearance-none" required>
                          <option value="">Select Employee...</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                        </select>
                        <select value={recForm.badgeTitle} onChange={(e) => setRecForm({...recForm, badgeTitle: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white text-sm appearance-none" required>
                          <option value="Star Performer">Star Performer</option>
                          <option value="Top Caller">Top Caller</option>
                          <option value="Culture Champion">Culture Champion</option>
                        </select>
                        <textarea rows={3} placeholder="Congratulatory message..." value={recForm.message} onChange={(e) => setRecForm({...recForm, message: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white text-sm resize-none" required/>
                        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500/80 to-yellow-600 text-white font-bold hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">Publish Award</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-white/10"><h3 className="font-heading font-bold text-lg text-white">Recognition History</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Employee</th>
                              <th className="px-6 py-4 font-semibold">Badge</th>
                              <th className="px-6 py-4 font-semibold">Message</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {recognitions.map((r, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{r.employeeName}</td>
                                <td className="px-6 py-4 text-yellow-400 text-xs font-bold">{r.badgeTitle}</td>
                                <td className="px-6 py-4 text-white/60 text-xs italic">"{r.message}"</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ANNOUNCEMENTS & HOLIDAYS TABS ── */}
                {tab === 'announcements' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 glass-panel p-6 rounded-3xl h-fit">
                      <h3 className="font-heading font-bold text-lg mb-6 text-white">New Broadcast</h3>
                      <form onSubmit={handleAnnSubmit} className="flex flex-col gap-4">
                        <input type="text" placeholder="Title" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm" required />
                        <textarea rows={4} placeholder="Message body..." value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-white text-sm resize-none" required />
                        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-violet to-accent text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">Send Broadcast</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                      {announcements.map((a) => (
                        <div key={a.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/10 rounded-full blur-[40px] pointer-events-none"></div>
                          <div className="flex items-start justify-between gap-4 mb-2 relative z-10"><h4 className="font-bold text-lg text-white">{a.title}</h4><span className="text-xs font-mono text-accent-cyan px-2 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/20 shrink-0">{fmtDate(a.postedAt)}</span></div>
                          <p className="text-white/60 text-sm relative z-10">{a.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {tab === 'holidays' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-accent/10 to-transparent"><h3 className="font-heading font-bold text-xl text-white">Official Holidays 2026</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left"><thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]"><tr><th className="px-6 py-4 font-semibold">Festival / Occasion</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Day</th></tr></thead><tbody className="divide-y divide-white/5">{HOLIDAYS_2026.map((h, i) => (<tr key={i} className="hover:bg-white/5 transition-colors"><td className="px-6 py-4 font-medium text-white">{h.name}</td><td className="px-6 py-4 text-accent-cyan font-mono">{h.date}</td><td className="px-6 py-4 text-white/60">{h.day}</td></tr>))}</tbody></table>
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
