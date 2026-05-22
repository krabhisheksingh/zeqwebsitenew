import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, History, FileText, Bell, User, CheckCircle2, 
  XCircle, AlertCircle, Calendar, Home, LogOut, Menu,
  Briefcase, DollarSign, File, HelpCircle, Award, Eye, EyeOff, Shield,
  Download, Phone, UserPlus, RefreshCw, Landmark, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getSession, getTodayRecord, checkIn, checkOut, startBreak, endBreak,
  getEmployeeAttendance, getEmployeeLeaves, applyLeave,
  getAnnouncements, updateEmployee, getEmployees, HOLIDAYS_2026, clearSession,
  getEmployeeTasks, addTask, getEmployeePayslips, getEmployeeDocuments, addDocument,
  getEmployeeTickets, addTicket, getRecognitions, getAllTasks
} from '../utils/hrStorage';
import { Tilt } from 'react-tilt';
import toast, { Toaster } from 'react-hot-toast';
import CustomDateInput from '../components/CustomDateInput';

const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


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
  const [globalTasks, setGlobalTasks] = useState([]);
  const [empData, setEmpData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Forms
  const [leaveForm, setLeaveForm] = useState({ type: 'sick', fromDate: '', toDate: '', reason: '' });
  const [profileForm, setProfileForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [taskForm, setTaskForm] = useState({ calls: '', leads: '', followups: '', sales: '' });
  const [ticketForm, setTicketForm] = useState({ category: 'IT Issue', subject: '', description: '', priority: 'Medium' });

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const printPayslip = (p) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error('Popup blocker enabled. Please allow popups to download/print your payslip.');
      return;
    }
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
              <td>${empData?.designation || 'Software Developer'}</td>
              <td class="label">Department:</td>
              <td>${empData?.department || 'Engineering'}</td>
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
    if (!session || session.role !== 'employee') {
      navigate('/employee-login');
      return;
    }
    refresh();
    // eslint-disable-next-line
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    const lastRead = Number(localStorage.getItem(`lastRead_${session.employeeId}`) || 0);
    const count = announcements.filter(a => new Date(a.postedAt).getTime() > lastRead).length;
    setUnreadCount(count);
  }, [announcements, session]);

  useEffect(() => {
    if (tab === 'announcements' && session) {
      localStorage.setItem(`lastRead_${session.employeeId}`, Date.now().toString());
      setUnreadCount(0);
    }
  }, [tab, session]);

  const refresh = async () => {
    setDataLoading(true);
    try {
      const [today, hist, lvs, anns, allEmps, tks, pays, docs, tckts, recs, gTks] = await Promise.all([
        getTodayRecord(session.employeeId),
        getEmployeeAttendance(session.employeeId, 30),
        getEmployeeLeaves(session.employeeId),
        getAnnouncements(),
        getEmployees(),
        getEmployeeTasks(session.employeeId),
        getEmployeePayslips(session.employeeId),
        getEmployeeDocuments(session.employeeId),
        getEmployeeTickets(session.employeeId),
        getRecognitions(),
        getAllTasks()
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
      setGlobalTasks(gTks);
      setEmpData(allEmps.find((e) => e.id === session.employeeId) || null);
      setEmployees(allEmps);
    } catch (err) {
      toast.error('Error loading data');
      console.error(err);
    }
    setDataLoading(false);
  };

  const getStarPerformer = () => {
    const salesByEmployee = {};
    globalTasks.forEach(t => {
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

  const getEmployeeRankings = () => {
    const salesByEmpId = {};
    const callsByEmpId = {};
    const leadsByEmpId = {};
    const followupsByEmpId = {};

    globalTasks.forEach(t => {
      if (t.employeeId) {
        salesByEmpId[t.employeeId] = (salesByEmpId[t.employeeId] || 0) + (Number(t.sales) || 0);
        callsByEmpId[t.employeeId] = (callsByEmpId[t.employeeId] || 0) + (Number(t.calls) || 0);
        leadsByEmpId[t.employeeId] = (leadsByEmpId[t.employeeId] || 0) + (Number(t.leads) || 0);
        followupsByEmpId[t.employeeId] = (followupsByEmpId[t.employeeId] || 0) + (Number(t.followups) || 0);
      }
    });

    const rankedList = employees.map(emp => {
      const sales = salesByEmpId[emp.id] || 0;
      const calls = callsByEmpId[emp.id] || 0;
      const leads = leadsByEmpId[emp.id] || 0;
      const followups = followupsByEmpId[emp.id] || 0;
      return {
        ...emp,
        totalSales: sales,
        totalCalls: calls,
        totalLeads: leads,
        totalFollowups: followups
      };
    });

    rankedList.sort((a, b) => {
      if (b.totalSales !== a.totalSales) {
        return b.totalSales - a.totalSales;
      }
      if (b.totalLeads !== a.totalLeads) {
        return b.totalLeads - a.totalLeads;
      }
      return a.fullName.localeCompare(b.fullName);
    });

    return rankedList;
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
    if (taskForm.calls === '' || taskForm.leads === '' || taskForm.followups === '' || taskForm.sales === '') {
      return toast.error('Please fill all fields');
    }
    try {
      await addTask({ 
        calls: Number(taskForm.calls), 
        leads: Number(taskForm.leads), 
        followups: Number(taskForm.followups), 
        sales: Number(taskForm.sales),
        employeeId: session.employeeId, 
        employeeName: session.name, 
        status: 'Completed' 
      });
      setTaskForm({ calls: '', leads: '', followups: '', sales: '' });
      await refresh();
      toast.success('Work log saved successfully!');
    } catch (err) {
      toast.error('Failed to save work log');
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

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 800 * 1024) {
      toast.error('File size must be under 800KB due to database limits.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await addDocument({ 
          employeeId: session.employeeId, 
          employeeName: session.name, 
          name: file.name, 
          size: file.size,
          type: file.type,
          url: reader.result
        });
        await refresh();
        toast.success('Document uploaded successfully!');
      } catch (err) {
        toast.error('Failed to upload document');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePicUpdate = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateEmployee(session.employeeId, { avatar: reader.result });
        await refresh();
        toast.success('Profile picture updated successfully!');
      } catch (err) {
        toast.error('Failed to update profile picture');
      }
    };
    reader.readAsDataURL(file);
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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
              )}
            </div>
            <div className="relative">
              <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-white">{session.name}</p>
                  <p className="text-xs text-white/40">{empData?.designation || 'Employee'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-violet to-accent-cyan p-0.5 overflow-hidden">
                  <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center overflow-hidden">
                    {empData?.avatar ? (
                      <img src={empData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white/80" />
                    )}
                  </div>
                </div>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 flex flex-col py-2"
                  >
                    <button onClick={() => { setTab('profile'); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-white/80">
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button onClick={() => { navigate('/employee-login/bank-details'); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-white/80">
                      <Landmark className="w-4 h-4 text-purple-400" /> Bank Details
                    </button>
                    <button onClick={() => { setTab('security'); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-white/80">
                      <Shield className="w-4 h-4" /> Security Settings
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-sm text-red-400">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">{new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {session.name.split(' ')[0]} <span className="inline-block animate-bounce">👋</span></h2>
                        <p className="text-white/60">Ready to conquer the day? Here is your summary.</p>
                      </div>
                      <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-accent/20 to-transparent pointer-events-none"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Present Days', val: history.filter(h => h.status === 'present').length, icon: CheckCircle2, color: 'text-green-400', tabId: 'attendance' },
                        { label: 'Pending Leaves', val: leaves.filter(l => l.status === 'pending').length, icon: FileText, color: 'text-yellow-400', tabId: 'leave' },
                        { label: 'Unread Notifications', val: unreadCount, icon: Bell, color: 'text-red-400', tabId: 'announcements' },
                        {label: 'Work Logs Today', val: tasks.length, icon: Briefcase, color: 'text-accent-cyan', tabId: 'tasks'},
                      ].map((s, i) => (
                        <Tilt key={i} options={{ max: 15, scale: 1.05, speed: 400 }}>
                          <div onClick={() => setTab(s.tabId)} className="glass-panel p-6 rounded-2xl flex items-center justify-between group cursor-pointer">
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

                    {/* Performance Leaderboard */}
                    <div className="glass-panel p-8 rounded-3xl space-y-6">
                      <div>
                        <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                          <Trophy className="w-5.5 h-5.5 text-yellow-400" /> Performance Leaderboard
                        </h3>
                        <p className="text-white/40 text-xs mt-1">Real-time rankings based on cumulative closed sales and productivity metrics.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px] font-semibold">
                              <th className="py-3 px-4 text-center w-24">Rank</th>
                              <th className="py-3 px-4">Employee</th>
                              <th className="py-3 px-4 text-center">Sales Closed</th>
                              <th className="py-3 px-4 text-center">Leads Generated</th>
                              <th className="py-3 px-4 text-center">Calls Made</th>
                              <th className="py-3 px-4 text-center">Follow-ups</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {getEmployeeRankings().map((emp, index) => {
                              const rank = index + 1;
                              const isSelf = emp.id === session.employeeId;
                              let rankBadge = `#${rank}`;
                              let rankColorClass = "text-white/60";
                              let rankBgClass = "bg-white/5";
                              if (rank === 1) {
                                rankBadge = "🥇 1st";
                                rankColorClass = "text-yellow-400 font-bold";
                                rankBgClass = "bg-yellow-500/10 border border-yellow-500/20";
                              } else if (rank === 2) {
                                rankBadge = "🥈 2nd";
                                rankColorClass = "text-slate-300 font-bold";
                                rankBgClass = "bg-slate-300/10 border border-slate-300/20";
                              } else if (rank === 3) {
                                rankBadge = "🥉 3rd";
                                rankColorClass = "text-amber-600 font-bold";
                                rankBgClass = "bg-amber-600/10 border border-amber-600/20";
                              }

                              return (
                                <tr 
                                  key={emp.id} 
                                  className={`transition-all duration-200 ${
                                    isSelf 
                                      ? 'bg-accent-violet/10 border-y border-accent-violet/25 hover:bg-accent-violet/15' 
                                      : 'hover:bg-white/5'
                                  }`}
                                >
                                  <td className="py-4 px-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${rankColorClass} ${rankBgClass}`}>
                                      {rankBadge}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-accent-cyan text-xs uppercase shrink-0 overflow-hidden">
                                        {emp.avatar ? (
                                          <img src={emp.avatar} alt={emp.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                          emp.fullName.split(' ').map(n => n[0]).join('')
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-white flex items-center gap-1.5">
                                          {emp.fullName}
                                          {isSelf && (
                                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-accent-violet/30 border border-accent-violet/50 text-accent-violet font-bold uppercase tracking-wider animate-pulse">You</span>
                                          )}
                                        </span>
                                        <span className="text-[10px] text-white/40">{emp.designation} • {emp.department}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center font-bold text-purple-400 font-mono text-base">
                                    {emp.totalSales}
                                  </td>
                                  <td className="py-4 px-4 text-center font-mono text-white/70">
                                    {emp.totalLeads}
                                  </td>
                                  <td className="py-4 px-4 text-center font-mono text-white/70">
                                    {emp.totalCalls}
                                  </td>
                                  <td className="py-4 px-4 text-center font-mono text-white/70">
                                    {emp.totalFollowups}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
                            <CustomDateInput value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">To Date</label>
                            <CustomDateInput value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" required />
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
                {tab === 'tasks' && (() => {
                  const totalCalls = tasks.reduce((sum, t) => sum + (Number(t.calls) || 0), 0);
                  const totalLeads = tasks.reduce((sum, t) => sum + (Number(t.leads) || 0), 0);
                  const totalFollowups = tasks.reduce((sum, t) => sum + (Number(t.followups) || 0), 0);
                  const totalSales = tasks.reduce((sum, t) => sum + (Number(t.sales) || 0), 0);
                  
                  return (
                    <div className="space-y-8">
                      {/* Work Log KPI Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">Total Calls Today</p>
                            <p className="text-3xl font-heading font-bold text-accent-cyan">{totalCalls}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20 group-hover:bg-accent-cyan/20 transition-all duration-300">
                            <Phone className="w-6 h-6 text-accent-cyan" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">Total Leads Today</p>
                            <p className="text-3xl font-heading font-bold text-green-400">{totalLeads}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-all duration-300">
                            <UserPlus className="w-6 h-6 text-green-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">Total Follow Ups Today</p>
                            <p className="text-3xl font-heading font-bold text-yellow-400">{totalFollowups}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-all duration-300">
                            <RefreshCw className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">Sales Made Today</p>
                            <p className="text-3xl font-heading font-bold text-purple-400">{totalSales}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all duration-300">
                            <DollarSign className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                          <div className="glass-panel p-6 rounded-3xl">
                            <h3 className="font-heading font-bold text-lg mb-6 text-white">Log Work Metrics</h3>
                            <form onSubmit={handleTaskSubmit} className="flex flex-col gap-5">
                              <div className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Total Calls</label>
                                <input type="number" min="0" value={taskForm.calls} onChange={(e) => setTaskForm({ ...taskForm, calls: e.target.value })}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="e.g. 25" required />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Total Leads</label>
                                <input type="number" min="0" value={taskForm.leads} onChange={(e) => setTaskForm({ ...taskForm, leads: e.target.value })}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="e.g. 5" required />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Total Follow Ups</label>
                                <input type="number" min="0" value={taskForm.followups} onChange={(e) => setTaskForm({ ...taskForm, followups: e.target.value })}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="e.g. 12" required />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Sales Made</label>
                                <input type="number" min="0" value={taskForm.sales} onChange={(e) => setTaskForm({ ...taskForm, sales: e.target.value })}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-white text-sm" placeholder="e.g. 2" required />
                              </div>
                              <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                                Log Metrics
                              </button>
                            </form>
                          </div>
                        </div>
                        
                        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden h-fit">
                          <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-heading font-bold text-lg text-white">Today's Logged Metrics</h3>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-medium">
                              {tasks.length} entries
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs">
                                <tr>
                                  <th className="px-6 py-4 font-semibold">Time</th>
                                  <th className="px-6 py-4 font-semibold text-center">Calls</th>
                                  <th className="px-6 py-4 font-semibold text-center">Leads</th>
                                  <th className="px-6 py-4 font-semibold text-center">Follow Ups</th>
                                  <th className="px-6 py-4 font-semibold text-center">Sales Made</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {tasks.length === 0 ? (
                                  <tr><td colSpan="5" className="p-8 text-center text-white/40">No work logged today.</td></tr>
                                ) : tasks.map((t, i) => (
                                  <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white/60 font-medium">{fmt(t.createdAt)}</td>
                                    <td className="px-6 py-4 text-center text-accent-cyan font-bold font-mono text-base">{t.calls ?? '—'}</td>
                                    <td className="px-6 py-4 text-center text-green-400 font-bold font-mono text-base">{t.leads ?? '—'}</td>
                                    <td className="px-6 py-4 text-center text-yellow-400 font-bold font-mono text-base">{t.followups ?? '—'}</td>
                                    <td className="px-6 py-4 text-center text-purple-400 font-bold font-mono text-base">{t.sales ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                                <div className="flex gap-2">
                                  <button onClick={() => setSelectedPayslip(p)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold transition-all border border-white/10 flex items-center justify-center gap-1.5 text-xs">
                                    <Eye className="w-3.5 h-3.5 text-accent-cyan"/> View
                                  </button>
                                  <button onClick={() => printPayslip(p)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30 text-white/80 font-semibold transition-all border border-white/10 flex items-center justify-center gap-1.5 text-xs">
                                    <Download className="w-3.5 h-3.5 text-green-400"/> Download
                                  </button>
                                </div>
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
                        <label className="inline-block cursor-pointer px-6 py-2 rounded-full bg-white/10 text-white/80 font-medium text-sm group-hover:bg-accent-cyan/20 group-hover:text-accent-cyan transition-colors border border-white/10">
                          Browse Files
                          <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleDocumentUpload} />
                        </label>
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
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedDocument(d)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 text-xs hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1.5 font-semibold">
                                      <Eye className="w-3.5 h-3.5 text-accent-cyan" /> View
                                    </button>
                                    <button onClick={() => handleDownloadDoc(d)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 text-xs hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1.5 font-semibold">
                                      <Download className="w-3.5 h-3.5 text-accent" /> Download
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
                  <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent/20 blur-[60px] pointer-events-none mix-blend-screen"></div>
                    <div className="w-32 h-32 mx-auto rounded-full glass-panel border-4 border-white/10 flex items-center justify-center mb-4 relative z-10 overflow-hidden bg-black/40 group">
                      {empData.avatar ? (
                         <img src={empData.avatar} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                      ) : (
                         <User className="w-16 h-16 text-white/50 group-hover:opacity-50 transition-opacity" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/40 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-white tracking-widest">UPDATE</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpdate} />
                      </label>
                    </div>
                    <label className="cursor-pointer inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 text-white/70 font-medium text-xs hover:bg-white/10 transition-all border border-white/10 relative z-10">
                      Update Picture
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpdate} />
                    </label>
                    <h3 className="text-2xl font-heading font-bold text-white relative z-10">{empData.fullName}</h3>
                    <p className="text-accent-cyan font-medium mb-6 relative z-10">{empData.designation}</p>
                    
                    <div className="space-y-4 text-left relative z-10">
                      {[
                        ['Employee ID', empData.id],
                        ['Date of Joining', empData.dateOfJoining ? fmtDate(empData.dateOfJoining) : 'N/A'],
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
                )}

                {/* ── SECURITY SETTINGS TAB ── */}
                {tab === 'security' && empData && (
                  <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl h-fit">
                    <h3 className="text-2xl font-heading font-bold text-white mb-2">Security Settings</h3>
                    <p className="text-white/50 mb-8">Update your password to ensure your account remains secure.</p>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
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
                      <button type="submit" className="px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20 mt-4">
                        Update Password
                      </button>
                    </form>
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
                  <p className="text-white font-medium">{empData?.designation || 'Software Developer'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Department</p>
                  <p className="text-white font-medium">{empData?.department || 'Engineering'}</p>
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
                      ⚠️ Please upload a new document to view your file here.
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
    </div>
  );
}
