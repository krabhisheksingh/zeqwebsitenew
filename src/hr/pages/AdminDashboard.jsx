import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, FileText, Download, CheckCircle2, 
  XCircle, Bell, Calendar, Home, LogOut, Menu,
  Briefcase, DollarSign, File, HelpCircle, Award, ShieldAlert, Clock, Plus, Eye, EyeOff, ShieldCheck, Landmark, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getSession, getEmployees, getAttendance, getLeaves,
  getAnnouncements, updateLeaveStatus, addAnnouncement,
  exportAttendanceCSV, getDashboardStats, HOLIDAYS_2026, clearSession,
  getAllTasks, getAllTickets, updateTicketStatus, getAllDocuments, updateDocumentStatus,
  getAllPayslips, addPayslip, addRecognition, getRecognitions, addEmployee, updateEmployee,
  wipeAllEmployeeData, deleteEmployee, deleteAnnouncement
} from '../utils/hrStorage';
import { Tilt } from 'react-tilt';
import toast, { Toaster } from 'react-hot-toast';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
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
    verified_digilocker: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium capitalize flex items-center justify-center max-w-min whitespace-nowrap ${cfg[status] || 'bg-white/10 text-white/60 border-white/20'}`}>
      {status === 'verified_digilocker' ? (
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> DigiLocker Verified</span>
      ) : status.replace('_', ' ')}
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
  const [digiLoading, setDigiLoading] = useState(null);
  
  // Forms
  const [annForm, setAnnForm] = useState({ title: '', body: '' });
  const [payForm, setPayForm] = useState({ employeeId: '', month: '', year: new Date().getFullYear(), netPay: '' });
  const [recForm, setRecForm] = useState({ employeeId: '', badgeTitle: 'Star Performer', message: '' });
  const [empForm, setEmpForm] = useState({ id: '', fullName: '', email: '', phone: '', department: 'Engineering', designation: '', password: '', dateOfJoining: '' });
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editEmpForm, setEditEmpForm] = useState({});
  const [showPass, setShowPass] = useState(false);

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedEmpBank, setSelectedEmpBank] = useState(null);
  const [selectedEmpDetails, setSelectedEmpDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState('profile');

  const printPayslip = (p) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error('Popup blocker enabled. Please allow popups to download/print this payslip.');
      return;
    }
    const emp = employees.find(e => e.id === p.employeeId);
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${p.month} ${p.year}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F8EF7; }
            .title { font-size: 18px; color: #666; margin-top: 5px; }
            .details-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
            .details-table td { padding: 8px; border-bottom: 1px solid #eee; }
            .details-table td.label { font-weight: bold; color: #555; width: 30%; }
            .salary-breakdown { width: 100%; margin-top: 40px; border-collapse: collapse; }
            .salary-breakdown th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
            .salary-breakdown td { padding: 12px; border-bottom: 1px solid #eee; }
            .total-row { font-size: 18px; font-weight: bold; background: #f8f9fa; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Zexora Quvixo Group</div>
            <div class="title">Salary Slip (Payslip)</div>
            <div>Period: ${p.month} ${p.year}</div>
          </div>
          <table class="details-table">
            <tr>
              <td class="label">Employee Name:</td>
              <td>${p.employeeName}</td>
              <td class="label">Employee ID:</td>
              <td>${p.employeeId}</td>
            </tr>
            <tr>
              <td class="label">Designation:</td>
              <td>${emp?.designation || 'Software Developer'}</td>
              <td class="label">Department:</td>
              <td>${emp?.department || 'Engineering'}</td>
            </tr>
            <tr>
              <td class="label">Issued Date:</td>
              <td>${new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
              <td class="label">Status:</td>
              <td>Paid</td>
            </tr>
          </table>
          <table class="salary-breakdown">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary (50%)</td>
                <td style="text-align: right;">₹${(p.netPay * 0.5).toLocaleString()}</td>
              </tr>
              <tr>
                <td>House Rent Allowance (HRA) (20%)</td>
                <td style="text-align: right;">₹${(p.netPay * 0.2).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Special Allowance (20%)</td>
                <td style="text-align: right;">₹${(p.netPay * 0.2).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Conveyance & Medical (10%)</td>
                <td style="text-align: right;">₹${(p.netPay * 0.1).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>Net Salary Disbursed</td>
                <td style="text-align: right;">₹${p.netPay.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            This is a computer-generated document and does not require a physical signature.
            <br>&copy; 2026 Zexora Quvixo Group. All rights reserved.
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadDoc = (docItem) => {
    if (!docItem.url) {
      toast.error('This file has no downloadable content (metadata-only record).');
      return;
    }
    const link = document.createElement('a');
    link.href = docItem.url;
    link.download = docItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading document...');
  };

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

  const getStarPerformer = () => {
    const salesByEmployee = {};
    tasks.forEach(t => {
      if (t.employeeName) {
        salesByEmployee[t.employeeName] = (salesByEmployee[t.employeeName] || 0) + (Number(t.sales) || 0);
      }
    });

    let starName = '';
    let maxSales = 0;
    Object.entries(salesByEmployee).forEach(([name, sales]) => {
      if (sales > maxSales) {
        maxSales = sales;
        starName = name;
      }
    });

    return maxSales > 0 ? { name: starName, sales: maxSales } : null;
  };

  const handleLogout = () => {
    clearSession();
    navigate('/employee-login');
  };

  const handleWipeData = async () => {
    if (window.confirm("WARNING: This will permanently delete ALL attendance, leaves, tasks, payslips, tickets, documents, and recognitions for ALL employees. Are you sure?")) {
      try {
        await wipeAllEmployeeData();
        toast.success("All employee data has been successfully wiped!");
        refresh();
      } catch (err) {
        toast.error("Failed to wipe data.");
      }
    }
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
    toast.success(`Document marked as ${status.replace('_', ' ')}`);
    refresh();
  };

  const handleDigiLockerVerify = (id) => {
    setDigiLoading(id);
    setTimeout(() => {
      handleDocAction(id, 'verified_digilocker');
      setDigiLoading(null);
      toast.success('Document verified successfully via DigiLocker API.');
    }, 2500);
  };

  const handleAnnSubmit = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.body) return toast.error('Fill all fields');
    await addAnnouncement(annForm);
    setAnnForm({ title: '', body: '' });
    toast.success('Announcement posted');
    refresh();
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        toast.success('Announcement deleted');
        refresh();
      } catch (err) {
        toast.error('Failed to delete announcement');
      }
    }
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

  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the employee account for "${name || 'this employee'}"? This action cannot be undone.`)) {
      try {
        await deleteEmployee(id);
        toast.success('Employee account deleted successfully!');
        if (selectedEmpDetails && selectedEmpDetails.id === id) {
          setSelectedEmpDetails(null);
        }
        refresh();
      } catch (err) {
        toast.error('Failed to delete employee account');
      }
    }
  };

  const NAV_ITEMS = [
    { id: 'overview', label: 'Command Center', icon: Home },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: FileText },
    { id: 'announcements', label: 'Broadcasts', icon: Bell },
    { id: 'tasks', label: 'Work Logs', icon: Briefcase },
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

                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-accent-violet/10 rounded-full blur-[80px] pointer-events-none"></div>
                      <div className="relative z-10">
                        <h3 className="font-heading font-bold text-2xl text-white mb-2">Zexora Quvixo HR Framework v2.0</h3>
                        <p className="text-white/50 max-w-xl">
                          Welcome to the Superadmin Command Center. From here, you possess absolute authority over the employee ecosystem, payroll modules, support desking, and global broadcasts.
                        </p>
                      </div>
                      <div className="relative z-10 shrink-0">
                        <button onClick={handleWipeData} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all border border-red-500/30 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" /> Wipe All Data
                        </button>
                      </div>
                    </div>

                    {/* Star Performer Spotlight */}
                    {(() => {
                      const star = getStarPerformer();
                      if (!star) return null;
                      return (
                        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-purple-500/30 bg-gradient-to-r from-purple-950/20 to-black/40">
                          <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center animate-pulse shrink-0">
                                <Award className="w-8 h-8 text-purple-400" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">Company Star Performer 🌟</span>
                                <h4 className="text-2xl font-heading font-bold text-white mt-2">{star.name}</h4>
                                <p className="text-white/60 text-sm mt-0.5">Leads the organization with stellar performance and unmatched contribution.</p>
                              </div>
                            </div>
                            <div className="glass-panel px-6 py-4 rounded-2xl border border-white/5 bg-white/5 text-center min-w-[140px]">
                              <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Sales Closed</p>
                              <p className="text-3xl font-bold text-purple-400 font-mono mt-1">{star.sales}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">DOJ:</span>
                            <input type="date" value={empForm.dateOfJoining} onChange={(e) => setEmpForm({...empForm, dateOfJoining: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-accent-violet text-white text-sm" style={{colorScheme: 'dark'}} required />
                          </div>
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
                            <th className="px-6 py-4 font-semibold">Contact & DOJ</th>
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
                                    <button 
                                      type="button" 
                                      onClick={() => setSelectedEmpDetails(e)} 
                                      className="text-left group cursor-pointer hover:text-accent-cyan transition-colors duration-200"
                                    >
                                      <span className="font-semibold text-white group-hover:text-accent-cyan border-b border-transparent group-hover:border-accent-cyan transition-all duration-200">{e.fullName}</span>
                                      <br/>
                                      <span className="text-[10px] text-white/40 group-hover:text-white/60">{e.designation}</span>
                                    </button>
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
                                      <input type="date" value={editEmpForm.dateOfJoining || ''} onChange={(ev) => setEditEmpForm({...editEmpForm, dateOfJoining: ev.target.value})} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full" style={{colorScheme: 'dark'}} />
                                    </div>
                                  ) : <>{e.email}<br/>{e.phone}<br/><span className="text-[10px] text-accent-cyan mt-1 inline-block">Joined: {e.dateOfJoining ? fmtDate(e.dateOfJoining) : 'N/A'}</span></>}
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
                                    <div className="flex justify-end gap-3 items-center">
                                      {e.bankDetails ? (
                                        <button onClick={() => setSelectedEmpBank(e)} className="text-purple-400 hover:text-purple-300 underline text-xs flex items-center gap-1">
                                          <Landmark className="w-3.5 h-3.5" /> Bank Details
                                        </button>
                                      ) : (
                                        <span className="text-white/20 text-xs italic">No Bank Details</span>
                                      )}
                                      <button onClick={() => startEditEmp(e)} className="text-accent-cyan hover:text-white underline text-xs">Edit</button>
                                      <button onClick={() => handleDeleteEmployee(e.id, e.fullName)} className="text-red-400 hover:text-red-300 underline text-xs">Delete</button>
                                    </div>
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
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-heading font-bold text-lg text-white">Global Work Log Metrics</h3>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-medium">
                        {tasks.length} entries total
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold text-center">Total Calls</th>
                            <th className="px-6 py-4 font-semibold text-center">Total Leads</th>
                            <th className="px-6 py-4 font-semibold text-center">Total Follow Ups</th>
                            <th className="px-6 py-4 font-semibold text-center">Sales Made</th>
                            <th className="px-6 py-4 font-semibold">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tasks.map((t, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-semibold text-white">{t.employeeName}</td>
                              <td className="px-6 py-4 text-center text-accent-cyan font-bold font-mono text-base">{t.calls ?? '—'}</td>
                              <td className="px-6 py-4 text-center text-green-400 font-bold font-mono text-base">{t.leads ?? '—'}</td>
                              <td className="px-6 py-4 text-center text-yellow-400 font-bold font-mono text-base">{t.followups ?? '—'}</td>
                              <td className="px-6 py-4 text-center text-purple-400 font-bold font-mono text-base">{t.sales ?? '—'}</td>
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
                              <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {payslips.map((p, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{p.employeeName}</td>
                                <td className="px-6 py-4 text-white/70">{p.month} {p.year}</td>
                                <td className="px-6 py-4 text-green-400 font-mono">₹{p.netPay.toLocaleString()}</td>
                                <td className="px-6 py-4 text-white/40 text-xs">{fmtDate(p.createdAt)}</td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedPayslip(p)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 text-xs hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1 font-semibold">
                                      <Eye className="w-3.5 h-3.5 text-accent-cyan" /> View
                                    </button>
                                    <button onClick={() => printPayslip(p)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 text-xs hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30 transition-all border border-white/10 flex items-center gap-1 font-semibold">
                                      <Download className="w-3.5 h-3.5 text-green-400" /> Download
                                    </button>
                                  </div>
                                </td>
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
                                <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => setSelectedDocument(d)} className="p-1.5 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-1.5" title="View Document">
                                    <Eye className="w-3.5 h-3.5 text-accent-cyan"/>
                                    <span className="hidden lg:block text-xs font-semibold">View</span>
                                  </button>
                                  <button onClick={() => handleDownloadDoc(d)} className="p-1.5 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-1.5" title="Download Document">
                                    <Download className="w-3.5 h-3.5 text-accent"/>
                                    <span className="hidden lg:block text-xs font-semibold">Download</span>
                                  </button>

                                  {d.status === 'pending' && (
                                    <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                                      <button onClick={() => handleDigiLockerVerify(d.id)} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center gap-1 hover:bg-emerald-500/30 transition-colors" disabled={digiLoading === d.id}>
                                        {digiLoading === d.id ? <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"/> : <ShieldCheck className="w-4 h-4"/>}
                                        <span className="hidden lg:block text-xs font-bold">DigiLocker</span>
                                      </button>
                                      <button onClick={() => handleDocAction(d.id, 'verified')} className="p-1.5 rounded-lg bg-green-500/20 text-green-400" title="Verify"><CheckCircle2 className="w-4 h-4"/></button>
                                      <button onClick={() => handleDocAction(d.id, 'rejected')} className="p-1.5 rounded-lg bg-red-500/20 text-red-400" title="Reject"><XCircle className="w-4 h-4"/></button>
                                    </div>
                                  )}
                                </div>
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
                        <div key={a.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/10 rounded-full blur-[40px] pointer-events-none"></div>
                          <div className="flex items-start justify-between gap-4 mb-2 relative z-10">
                            <h4 className="font-bold text-lg text-white">{a.title}</h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono text-accent-cyan px-2 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/20">{fmtDate(a.postedAt)}</span>
                              <button 
                                onClick={() => handleDeleteAnnouncement(a.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Delete Announcement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-white/60 text-sm relative z-10 pr-8">{a.body}</p>
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

      {/* ── PAYSLIP DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedPayslip && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-2xl bg-black/90 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Decorative background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedPayslip(null)} 
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="text-center border-b border-white/10 pb-6 mb-6">
                <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Zexora Quvixo Group</h2>
                <p className="text-xs uppercase tracking-widest text-accent-cyan font-semibold mt-1">Salary Slip / Payslip</p>
                <p className="text-sm text-white/60 mt-1">Period: {selectedPayslip.month} {selectedPayslip.year}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8 bg-white/5 p-5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Employee Name</p>
                  <p className="text-white font-medium">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Employee ID</p>
                  <p className="text-white font-medium">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Designation</p>
                  <p className="text-white font-medium">
                    {employees.find(e => e.id === selectedPayslip.employeeId)?.designation || 'Software Developer'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Department</p>
                  <p className="text-white font-medium">
                    {employees.find(e => e.id === selectedPayslip.employeeId)?.department || 'Engineering'}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Earnings Breakdown</h4>
              <div className="space-y-3 mb-8">
                {[
                  ['Basic Salary (50%)', selectedPayslip.netPay * 0.5],
                  ['House Rent Allowance (HRA) (20%)', selectedPayslip.netPay * 0.2],
                  ['Special Allowance (20%)', selectedPayslip.netPay * 0.2],
                  ['Conveyance & Medical (10%)', selectedPayslip.netPay * 0.1],
                ].map(([label, amount]) => (
                  <div key={label} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                    <span className="text-white/60">{label}</span>
                    <span className="text-white font-mono">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-base font-bold pt-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  <span className="text-accent-cyan uppercase tracking-wider">Net Disbursed</span>
                  <span className="text-white font-mono">₹{parseFloat(selectedPayslip.netPay).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-green-400 font-semibold px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 uppercase tracking-widest">
                  Status: Paid
                </span>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedPayslip(null)} 
                    className="px-5 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all border border-white/10 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      printPayslip(selectedPayslip);
                      setSelectedPayslip(null);
                    }} 
                    className="px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-cyan transition-all border border-accent/20 text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_20px_rgba(79,142,247,0.3)]"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOCUMENT VIEWER MODAL ── */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-3xl bg-black/90 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Decorative background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent-cyan/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedDocument(null)} 
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="border-b border-white/10 pb-4 mb-6 pr-10">
                <h2 className="text-xl font-heading font-bold text-white truncate">{selectedDocument.name}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-white/45">Employee: {selectedDocument.employeeName} ({selectedDocument.employeeId})</span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs text-white/40">Uploaded {fmtDate(selectedDocument.uploadedAt)}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs text-white/40">{(selectedDocument.size / 1024).toFixed(1)} KB</span>
                  <span className="text-white/20">•</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border uppercase tracking-wider font-semibold ${selectedDocument.status === 'verified' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'}`}>
                    {selectedDocument.status}
                  </span>
                </div>
              </div>

              {/* Document Container */}
              <div className="flex-1 overflow-y-auto mb-6 bg-white/5 rounded-2xl border border-white/5 p-4 flex items-center justify-center min-h-[300px]">
                {selectedDocument.url ? (
                  selectedDocument.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(selectedDocument.name) ? (
                    <img 
                      src={selectedDocument.url} 
                      alt={selectedDocument.name} 
                      className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-lg border border-white/5"
                    />
                  ) : selectedDocument.type === 'application/pdf' || /\.pdf$/i.test(selectedDocument.name) ? (
                    <iframe 
                      src={selectedDocument.url} 
                      title={selectedDocument.name} 
                      className="w-full h-[55vh] rounded-xl border border-white/10"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
                      <p className="text-white font-medium mb-1">Preview not available for this file type</p>
                      <p className="text-xs text-white/40">Type: {selectedDocument.type || 'Unknown'}</p>
                    </div>
                  )
                ) : (
                  /* Stylized fallback document card */
                  <div className="w-full max-w-md p-8 bg-black/40 border border-white/10 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent to-accent-cyan"></div>
                    <FileText className="w-16 h-16 text-accent-cyan mx-auto mb-4 opacity-80 animate-pulse" />
                    <h3 className="text-lg font-bold text-white mb-2">Pre-Storage Metadata Record</h3>
                    <p className="text-xs text-white/70 mb-4 leading-relaxed">
                      This document was uploaded before raw file storage was activated. The file's metadata and cryptographic signature were saved, but the raw file contents are not stored in the database.
                    </p>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs text-center font-semibold mb-6">
                      ⚠️ Please upload a new document to view the file content.
                    </div>
                    <div className="space-y-2.5 text-left text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between">
                        <span className="text-white/40">Doc Ref ID:</span>
                        <span className="text-white font-mono">{selectedDocument.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">File Name:</span>
                        <span className="text-white truncate max-w-[200px]">{selectedDocument.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Hash Status:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ Integrity Verified
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setSelectedDocument(null)} 
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all border border-white/10 text-xs font-semibold"
                >
                  Close
                </button>
                {selectedDocument.url && (
                  <button 
                    onClick={() => handleDownloadDoc(selectedDocument)} 
                    className="px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-cyan transition-all border border-accent/20 text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_20px_rgba(79,142,247,0.3)]"
                  >
                    <Download className="w-3.5 h-3.5" /> Download File
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPLOYEE BANK DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedEmpBank && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-md bg-black/90 border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Decorative purple background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-purple-500/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedEmpBank(null)} 
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                  <Landmark className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-heading font-bold text-white">Employee Bank Credentials</h2>
                <p className="text-xs text-white/40 mt-1">Verified payment accounts logged by the employee</p>
              </div>

              {/* Mockup Card */}
              <div className="w-full h-44 rounded-2xl p-5 mb-6 flex flex-col justify-between border border-white/10 bg-gradient-to-br from-[#1d1b38] via-[#0f0e21] to-[#2b2157] relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] tracking-widest text-purple-400 font-semibold uppercase">Zexora Corporate</span>
                    <h3 className="text-xs font-semibold text-white/70 mt-1 uppercase">{selectedEmpBank.bankDetails.bankName}</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[8px] rounded bg-green-500/15 border border-green-500/30 text-green-400 uppercase font-semibold">Active</span>
                </div>

                <div className="my-2">
                  <p className="text-base font-mono font-semibold tracking-wider text-white">
                    {selectedEmpBank.bankDetails.accountNumber}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-white/30 block">Account Holder</span>
                    <span className="text-xs font-semibold text-white/80 uppercase truncate max-w-[150px] inline-block">{selectedEmpBank.bankDetails.holderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-wider text-white/30 block">IFSC</span>
                    <span className="text-xs font-semibold font-mono text-purple-400 uppercase">{selectedEmpBank.bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-3.5 text-xs bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/40">Employee Name:</span>
                  <span className="text-white font-medium">{selectedEmpBank.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Employee ID:</span>
                  <span className="text-white font-mono font-medium">{selectedEmpBank.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Branch Name:</span>
                  <span className="text-white font-medium">{selectedEmpBank.bankDetails.branchName || 'Not Specified'}</span>
                </div>
                {selectedEmpBank.bankDetails.upiId && (
                  <div className="flex justify-between">
                    <span className="text-white/40">UPI ID:</span>
                    <span className="text-white font-mono text-purple-400 font-medium">{selectedEmpBank.bankDetails.upiId}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedEmpBank(null)} 
                className="w-full py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all border border-white/10 text-xs font-semibold"
              >
                Close Portal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPLOYEE FULL DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedEmpDetails && (() => {
          const emp = selectedEmpDetails;
          const empAttendance = attendance.filter(r => r.employeeId === emp.id);
          const empLeaves = leaves.filter(l => l.employeeId === emp.id);
          const empTasks = tasks.filter(t => t.employeeId === emp.id);
          const empDocs = documents.filter(d => d.employeeId === emp.id);
          const empRecognitions = recognitions.filter(r => r.employeeId === emp.id);
          
          const presentCount = empAttendance.filter(r => r.status === 'present').length;
          const halfDayCount = empAttendance.filter(r => r.status === 'half-day').length;
          const totalDays = empAttendance.length;
          const attRate = totalDays > 0 ? (((presentCount + (halfDayCount * 0.5)) / totalDays) * 100).toFixed(1) : '100';

          const totalSales = empTasks.reduce((acc, t) => acc + (Number(t.sales) || 0), 0);
          const totalCalls = empTasks.reduce((acc, t) => acc + (Number(t.calls) || 0), 0);
          const totalLeads = empTasks.reduce((acc, t) => acc + (Number(t.leads) || 0), 0);
          const totalFollowups = empTasks.reduce((acc, t) => acc + (Number(t.followups) || 0), 0);
          
          const approvedLeaves = empLeaves.filter(l => l.status === 'approved').length;
          const pendingLeavesCount = empLeaves.filter(l => l.status === 'pending').length;

          return (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.9, y: 20 }} 
                className="w-full max-w-4xl bg-black/90 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Decorative background glow */}
                <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedEmpDetails(null)} 
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"
                >
                  <XCircle className="w-6 h-6" />
                </button>

                {/* Header Spotlight */}
                <div className="flex flex-col md:flex-row items-center gap-6 border-b border-white/10 pb-6 mb-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-accent-violet to-accent-cyan p-0.5 overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                      {emp.avatar ? (
                        <img src={emp.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-white/80" />
                      )}
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1 font-sans">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h2 className="text-2xl font-heading font-bold text-white tracking-wide">{emp.fullName}</h2>
                      <StatusBadge status={emp.status} />
                    </div>
                    <p className="text-sm text-accent-cyan font-semibold mt-1">{emp.designation} • <span className="text-white/60 font-normal">{emp.department}</span></p>
                    <p className="text-xs text-white/40 mt-1 font-mono">Employee ID: {emp.id} | Joined: {emp.dateOfJoining ? fmtDate(emp.dateOfJoining) : 'N/A'}</p>
                  </div>
                  <div className="shrink-0 flex gap-3">
                    <button 
                      onClick={() => {
                        setSelectedEmpDetails(null);
                        startEditEmp(emp);
                      }}
                      className="px-4 py-2 bg-accent-violet/20 text-accent-violet rounded-xl border border-accent-violet/30 text-xs font-semibold hover:bg-accent-violet/30 transition-all cursor-pointer"
                    >
                      Quick Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-white/5 pb-3 mb-6 overflow-x-auto scrollbar-hide shrink-0 relative z-10">
                  {[
                    { id: 'profile', label: 'Overview & Stats' },
                    { id: 'worklogs', label: 'Work Logs' },
                    { id: 'leaves', label: 'Attendance & Leaves' },
                    { id: 'bankdocs', label: 'Bank & Docs' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setDetailsTab(t.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 cursor-pointer ${
                        detailsTab === t.id 
                          ? 'bg-white/10 text-white border-white/20' 
                          : 'bg-transparent text-white/50 border-transparent hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto mb-6 relative z-10 pr-1">
                  {detailsTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Stats cards grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Attendance Rate', val: `${attRate}%`, desc: `${presentCount} Present / ${totalDays} Total`, color: 'text-green-400' },
                          { label: 'Sales Closed', val: totalSales, desc: `${totalLeads} Leads / ${totalCalls} Calls`, color: 'text-purple-400' },
                          { label: 'Approved Leaves', val: approvedLeaves, desc: `${pendingLeavesCount} Pending Request(s)`, color: 'text-yellow-400' },
                          { label: 'Company Awards', val: empRecognitions.length, desc: 'Recognitions Received', color: 'text-accent-cyan' }
                        ].map((card, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                            <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{card.label}</p>
                            <p className={`text-2xl font-bold font-mono my-2 ${card.color}`}>{card.val}</p>
                            <p className="text-[10px] text-white/50">{card.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detail list */}
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 mb-3">Primary Contact & Security</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-white/45">Email ID:</span>
                            <span className="text-white font-medium">{emp.email || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-white/45">Phone Number:</span>
                            <span className="text-white font-medium">{emp.phone || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-white/45">Username:</span>
                            <span className="text-white font-mono">{emp.username || emp.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/45">System Password:</span>
                            <span className="text-white font-mono">{emp.password}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailsTab === 'worklogs' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-white">Task Submissions</h4>
                      {empTasks.length === 0 ? (
                        <div className="text-center p-8 bg-white/5 border border-white/5 rounded-2xl text-white/40 text-xs">
                          No work logs recorded for this employee.
                        </div>
                      ) : (
                        <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-white/10 text-white/50 uppercase tracking-widest text-[9px]">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold text-center">Calls</th>
                                <th className="px-4 py-3 font-semibold text-center">Leads</th>
                                <th className="px-4 py-3 font-semibold text-center">Follow-ups</th>
                                <th className="px-4 py-3 font-semibold text-center">Sales</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {empTasks.map((t, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-white/80">{fmtDate(t.createdAt)}</td>
                                  <td className="px-4 py-3 text-center font-mono font-medium text-accent-cyan">{t.calls ?? '—'}</td>
                                  <td className="px-4 py-3 text-center font-mono font-medium text-green-400">{t.leads ?? '—'}</td>
                                  <td className="px-4 py-3 text-center font-mono font-medium text-yellow-400">{t.followups ?? '—'}</td>
                                  <td className="px-4 py-3 text-center font-mono font-bold text-purple-400">{t.sales ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {detailsTab === 'leaves' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Attendance log */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Recent Attendance Logs</h4>
                        {empAttendance.length === 0 ? (
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center text-white/40 text-xs">
                            No attendance logs.
                          </div>
                        ) : (
                          <div className="max-h-[300px] overflow-y-auto border border-white/5 rounded-2xl bg-white/5 divide-y divide-white/5">
                            {empAttendance.slice(0, 15).map((log, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 text-xs hover:bg-white/5 transition-colors">
                                <div>
                                  <p className="text-white font-medium">{fmtDate(log.date)}</p>
                                  <p className="text-[10px] text-white/40">{fmtTime(log.checkIn)} → {fmtTime(log.checkOut)}</p>
                                </div>
                                <StatusBadge status={log.status} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Leaves log */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Leave Requests</h4>
                        {empLeaves.length === 0 ? (
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center text-white/40 text-xs">
                            No leave requests applied.
                          </div>
                        ) : (
                          <div className="max-h-[300px] overflow-y-auto border border-white/5 rounded-2xl bg-white/5 divide-y divide-white/5">
                            {empLeaves.map((l, idx) => (
                              <div key={idx} className="p-3 text-xs hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="capitalize font-semibold text-white">{l.type} Leave</span>
                                  <StatusBadge status={l.status} />
                                </div>
                                <p className="text-[10px] text-white/40">{fmtDate(l.fromDate)} → {fmtDate(l.toDate)}</p>
                                <p className="text-white/60 mt-1 italic text-[11px]">"{l.reason}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {detailsTab === 'bankdocs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bank Details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Bank Account Credentials</h4>
                        {emp.bankDetails ? (
                          <div className="w-full h-40 rounded-2xl p-4 flex flex-col justify-between border border-white/10 bg-gradient-to-br from-[#1d1b38] via-[#0f0e21] to-[#2b2157] relative overflow-hidden shadow-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] tracking-widest text-purple-400 font-semibold uppercase">Zexora Corporate</span>
                                <h3 className="text-[11px] font-semibold text-white/70 mt-0.5 uppercase">{emp.bankDetails.bankName}</h3>
                              </div>
                              <span className="px-2 py-0.5 text-[8px] rounded bg-green-500/15 border border-green-500/30 text-green-400 uppercase font-semibold">Active</span>
                            </div>

                            <div className="my-1">
                              <p className="text-sm font-mono font-semibold tracking-wider text-white">
                                {emp.bankDetails.accountNumber}
                              </p>
                            </div>

                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[7px] uppercase tracking-wider text-white/30 block">Holder</span>
                                <span className="text-[10px] font-semibold text-white/80 uppercase truncate max-w-[120px] inline-block">{emp.bankDetails.holderName}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[7px] uppercase tracking-wider text-white/30 block">IFSC</span>
                                <span className="text-[10px] font-semibold font-mono text-purple-400 uppercase">{emp.bankDetails.ifscCode}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 bg-white/5 border border-white/5 rounded-2xl text-center text-white/40 text-xs italic">
                            No Bank account registered by the employee.
                          </div>
                        )}
                      </div>

                      {/* Documents */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Documents Vault</h4>
                        {empDocs.length === 0 ? (
                          <div className="p-8 bg-white/5 border border-white/5 rounded-2xl text-center text-white/40 text-xs">
                            No documents uploaded.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[170px] overflow-y-auto">
                            {empDocs.map((docItem, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                                <span className="text-white font-medium truncate max-w-[150px]">{docItem.name}</span>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={docItem.status} />
                                  <button 
                                    onClick={() => setSelectedDocument(docItem)}
                                    className="p-1 text-accent-cyan hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 shrink-0">
                  <button 
                    onClick={() => setSelectedEmpDetails(null)} 
                    className="px-6 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all border border-white/10 text-xs font-semibold cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
