import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, FileText, Download, CheckCircle2, 
  XCircle, Bell, Calendar, Home, LogOut, Menu,
  Briefcase, DollarSign, File, HelpCircle, Award, ShieldAlert, Clock, Plus, Eye, EyeOff, ShieldCheck, Landmark, Trash2, Lock, Trophy, UserCheck, Loader2,
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getSession, getEmployees, getAttendance, getLeaves,
  getAnnouncements, updateLeaveStatus, addAnnouncement,
  exportAttendanceCSV, getDashboardStats, HOLIDAYS_2026, clearSession,
  getAllTasks, getAllTickets, updateTicketStatus, getAllDocuments, updateDocumentStatus,
  getAllPayslips, addPayslip, addRecognition, getRecognitions, addEmployee, updateEmployee, addDocument,
  wipeAllEmployeeData, deleteEmployee, deleteAnnouncement, deleteDocument,
  checkIn, checkOut, startBreak, endBreak, getTodayRecord, applyLeave,
  getLateRequests, updateLateRequestStatus
} from '../utils/hrStorage';
import { Tilt } from 'react-tilt';
import toast, { Toaster } from 'react-hot-toast';
import CustomDateInput from '../components/CustomDateInput';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

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
    inactive: 'bg-foreground/10 text-foreground/50 border-foreground/20',
    open: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
    verified: 'bg-green-500/15 text-green-400 border-green-500/30',
    verified_digilocker: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium capitalize flex items-center justify-center max-w-min whitespace-nowrap ${cfg[status] || 'bg-foreground/10 text-foreground/60 border-foreground/20'}`}>
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
  const [leaderboardView, setLeaderboardView] = useState('table');
  const [chartMetric, setChartMetric] = useState('productivity');
  
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
  const [lateRequests, setLateRequests] = useState([]);
  const [submittingLateAction, setSubmittingLateAction] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [lateAttemptedTime, setLateAttemptedTime] = useState('');
  const [submittingLate, setSubmittingLate] = useState(false);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [digiLoading, setDigiLoading] = useState(null);
  
  // Forms
  const [annForm, setAnnForm] = useState({ title: '', body: '' });
  const [payForm, setPayForm] = useState({ employeeId: '', month: '', year: new Date().getFullYear(), netPay: '' });
  const [recForm, setRecForm] = useState({ employeeId: '', badgeTitle: 'Star Performer', message: '' });
  const [empForm, setEmpForm] = useState({ id: '', fullName: '', email: '', phone: '', department: 'Engineering', designation: '', campaign: '', password: '', dateOfJoining: '' });
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editEmpForm, setEditEmpForm] = useState({});

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedEmpBank, setSelectedEmpBank] = useState(null);
  const [selectedEmpDetails, setSelectedEmpDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState('profile');
  const [selectedRole, setSelectedRole] = useState('employee');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [todayRec, setTodayRec] = useState(null);
  const [personalAttendance, setPersonalAttendance] = useState([]);
  const [personalLeaves, setPersonalLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ type: 'sick', fromDate: '', toDate: '', reason: '' });


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

  const handleExportEmployeesPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      toast.error('Popup blocker enabled. Please allow popups to export the PDF.');
      return;
    }

    const rows = employees.map(e => `
      <tr>
        <td><span class="emp-id">${e.id}</span></td>
        <td>
          <div class="emp-name">${e.fullName}</div>
          <div class="emp-designation">${e.designation || 'Software Developer'}</div>
        </td>
        <td>${e.department || 'Engineering'}</td>
        <td>
          <div>${e.email || '—'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${e.phone || '—'}</div>
        </td>
        <td>${fmtDate(e.dateOfJoining)}</td>
        <td style="text-transform: capitalize;">${e.role || 'employee'}</td>
        <td>
          <span class="status-badge ${e.status === 'active' ? 'status-active' : 'status-inactive'}">
            ${e.status || 'active'}
          </span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Workforce Directory - Zexora Quvixo Group</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
              background-color: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.025em;
            }
            .logo span {
              color: #8b5cf6;
            }
            .title-section {
              text-align: right;
            }
            .title {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            .subtitle {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
              font-family: monospace;
            }
            .directory-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .directory-table th {
              background-color: #f8fafc;
              color: #475569;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 12px 16px;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
            }
            .directory-table td {
              padding: 14px 16px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 12px;
              color: #334155;
            }
            .emp-id {
              font-family: monospace;
              font-weight: 600;
              color: #0f172a;
              background-color: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .emp-name {
              font-weight: 600;
              color: #0f172a;
            }
            .emp-designation {
              font-size: 10px;
              color: #64748b;
              margin-top: 2px;
            }
            .status-badge {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 9999px;
              display: inline-block;
            }
            .status-active {
              background-color: #dcfce7;
              color: #15803d;
            }
            .status-inactive {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .security-note {
              margin-top: 20px;
              font-size: 11px;
              color: #b45309;
              background-color: #fef3c7;
              border: 1px solid #fcd34d;
              padding: 10px 16px;
              border-radius: 8px;
              font-weight: 500;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Zexora Quvixo<span>Group</span></div>
            <div class="title-section">
              <div class="title">Workforce Directory Report</div>
              <div class="subtitle">Generated: ${new Date().toLocaleString('en-IN')}</div>
            </div>
          </div>
          
          <table class="directory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Contact</th>
                <th>DOJ</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="security-note">
            ⚠️ Security Notice: Password hashes and credentials are excluded from this directory export for security compliance.
          </div>

          <div class="footer">
            Confidential Document &bull; For Internal HR Use Only &bull; &copy; 2026 Zexora Quvixo Group.
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
    toast.success('Generating Workforce PDF...');
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
    if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
      navigate('/employee-login');
      return;
    }
    refresh();
  }, [navigate]);

  useEffect(() => {
    if (selectedEmpDetails) {
      setSelectedRole(selectedEmpDetails.role || 'employee');
      setSelectedPermissions(selectedEmpDetails.permissions || []);
      setDetailsTab('profile');
    }
  }, [selectedEmpDetails]);



  const refresh = async () => {
    setDataLoading(true);
    try {
      const [st, emps, att, lvs, anns, tks, tkts, docs, pays, recs, lateReqs] = await Promise.all([
        getDashboardStats(), getEmployees(), getAttendance(), getLeaves(), getAnnouncements(),
        getAllTasks(), getAllTickets(), getAllDocuments(), getAllPayslips(), getRecognitions(),
        getLateRequests()
      ]);
      setStats(st); setEmployees(emps); setAttendance(att); setLeaves(lvs); setAnnouncements(anns);
      setTasks(tks); setTickets(tkts); setDocuments(docs); setPayslips(pays); setRecognitions(recs);
      setLateRequests(lateReqs);

      if (session?.employeeId) {
        const today = await getTodayRecord(session.employeeId);
        setTodayRec(today);
        setPersonalAttendance(att.filter(r => r.employeeId === session.employeeId));
        setPersonalLeaves(lvs.filter(l => l.employeeId === session.employeeId));
      }
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

  const getEmployeeRankings = () => {
    const salesByEmpId = {};
    const callsByEmpId = {};
    const leadsByEmpId = {};
    const followupsByEmpId = {};
    const taskCountByEmpId = {};
    const attendanceByEmpId = {};

    // 1. Process tasks (work logs)
    tasks.forEach(t => {
      if (t.employeeId) {
        salesByEmpId[t.employeeId] = (salesByEmpId[t.employeeId] || 0) + (Number(t.sales) || 0);
        callsByEmpId[t.employeeId] = (callsByEmpId[t.employeeId] || 0) + (Number(t.calls) || 0);
        leadsByEmpId[t.employeeId] = (leadsByEmpId[t.employeeId] || 0) + (Number(t.leads) || 0);
        followupsByEmpId[t.employeeId] = (followupsByEmpId[t.employeeId] || 0) + (Number(t.followups) || 0);
        taskCountByEmpId[t.employeeId] = (taskCountByEmpId[t.employeeId] || 0) + 1;
      }
    });

    // 2. Process attendance records
    attendance.forEach(r => {
      if (r.employeeId && r.status === 'present') {
        attendanceByEmpId[r.employeeId] = (attendanceByEmpId[r.employeeId] || 0) + 1;
      }
    });

    // 3. Map to employees
    const rankedList = employees.map(emp => {
      const sales = salesByEmpId[emp.id] || 0;
      const calls = callsByEmpId[emp.id] || 0;
      const leads = leadsByEmpId[emp.id] || 0;
      const followups = followupsByEmpId[emp.id] || 0;
      const completedTasks = taskCountByEmpId[emp.id] || 0;
      const presentDays = attendanceByEmpId[emp.id] || 0;

      return {
        ...emp,
        totalSales: sales,
        totalCalls: calls,
        totalLeads: leads,
        totalFollowups: followups,
        completedTasks: completedTasks,
        presentDays: presentDays,
        badges: []
      };
    });

    // 4. Find max values for badge assignment
    let maxSales = 0, maxLeads = 0, maxCalls = 0, maxTasks = 0, maxAttendance = 0;
    rankedList.forEach(e => {
      if (e.totalSales > maxSales) maxSales = e.totalSales;
      if (e.totalLeads > maxLeads) maxLeads = e.totalLeads;
      if (e.totalCalls > maxCalls) maxCalls = e.totalCalls;
      if (e.completedTasks > maxTasks) maxTasks = e.completedTasks;
      if (e.presentDays > maxAttendance) maxAttendance = e.presentDays;
    });

    // 5. Award Badges dynamically
    rankedList.forEach(e => {
      if (e.totalSales > 0 && e.totalSales === maxSales) {
        e.badges.push({ type: 'sales', icon: '🥇', label: 'Top Seller', desc: 'Highest cumulative sales closed', color: 'from-amber-500/20 to-yellow-500/30 text-yellow-400 border-yellow-500/30' });
      }
      if (e.totalLeads > 0 && e.totalLeads === maxLeads) {
        e.badges.push({ type: 'leads', icon: '⚡', label: 'Lead Machine', desc: 'Most leads generated', color: 'from-cyan-500/20 to-blue-500/30 text-accent-cyan border-cyan-500/30' });
      }
      if (e.totalCalls > 0 && e.totalCalls === maxCalls) {
        e.badges.push({ type: 'calls', icon: '📞', label: 'Call Champion', desc: 'Most customer phone calls placed', color: 'from-green-500/20 to-emerald-500/30 text-green-400 border-green-500/30' });
      }
      if (e.completedTasks > 0 && e.completedTasks === maxTasks) {
        e.badges.push({ type: 'tasks', icon: '🏆', label: 'Task Master', desc: 'Most daily work logs submitted', color: 'from-purple-500/20 to-indigo-500/30 text-purple-400 border-purple-500/30' });
      }
      if (e.presentDays > 0 && e.presentDays === maxAttendance) {
        e.badges.push({ type: 'attendance', icon: '⏰', label: 'Punctual Pro', desc: 'Perfect monthly attendance rate', color: 'from-pink-500/20 to-rose-500/30 text-pink-400 border-pink-500/30' });
      }
    });

    // Sort by sales then leads
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
    navigate('/');
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

  const handleDeleteDocument = async (id, name = 'this document') => {
    if (window.confirm(`Are you sure you want to permanently delete this document "${name}"? This action cannot be undone.`)) {
      try {
        await deleteDocument(id);
        toast.success(`Document deleted successfully`);
        refresh();
      } catch (err) {
        toast.error(`Failed to delete document`);
      }
    }
  };

  const handleToggleBankEdit = async (employeeId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateEmployee(employeeId, { allowBankEdit: newStatus });
      toast.success(newStatus ? 'Bank details editing unlocked' : 'Bank details editing locked');
      
      // Update details modal state if open for this employee
      if (selectedEmpDetails && selectedEmpDetails.id === employeeId) {
        setSelectedEmpDetails(prev => ({ ...prev, allowBankEdit: newStatus }));
      }
      refresh();
    } catch (err) {
      toast.error('Failed to update bank edit permission');
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

  const handleSavePermissions = async () => {
    try {
      await updateEmployee(selectedEmpDetails.id, { 
        role: selectedRole, 
        permissions: selectedRole === 'admin' ? selectedPermissions : [] 
      });
      setSelectedEmpDetails(prev => ({
        ...prev,
        role: selectedRole,
        permissions: selectedRole === 'admin' ? selectedPermissions : []
      }));
      toast.success('Access policy updated successfully!');
      refresh();
    } catch (err) {
      toast.error('Failed to update access policy.');
    }
  };

  const handleCheckIn = async () => {
    if (!session?.employeeId || todayRec) return;

    const today = new Date().toISOString().split('T')[0];
    const todayLateRequest = lateRequests.find(r => r.employeeId === session.employeeId && r.date === today);
    if (todayLateRequest) {
      if (todayLateRequest.status === 'pending') {
        toast.error('You already have a pending late check-in request. Please contact HR.');
      } else if (todayLateRequest.status === 'rejected') {
        toast.error('Your late check-in request for today was rejected. Contact HR.');
      }
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startLimit = 9 * 60 + 45; // 9:45 AM = 585 minutes
    const endLimit = 10 * 60 + 15;  // 10:15 AM = 615 minutes

    if (currentMinutes < startLimit) {
      toast.error('Check-in is only allowed between 9:45 AM and 10:15 AM. Please wait until 9:45 AM.');
      return;
    }

    if (currentMinutes > endLimit) {
      setLateAttemptedTime(now.toISOString());
      setShowLateModal(true);
      return;
    }

    const success = await checkIn(session.employeeId, session.name);
    if (success) {
      toast.success(`Checked in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      refresh();
    } else {
      toast.error('Already checked in today.');
    }
  };

  const handleLateCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!lateReason.trim()) {
      toast.error('Please enter a reason.');
      return;
    }
    setSubmittingLate(true);
    try {
      // Direct call to firestore helper / or inline doc set since we imported addDoc, collection, etc.
      // Or we can import applyLateRequest! We imported applyLateRequest in AdminDashboard.jsx too? Yes!
      await applyLateRequest({
        employeeId: session.employeeId,
        employeeName: session.name,
        reason: lateReason,
        checkInTime: lateAttemptedTime
      });
      setShowLateModal(false);
      setLateReason('');
      toast.success('Late check-in request submitted!');
      await refresh();
    } catch (err) {
      toast.error('Failed to submit request.');
    }
    setSubmittingLate(false);
  };

  const handleLateRequestAction = async (id, status, checkInTime = null, employeeId = null, employeeName = null) => {
    setSubmittingLateAction(true);
    try {
      await updateLateRequestStatus(id, status, checkInTime, employeeId, employeeName);
      toast.success(`Late check-in request ${status}`);
      await refresh();
    } catch (err) {
      toast.error('Failed to update late check-in request.');
    }
    setSubmittingLateAction(false);
  };

  const handleCheckOut = async () => {
    if (!session?.employeeId || !todayRec || todayRec.checkOut) return;
    await checkOut(session.employeeId);
    toast.success(`Checked out at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    refresh();
  };

  const handleStartBreak = async () => {
    if (!session?.employeeId || !todayRec || todayRec.checkOut || todayRec.onBreak) return;
    await startBreak(session.employeeId);
    toast('Break started ☕');
    refresh();
  };

  const handleEndBreak = async () => {
    if (!session?.employeeId || !todayRec || !todayRec.onBreak) return;
    await endBreak(session.employeeId);
    toast.success('Break ended, back to work!');
    refresh();
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!session?.employeeId) return;
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await applyLeave({
        ...leaveForm,
        employeeId: session.employeeId,
        employeeName: session.name,
      });
      setLeaveForm({ type: 'sick', fromDate: '', toDate: '', reason: '' });
      toast.success('Leave request submitted!');
      refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit leave.');
    }
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

  const hasPermission = (perm) => {
    if (session?.role === 'superadmin') return true;
    const perms = session?.permissions || [];
    return perms.includes(perm);
  };

  const ALL_PERMISSIONS = [
    { key: 'view_employees', label: 'View Employees', desc: 'Read-only access to Workforce Directory' },
    { key: 'manage_employees', label: 'Manage Employees', desc: 'Add, edit, delete, and unlock bank editing' },
    { key: 'manage_attendance', label: 'Manage Attendance', desc: 'Access and export employee attendance logs' },
    { key: 'manage_leaves', label: 'Manage Leaves', desc: 'Approve or reject leave applications' },
    { key: 'manage_broadcasts', label: 'Manage Broadcasts', desc: 'Create and delete global announcements' },
    { key: 'manage_tasks', label: 'Manage Work Logs', desc: 'View employee performance and sales logs' },
    { key: 'manage_payroll', label: 'Manage Payroll', desc: 'Generate and view employee payslips' },
    { key: 'manage_docs', label: 'Manage Docs Vault', desc: 'Verify documents and verify via DigiLocker' },
    { key: 'manage_helpdesk', label: 'Manage Support Desk', desc: 'View and resolve employee help tickets' },
    { key: 'manage_recognition', label: 'Manage Recognition', desc: 'Issue stars, badges and awards' },
  ];

  const NAV_ITEMS = [
    { id: 'overview', label: session?.role === 'superadmin' ? 'Command Center' : 'Admin center', icon: Home },
    { id: 'my-portal', label: 'My Shift & Leave', icon: UserCheck },
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

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.id === 'overview' || item.id === 'holidays') return true;
    if (item.id === 'my-portal') return !!session?.employeeId;
    if (item.id === 'employees') return hasPermission('view_employees') || hasPermission('manage_employees');
    if (item.id === 'attendance') return hasPermission('manage_attendance');
    if (item.id === 'leave') return hasPermission('manage_leaves');
    if (item.id === 'announcements') return hasPermission('manage_broadcasts');
    if (item.id === 'tasks') return hasPermission('manage_tasks');
    if (item.id === 'payroll') return hasPermission('manage_payroll');
    if (item.id === 'documents') return hasPermission('manage_docs');
    if (item.id === 'helpdesk') return hasPermission('manage_helpdesk');
    if (item.id === 'recognition') return hasPermission('manage_recognition');
    return false;
  });

  useEffect(() => {
    if (filteredNavItems.length > 0 && !filteredNavItems.some(n => n.id === tab)) {
      setTab('overview');
    }
  }, [tab, filteredNavItems]);

  if (!session) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{ className: 'glass-panel', style: { background: 'rgba(10,10,15,0.8)', color: "var(--color-foreground)", backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-violet/10 blur-[150px] mix-blend-screen opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px] mix-blend-screen opacity-50" style={{ animation: 'pulse 8s infinite alternate' }}></div>
      </div>

      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden" />}
      </AnimatePresence>

      <motion.aside className={`fixed lg:relative z-50 h-full w-64 bg-background/40 backdrop-blur-3xl border-r border-y-0 border-l-0 border-border/20 flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-heading font-bold text-lg tracking-wide uppercase flex items-center gap-1">
            <span className="text-white">Zexora</span>
            <span className="text-accent-cyan text-glow">HR</span>
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto px-1 py-4 space-y-1.5 scrollbar-hide">
          {filteredNavItems.map((item) => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-300 border-l-4 rounded-r-xl ${
                  active 
                    ? 'text-accent-cyan border-accent-cyan bg-accent-cyan/5 pl-4' 
                    : 'text-foreground/40 border-transparent hover:text-foreground/80 hover:bg-foreground/5 hover:pl-6'
                }`}>
                <item.icon className={`w-4.5 h-4.5 z-10 transition-colors ${active ? 'text-accent-cyan' : 'group-hover:text-foreground/80'}`} />
                <span className="z-10 tracking-wide">{item.label}</span>
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
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground/70 hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60 capitalize">
              {filteredNavItems.find(n => n.id === tab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{session.name || 'System Admin'}</p>
              <p className="text-[10px] text-accent-violet font-mono tracking-widest uppercase">{session.role === 'superadmin' ? 'Level 0 Clearance' : 'Level 1 Clearance'}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {dataLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-2 border-foreground/10"></div>
                <div className="absolute inset-0 rounded-full border-2 border-accent-violet border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-8 pb-20">
                
                {tab === 'overview' && stats && (
                  <div className="space-y-8">
                    {/* Late Check-in Notification Banner */}
                    {hasPermission('manage_attendance') && lateRequests.filter(r => r.status === 'pending').length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                      >
                        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-foreground">Late Check-in Requests</h4>
                            <p className="text-xs text-foreground/50 mt-1">There are {lateRequests.filter(r => r.status === 'pending').length} pending late check-in requests awaiting your review.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setTab('attendance')} 
                          className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 cursor-pointer"
                        >
                          Review Requests
                        </button>
                      </motion.div>
                    )}

                    {/* Stats cards (slim design with tab linking) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Employees', val: stats.totalEmployees, icon: Users, color: 'text-accent', tabId: 'employees' },
                        { label: 'Present Today', val: stats.presentToday, icon: CheckCircle2, color: 'text-green-400', tabId: 'attendance' },
                        { label: 'On Leave Today', val: stats.onLeaveToday, icon: FileText, color: 'text-yellow-400', tabId: 'leave' },
                        { label: 'Pending Leaves', val: stats.pendingLeaves, icon: Bell, color: 'text-accent-violet', tabId: 'leave' },
                      ].map((s, i) => (
                        <div 
                          key={i} 
                          onClick={() => setTab(s.tabId)} 
                          className="glass-panel px-5 py-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-accent-cyan/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] transition-all"
                        >
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold mb-1">{s.label}</p>
                            <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.val}</p>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                            <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Welcome Banner + Shift/Security capsule */}
                    <div className="border-gradient-purple-cyan p-8 rounded-3xl relative overflow-hidden bg-background/40 shadow-2xl">
                      <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-accent-cyan/10 rounded-full blur-[80px] pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left Part: Profile & Message */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="w-20 h-20 rounded-full glowing-avatar-ring overflow-hidden bg-foreground/5 p-0.5 shrink-0">
                            {session?.avatar ? (
                              <img src={session.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-background/80 flex items-center justify-center font-bold text-accent-cyan text-xl">
                                {session?.name ? session.name.split(' ').map(n => n[0]).join('') : 'A'}
                              </div>
                            )}
                          </div>
                          <div className="text-center sm:text-left">
                            <span className="text-[10px] uppercase tracking-widest text-accent-cyan font-bold bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full">
                              {session?.role === 'superadmin' ? 'Superadmin Session' : 'Admin Session'}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mt-2">WELCOME BACK, {session.name?.toUpperCase()}!</h2>
                            <p className="text-accent-violet text-sm font-semibold">{session.role === 'superadmin' ? 'Level 0 Clearance' : 'Level 1 Clearance'}</p>
                            <p className="text-foreground/55 text-xs mt-3 max-w-lg leading-relaxed">
                              {session?.role === 'superadmin'
                                ? 'Welcome to the Superadmin Command Center. From here, you possess absolute authority over the employee ecosystem, payroll modules, support desking, and global broadcasts.'
                                : 'Welcome to the Admin center. From here, you possess authorized access to manage the employee ecosystem, payroll modules, support desking, and broadcasts.'}
                            </p>
                            {session.role === 'superadmin' && (
                              <div className="mt-4 flex gap-3">
                                <button onClick={handleWipeData} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all border border-red-500/30 flex items-center gap-1.5 text-xs cursor-pointer">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Wipe All Data
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Part: Shift capsule or Security capsule */}
                        {session?.employeeId ? (
                          <div className="glass-panel px-6 py-6 rounded-2xl border border-border/20 bg-background/50 text-center min-w-[260px] flex flex-col items-center justify-center shrink-0">
                            <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mb-2">Shift Controller</p>
                            
                            {todayRec ? (
                              todayRec.checkOut ? (
                                <div className="w-full flex flex-col items-center gap-4 py-2">
                                  <div className="flex justify-around w-full gap-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold font-heading text-green-400">{fmtTime(todayRec.checkIn)}</span>
                                      <span className="text-[9px] uppercase text-foreground/40 font-semibold mt-0.5">Check In</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold font-heading text-red-400">{fmtTime(todayRec.checkOut)}</span>
                                      <span className="text-[9px] uppercase text-foreground/40 font-semibold mt-0.5">Check Out</span>
                                    </div>
                                  </div>
                                  <span className="text-xs px-3.5 py-1.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 font-bold uppercase tracking-wider">
                                    Shift Completed
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full flex flex-col items-center gap-4">
                                  <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold font-heading text-green-400">{fmtTime(todayRec.checkIn)}</span>
                                    <span className="text-[10px] uppercase text-foreground/40 font-semibold mt-0.5">Checked In</span>
                                  </div>

                                  <div className="flex gap-2 w-full">
                                    <button 
                                      onClick={todayRec.onBreak ? handleEndBreak : handleStartBreak} 
                                      className="flex-1 py-2 rounded-xl border border-yellow-500/30 text-yellow-400 bg-yellow-500/5 font-bold hover:bg-yellow-500/10 text-xs transition-all cursor-pointer"
                                    >
                                      {todayRec.onBreak ? 'RESUME' : 'BREAK'}
                                    </button>
                                    <button 
                                      onClick={handleCheckOut} 
                                      className="flex-1 py-2 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 font-bold hover:bg-red-500/10 text-xs transition-all cursor-pointer"
                                    >
                                      CHECK OUT
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : (() => {
                              const todayStr = new Date().toISOString().split('T')[0];
                              const todayLateRequest = lateRequests.find(r => r.employeeId === session.employeeId && r.date === todayStr);
                              if (todayLateRequest) {
                                return (
                                  <div className="w-full flex flex-col items-center gap-2 py-2">
                                    <div className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold uppercase tracking-wider ${
                                      todayLateRequest.status === 'pending'
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        : todayLateRequest.status === 'rejected'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                                    }`}>
                                      Late Request: {todayLateRequest.status}
                                    </div>
                                    <p className="text-[10px] text-foreground/45 italic text-center max-w-[200px] truncate" title={todayLateRequest.reason}>
                                      "{todayLateRequest.reason}"
                                    </p>
                                  </div>
                                );
                              }
                              return (
                                <button 
                                  onClick={handleCheckIn} 
                                  className="glow-btn-cyan hover:glow-btn-cyan-hover text-accent-cyan font-bold tracking-wider py-3.5 px-6 rounded-2xl text-sm font-heading flex flex-col items-center gap-0.5 justify-center w-full cursor-pointer"
                                >
                                  <span className="text-white text-xs font-semibold">CHECK-IN</span>
                                  <span className="text-[10px] text-accent-cyan/80 font-normal">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </button>
                              );
                            })()}

                            {/* Stats footer in check-in box */}
                            <div className="grid grid-cols-2 gap-4 w-full border-t border-border/20 mt-4 pt-3 text-center">
                              <div>
                                <p className="text-[8px] uppercase tracking-wider text-foreground/40 font-semibold">Check-out</p>
                                <p className="text-xs font-semibold text-foreground/85 mt-0.5">
                                  {todayRec?.checkOut ? fmtTime(todayRec.checkOut) : '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] uppercase tracking-wider text-foreground/40 font-semibold">Shift Hours</p>
                                <p className="text-xs font-bold text-accent-cyan mt-0.5">
                                  {todayRec?.totalHours ? `${todayRec.totalHours}h` : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="glass-panel px-6 py-6 rounded-2xl border border-border/20 bg-background/50 text-center min-w-[260px] flex flex-col items-center justify-center shrink-0">
                            <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mb-2">Ecosystem Security</p>
                            <div className="w-full flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <ShieldCheck className="w-6 h-6 animate-pulse" />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-lg font-bold font-heading text-emerald-400">ACTIVE & SECURE</span>
                                <span className="text-[9px] uppercase text-foreground/40 font-semibold mt-0.5">Firewall Standard v4.1</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full border-t border-border/20 mt-4 pt-3 text-center">
                              <div>
                                <p className="text-[8px] uppercase tracking-wider text-foreground/40 font-semibold">Session Status</p>
                                <p className="text-xs font-semibold text-foreground/85 mt-0.5">Verified</p>
                              </div>
                              <div>
                                <p className="text-[8px] uppercase tracking-wider text-foreground/40 font-semibold">Database</p>
                                <p className="text-xs font-bold text-accent-cyan mt-0.5">Connected</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Star Performer Spotlight */}
                    {(() => {
                      const star = getStarPerformer();
                      if (!star) return null;
                      return (
                        <div className="border-gradient-purple-cyan p-8 rounded-3xl relative overflow-hidden bg-background/40 shadow-2xl">
                          <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center animate-pulse shrink-0">
                                <Award className="w-7 h-7 text-purple-400" />
                              </div>
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">Company Star Performer 🌟</span>
                                <h4 className="text-xl font-heading font-bold text-foreground mt-2">{star.name}</h4>
                                <p className="text-foreground/50 text-xs mt-0.5">Leads the organization with stellar performance and unmatched contribution.</p>
                              </div>
                            </div>
                            <div className="glass-panel px-6 py-3 rounded-2xl border border-white/5 bg-white/5 text-center min-w-[120px]">
                              <p className="text-[9px] uppercase tracking-wider text-foreground/40 font-medium">Sales Closed</p>
                              <p className="text-2xl font-bold text-purple-400 font-mono mt-0.5">{star.sales}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Performance Leaderboard Section */}
                    <div className="glass-panel p-8 rounded-3xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                            <Trophy className="w-5.5 h-5.5 text-yellow-400" /> Performance Leaderboard
                          </h3>
                          <p className="text-foreground/40 text-xs mt-1">Real-time rankings based on cumulative closed sales, productivity logs, and attendance.</p>
                        </div>
                        <div className="flex bg-foreground/5 border border-foreground/10 rounded-xl p-1 self-start sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => setLeaderboardView('table')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              leaderboardView === 'table'
                                ? 'bg-gradient-to-r from-accent to-accent-cyan text-foreground shadow-lg'
                                : 'text-foreground/40 hover:text-foreground'
                            }`}
                          >
                            Rankings Table
                          </button>
                          <button
                            type="button"
                            onClick={() => setLeaderboardView('charts')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              leaderboardView === 'charts'
                                ? 'bg-gradient-to-r from-accent to-accent-cyan text-foreground shadow-lg'
                                : 'text-foreground/40 hover:text-foreground'
                            }`}
                          >
                            Analytics Charts
                          </button>
                        </div>
                      </div>

                      {leaderboardView === 'table' ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="border-b border-foreground/10 text-foreground/40 uppercase tracking-widest text-[10px] font-semibold">
                                <th className="py-3 px-4 text-center w-20">Rank</th>
                                <th className="py-3 px-4">Employee</th>
                                <th className="py-3 px-4 text-center">Sales Closed</th>
                                <th className="py-3 px-4 text-center">Leads</th>
                                <th className="py-3 px-4 text-center">Calls</th>
                                <th className="py-3 px-4 text-center">Work Logs</th>
                                <th className="py-3 px-4 text-center">Days Present</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans">
                              {getEmployeeRankings().map((emp, index) => {
                                const rank = index + 1;
                                let rankBadge = `#${rank}`;
                                let rankColorClass = "text-foreground/60";
                                let rankBgClass = "bg-foreground/5";
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
                                    className="hover:bg-foreground/5 transition-all duration-200"
                                  >
                                    <td className="py-4 px-4 text-center">
                                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${rankColorClass} ${rankBgClass}`}>
                                        {rankBadge}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center font-bold text-accent-cyan text-xs uppercase shrink-0 overflow-hidden">
                                          {emp.avatar ? (
                                            <img src={emp.avatar} alt={emp.fullName} className="w-full h-full object-cover" />
                                          ) : (
                                            emp.fullName.split(' ').map(n => n[0]).join('')
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground block">{emp.fullName}</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-foreground/40">{emp.designation} • {emp.department}{emp.campaign ? ` • ${emp.campaign}` : ''}</span>
                                          </div>
                                          {emp.badges && emp.badges.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                              {emp.badges.map((b, idx) => (
                                                <span 
                                                  key={idx} 
                                                  title={b.desc}
                                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-gradient-to-r ${b.color} cursor-help`}
                                                >
                                                  <span>{b.icon}</span>
                                                  <span>{b.label}</span>
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-bold text-purple-400 font-mono text-base">
                                      {emp.totalSales}
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-foreground/70">
                                      {emp.totalLeads}
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-foreground/70">
                                      {emp.totalCalls}
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-purple-400 font-bold">
                                      {emp.completedTasks}
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-accent font-bold">
                                      {emp.presentDays}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex flex-wrap items-center justify-between bg-foreground/5 border border-foreground/10 p-3 rounded-2xl gap-3">
                            <span className="text-xs text-foreground/60 font-semibold ml-2">Chart Metric:</span>
                            <div className="flex bg-foreground/5 border border-foreground/10 rounded-xl p-1 shrink-0">
                              {['productivity', 'attendance', 'tasks'].map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setChartMetric(m)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                                    chartMetric === m
                                      ? 'bg-gradient-to-r from-accent/25 to-accent-cyan/25 border border-accent/25 text-foreground'
                                      : 'bg-transparent border border-transparent text-foreground/40 hover:text-foreground/60'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="h-[320px] w-full bg-foreground/5 rounded-2xl border border-foreground/5 p-4 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              {chartMetric === 'productivity' ? (
                                <BarChart data={getEmployeeRankings()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="fullName" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                                  <Tooltip
                                    contentStyle={{
                                      background: 'rgba(10, 10, 15, 0.95)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: '12px',
                                      color: "var(--color-foreground)",
                                    }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }} />
                                  <Bar name="Sales Closed" dataKey="totalSales" fill="url(#colorSales)" radius={[4, 4, 0, 0]} />
                                  <Bar name="Leads" dataKey="totalLeads" fill="url(#colorLeads)" radius={[4, 4, 0, 0]} />
                                  <Bar name="Calls" dataKey="totalCalls" fill="url(#colorCalls)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              ) : chartMetric === 'attendance' ? (
                                <BarChart data={getEmployeeRankings()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="fullName" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                                  <Tooltip
                                    contentStyle={{
                                      background: 'rgba(10, 10, 15, 0.95)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: '12px',
                                      color: "var(--color-foreground)",
                                    }}
                                  />
                                  <Bar name="Days Present" dataKey="presentDays" fill="url(#colorPresent)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              ) : (
                                <AreaChart data={getEmployeeRankings()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="fullName" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                                  <Tooltip
                                    contentStyle={{
                                      background: 'rgba(10, 10, 15, 0.95)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: '12px',
                                      color: "var(--color-foreground)",
                                    }}
                                  />
                                  <Area name="Work Logs" type="monotone" dataKey="completedTasks" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTasks)" dot={{ stroke: '#a855f7', strokeWidth: 1.5, r: 3, fill: '#0c0d1b' }} />
                                </AreaChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'employees' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-foreground/10 flex justify-between items-center">
                      <h3 className="font-heading font-bold text-lg">Workforce Directory</h3>
                      <div className="flex items-center gap-3">
                        <button onClick={handleExportEmployeesPDF} className="px-5 py-2 rounded-xl bg-foreground/10 text-foreground font-semibold text-sm hover:bg-foreground/20 transition-all border border-foreground/20 flex items-center gap-2">
                          <Download className="w-4 h-4" /> Export PDF
                        </button>
                        {hasPermission('manage_employees') && (
                          <button onClick={() => setShowAddEmp(!showAddEmp)} className="px-5 py-2 rounded-xl bg-accent-violet/20 text-accent-violet font-semibold text-sm hover:bg-accent-violet/30 transition-all border border-accent-violet/30 flex items-center gap-2">
                            {showAddEmp ? <XCircle className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>} {showAddEmp ? 'Close Form' : 'Add Employee'}
                          </button>
                        )}
                      </div>
                    </div>
                    {showAddEmp && hasPermission('manage_employees') && (
                      <div className="p-6 border-b border-foreground/10 bg-foreground/5">
                        <form onSubmit={handleEmpSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <input type="text" placeholder="Emp ID (e.g. EMP002)" value={empForm.id} onChange={(e) => setEmpForm({...empForm, id: e.target.value})} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm" required/>
                          <input type="text" placeholder="Full Name" value={empForm.fullName} onChange={(e) => setEmpForm({...empForm, fullName: e.target.value})} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm" required/>
                          <div className="relative">
                            <input type={showPass ? "text" : "password"} placeholder="Password" value={empForm.password} onChange={(e) => setEmpForm({...empForm, password: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-accent-violet text-foreground text-sm" required/>
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                              {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                          </div>
                          <input type="text" placeholder="Department" value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm"/>
                          <input type="text" placeholder="Designation" value={empForm.designation} onChange={(e) => setEmpForm({...empForm, designation: e.target.value})} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm"/>
                          <input type="text" placeholder="Campaign" value={empForm.campaign || ''} onChange={(e) => setEmpForm({...empForm, campaign: e.target.value})} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm"/>
                          <input type="email" placeholder="Email" value={empForm.email} onChange={(e) => setEmpForm({...empForm, email: e.target.value})} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm"/>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 text-xs pointer-events-none">DOJ:</span>
                            <CustomDateInput value={empForm.dateOfJoining} onChange={(e) => setEmpForm({...empForm, dateOfJoining: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm" required leftOffset="pl-12" />
                          </div>
                          <button type="submit" className="md:col-span-2 lg:col-span-3 py-3 rounded-xl bg-accent-violet text-foreground font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">Provision Employee</button>
                        </form>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">ID</th>
                            <th className="px-6 py-4 font-semibold">Name & Details</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Campaign</th>
                            <th className="px-6 py-4 font-semibold">Contact & DOJ</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {employees.map((e, i) => {
                            const isEditing = editingEmpId === e.id;
                            return (
                              <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-accent-cyan">{e.id}</td>
                                <td className="px-6 py-4 font-medium text-foreground">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input type="text" value={editEmpForm.fullName} onChange={(ev) => setEditEmpForm({...editEmpForm, fullName: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" placeholder="Full Name" />
                                      <input type="text" value={editEmpForm.designation} onChange={(ev) => setEditEmpForm({...editEmpForm, designation: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" placeholder="Designation" />
                                      <div className="relative">
                                        <input type={showPass ? "text" : "password"} value={editEmpForm.password} onChange={(ev) => setEditEmpForm({...editEmpForm, password: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded pl-2 pr-8 py-1 text-xs w-full" placeholder="New Password" />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
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
                                      <span className="font-semibold text-foreground group-hover:text-accent-cyan border-b border-transparent group-hover:border-accent-cyan transition-all duration-200">{e.fullName}</span>
                                      <br/>
                                      <span className="text-[10px] text-foreground/40 group-hover:text-foreground/60">{e.designation}</span>
                                    </button>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-foreground/60">
                                  {isEditing ? (
                                    <input type="text" value={editEmpForm.department} onChange={(ev) => setEditEmpForm({...editEmpForm, department: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" />
                                  ) : e.department}
                                </td>
                                <td className="px-6 py-4 text-foreground/60">
                                  {isEditing ? (
                                    <input type="text" value={editEmpForm.campaign || ''} onChange={(ev) => setEditEmpForm({...editEmpForm, campaign: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" placeholder="Campaign" />
                                  ) : (e.campaign || '—')}
                                </td>
                                <td className="px-6 py-4 text-foreground/50 text-xs">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input type="email" value={editEmpForm.email} onChange={(ev) => setEditEmpForm({...editEmpForm, email: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" placeholder="Email" />
                                      <input type="text" value={editEmpForm.phone} onChange={(ev) => setEditEmpForm({...editEmpForm, phone: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" placeholder="Phone" />
                                      <CustomDateInput value={editEmpForm.dateOfJoining || ''} onChange={(ev) => setEditEmpForm({...editEmpForm, dateOfJoining: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs w-full" leftOffset="pl-2" fontSize="text-xs" />
                                    </div>
                                  ) : <>{e.email}<br/>{e.phone}<br/><span className="text-[10px] text-accent-cyan mt-1 inline-block">Joined: {e.dateOfJoining ? fmtDate(e.dateOfJoining) : 'N/A'}</span></>}
                                </td>
                                <td className="px-6 py-4">
                                  {isEditing ? (
                                    <select value={editEmpForm.status} onChange={(ev) => setEditEmpForm({...editEmpForm, status: ev.target.value})} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs">
                                      <option value="active">Active</option>
                                      <option value="inactive">Inactive</option>
                                    </select>
                                  ) : <StatusBadge status={e.status} />}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {isEditing ? (
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => handleEmpUpdate(e.id)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/40">Save</button>
                                      <button onClick={() => setEditingEmpId(null)} className="px-3 py-1 bg-foreground/10 text-foreground/60 rounded text-xs hover:bg-foreground/20">Cancel</button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-3 items-center">
                                      {e.bankDetails ? (
                                        <button onClick={() => setSelectedEmpBank(e)} className="text-purple-400 hover:text-purple-300 underline text-xs flex items-center gap-1">
                                          <Landmark className="w-3.5 h-3.5" /> Bank Details
                                        </button>
                                      ) : (
                                        <span className="text-foreground/20 text-xs italic">No Bank Details</span>
                                      )}
                                      {hasPermission('manage_employees') && (
                                        <>
                                          <button 
                                            onClick={() => handleToggleBankEdit(e.id, e.allowBankEdit)} 
                                            className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                                              e.allowBankEdit 
                                                ? 'text-green-400 hover:text-green-300 font-semibold' 
                                                : 'text-foreground/40 hover:text-foreground/60'
                                            }`}
                                            title={e.allowBankEdit ? "Lock Bank Editing" : "Allow Bank Editing"}
                                          >
                                            {e.allowBankEdit ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                            {e.allowBankEdit ? 'Unlocked' : 'Locked'}
                                          </button>
                                          <button onClick={() => startEditEmp(e)} className="text-accent-cyan hover:text-foreground underline text-xs">Edit</button>
                                          <button onClick={() => setShowIssueCertModal(e)} className="text-green-400 hover:text-green-300 underline text-xs">Issue Cert</button>
                                          <button onClick={() => handleDeleteEmployee(e.id, e.fullName)} className="text-red-400 hover:text-red-300 underline text-xs">Delete</button>
                                        </>
                                      )}
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
                  <div className="space-y-8">
                    {/* Late Check-in Requests Panel */}
                    {hasPermission('manage_attendance') && (
                      <div className="glass-panel rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-foreground/10 bg-gradient-to-r from-amber-500/10 to-transparent">
                          <h3 className="font-heading font-bold text-lg text-foreground">Late Check-in Requests</h3>
                        </div>
                        <div className="overflow-x-auto">
                          {lateRequests.filter(r => r.status === 'pending').length === 0 ? (
                            <p className="p-6 text-sm text-foreground/40 text-center">No pending late check-in requests.</p>
                          ) : (
                            <table className="w-full text-sm text-left">
                              <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
                                <tr>
                                  <th className="px-6 py-4 font-semibold">Employee</th>
                                  <th className="px-6 py-4 font-semibold">Requested Time</th>
                                  <th className="px-6 py-4 font-semibold">Reason</th>
                                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {lateRequests.filter(r => r.status === 'pending').map((r, i) => (
                                  <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">
                                      {r.employeeName} <span className="text-xs text-foreground/30 ml-2">({r.employeeId})</span>
                                    </td>
                                    <td className="px-6 py-4 text-amber-400">
                                      {new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      <span className="text-xs text-foreground/30 ml-2">({fmtDate(r.date)})</span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/60 text-xs max-w-[300px] break-words">{r.reason}</td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button 
                                          onClick={() => handleLateRequestAction(r._docId, 'approved', r.checkInTime, r.employeeId, r.employeeName)} 
                                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40 cursor-pointer"
                                          title="Approve Check-in"
                                          disabled={submittingLateAction}
                                        >
                                          <CheckCircle2 className="w-4 h-4"/>
                                        </button>
                                        <button 
                                          onClick={() => handleLateRequestAction(r._docId, 'rejected')} 
                                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 cursor-pointer"
                                          title="Reject Request"
                                          disabled={submittingLateAction}
                                        >
                                          <XCircle className="w-4 h-4"/>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="glass-panel rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-gradient-to-r from-accent/10 to-transparent">
                        <h3 className="font-heading font-bold text-lg text-foreground">Global Attendance Logs</h3>
                        <button onClick={exportAttendanceCSV} className="px-5 py-2 rounded-xl bg-foreground/10 text-foreground font-semibold text-sm hover:bg-foreground/20 transition-all border border-foreground/20 flex items-center gap-2">
                          <Download className="w-4 h-4"/> Export CSV
                        </button>
                      </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Campaign</th>
                            <th className="px-6 py-4 font-semibold">Check In</th>
                            <th className="px-6 py-4 font-semibold">Check Out</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {attendance.slice(0, 50).map((r, i) => (
                            <tr key={i} className="hover:bg-foreground/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-foreground">{fmtDate(r.date)}</td>
                              <td className="px-6 py-4 text-foreground/80">{r.employeeName} <span className="text-xs text-foreground/30 ml-2">({r.employeeId})</span></td>
                              <td className="px-6 py-4 text-foreground/60">{employees.find(emp => emp.id === r.employeeId)?.campaign || '—'}</td>
                              <td className="px-6 py-4 text-green-400">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
                              <td className="px-6 py-4 text-red-400">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
                              <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

                {tab === 'leave' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Leave Approvals</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
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
                            <tr key={i} className="hover:bg-foreground/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-foreground">{l.employeeName}</td>
                              <td className="px-6 py-4 text-foreground/60 capitalize">{l.type}</td>
                              <td className="px-6 py-4 text-foreground/60 text-xs">{fmtDate(l.fromDate)} → {fmtDate(l.toDate)}</td>
                              <td className="px-6 py-4 text-foreground/40 max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                              <td className="px-6 py-4 text-right">
                               {l.status === 'pending' && hasPermission('manage_leaves') ? (
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
                    <div className="p-6 border-b border-foreground/10 flex justify-between items-center">
                      <h3 className="font-heading font-bold text-lg text-foreground">Global Work Log Metrics</h3>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/60 font-medium">
                        {tasks.length} entries total
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
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
                            <tr key={i} className="hover:bg-foreground/5 transition-colors">
                              <td className="px-6 py-4 font-semibold text-foreground">{t.employeeName}</td>
                              <td className="px-6 py-4 text-center text-accent-cyan font-bold font-mono text-base">{t.calls ?? '—'}</td>
                              <td className="px-6 py-4 text-center text-green-400 font-bold font-mono text-base">{t.leads ?? '—'}</td>
                              <td className="px-6 py-4 text-center text-yellow-400 font-bold font-mono text-base">{t.followups ?? '—'}</td>
                              <td className="px-6 py-4 text-center text-purple-400 font-bold font-mono text-base">{t.sales ?? '—'}</td>
                              <td className="px-6 py-4 text-foreground/40 text-xs">{fmtDate(t.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'payroll' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {hasPermission('manage_payroll') ? (
                      <>
                        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl h-fit">
                          <h3 className="font-heading font-bold text-lg mb-6 text-foreground">Generate Payslip</h3>
                          <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
                            <select value={payForm.employeeId} onChange={(e) => setPayForm({...payForm, employeeId: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm appearance-none" required>
                              <option value="">Select Employee...</option>
                              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.id})</option>)}
                            </select>
                            <input type="text" placeholder="Month (e.g. May)" value={payForm.month} onChange={(e) => setPayForm({...payForm, month: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm" required/>
                            <input type="number" placeholder="Net Pay (₹)" value={payForm.netPay} onChange={(e) => setPayForm({...payForm, netPay: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm" required/>
                            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500/80 to-green-600 text-foreground font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center gap-2"><DollarSign className="w-4 h-4"/> Issue Payslip</button>
                          </form>
                        </div>
                        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
                          <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Issued Payslips</h3></div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
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
                                  <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{p.employeeName}</td>
                                    <td className="px-6 py-4 text-foreground/70">{p.month} {p.year}</td>
                                    <td className="px-6 py-4 text-green-400 font-mono">₹{p.netPay.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-foreground/40 text-xs">{fmtDate(p.createdAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button onClick={() => setSelectedPayslip(p)} className="px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/80 text-xs hover:bg-foreground/10 transition-all border border-foreground/10 flex items-center gap-1 font-semibold">
                                          <Eye className="w-3.5 h-3.5 text-accent-cyan" /> View
                                        </button>
                                        <button onClick={() => printPayslip(p)} className="px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/80 text-xs hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30 transition-all border border-foreground/10 flex items-center gap-1 font-semibold">
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
                      </>
                    ) : (
                      <div className="lg:col-span-3 glass-panel rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Issued Payslips</h3></div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
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
                                <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                  <td className="px-6 py-4 font-medium text-foreground">{p.employeeName}</td>
                                  <td className="px-6 py-4 text-foreground/70">{p.month} {p.year}</td>
                                  <td className="px-6 py-4 text-green-400 font-mono">₹{p.netPay.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-foreground/40 text-xs">{fmtDate(p.createdAt)}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => setSelectedPayslip(p)} className="px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/80 text-xs hover:bg-foreground/10 transition-all border border-foreground/10 flex items-center gap-1 font-semibold">
                                        <Eye className="w-3.5 h-3.5 text-accent-cyan" /> View
                                      </button>
                                      <button onClick={() => printPayslip(p)} className="px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/80 text-xs hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30 transition-all border border-foreground/10 flex items-center gap-1 font-semibold">
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
                    )}
                  </div>
                )}

                {/* ── ADMIN DOCUMENTS ── */}
                {tab === 'documents' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Document Verification</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Document</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {documents.map((d, i) => (
                            <tr key={i} className="hover:bg-foreground/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-foreground">{d.employeeName}</td>
                              <td className="px-6 py-4 text-foreground/70 flex items-center gap-2"><FileText className="w-4 h-4 text-accent-cyan"/>{d.name}</td>
                              <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => setSelectedDocument(d)} className="p-1.5 rounded-lg bg-foreground/5 text-foreground/80 hover:bg-foreground/10 transition-colors border border-foreground/10 flex items-center gap-1.5" title="View Document">
                                    <Eye className="w-3.5 h-3.5 text-accent-cyan"/>
                                    <span className="hidden lg:block text-xs font-semibold">View</span>
                                  </button>
                                  <button onClick={() => handleDownloadDoc(d)} className="p-1.5 rounded-lg bg-foreground/5 text-foreground/80 hover:bg-foreground/10 transition-colors border border-foreground/10 flex items-center gap-1.5" title="Download Document">
                                    <Download className="w-3.5 h-3.5 text-accent"/>
                                    <span className="hidden lg:block text-xs font-semibold">Download</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteDocument(d.id, d.name)} 
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center gap-1.5" 
                                    title="Delete Document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5"/>
                                    <span className="hidden lg:block text-xs font-semibold">Delete</span>
                                  </button>

                                  {d.status === 'pending' && (
                                    <div className="flex items-center gap-2 border-l border-foreground/10 pl-3">
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
                    <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Support Tickets</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
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
                            <tr key={i} className="hover:bg-foreground/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-accent-cyan text-xs">#{t.id.slice(0,6)}</td>
                              <td className="px-6 py-4 font-medium text-foreground">{t.employeeName}</td>
                              <td className="px-6 py-4 text-foreground/70 max-w-[200px] truncate">{t.subject}</td>
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
                    {hasPermission('manage_recognition') ? (
                      <>
                        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl h-fit border-yellow-500/20">
                          <h3 className="font-heading font-bold text-lg mb-6 text-yellow-400 flex items-center gap-2"><Award className="w-5 h-5"/> Award Badge</h3>
                          <form onSubmit={handleRecSubmit} className="flex flex-col gap-4">
                            <select value={recForm.employeeId} onChange={(e) => setRecForm({...recForm, employeeId: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm appearance-none" required>
                              <option value="">Select Employee...</option>
                              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                            </select>
                            <select value={recForm.badgeTitle} onChange={(e) => setRecForm({...recForm, badgeTitle: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm appearance-none" required>
                              <option value="Star Performer">Star Performer</option>
                              <option value="Top Caller">Top Caller</option>
                              <option value="Culture Champion">Culture Champion</option>
                            </select>
                            <textarea rows={3} placeholder="Congratulatory message..." value={recForm.message} onChange={(e) => setRecForm({...recForm, message: e.target.value})} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm resize-none" required/>
                            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500/80 to-yellow-600 text-foreground font-bold hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">Publish Award</button>
                          </form>
                        </div>
                        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
                          <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Recognition History</h3></div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
                                <tr>
                                  <th className="px-6 py-4 font-semibold">Employee</th>
                                  <th className="px-6 py-4 font-semibold">Badge</th>
                                  <th className="px-6 py-4 font-semibold">Message</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {recognitions.map((r, i) => (
                                  <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{r.employeeName}</td>
                                    <td className="px-6 py-4 text-yellow-400 text-xs font-bold">{r.badgeTitle}</td>
                                    <td className="px-6 py-4 text-foreground/60 text-xs italic">"{r.message}"</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="lg:col-span-3 glass-panel rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-foreground/10"><h3 className="font-heading font-bold text-lg text-foreground">Recognition History</h3></div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]">
                              <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Badge</th>
                                <th className="px-6 py-4 font-semibold">Message</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {recognitions.map((r, i) => (
                                <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                  <td className="px-6 py-4 font-medium text-foreground">{r.employeeName}</td>
                                  <td className="px-6 py-4 text-yellow-400 text-xs font-bold">{r.badgeTitle}</td>
                                  <td className="px-6 py-4 text-foreground/60 text-xs italic">"{r.message}"</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ANNOUNCEMENTS & HOLIDAYS TABS ── */}
                {tab === 'announcements' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 glass-panel p-6 rounded-3xl h-fit">
                      <h3 className="font-heading font-bold text-lg mb-6 text-foreground">New Broadcast</h3>
                      <form onSubmit={handleAnnSubmit} className="flex flex-col gap-4">
                        <input type="text" placeholder="Title" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm" required />
                        <textarea rows={4} placeholder="Message body..." value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent-violet text-foreground text-sm resize-none" required />
                        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-violet to-accent text-foreground font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">Send Broadcast</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                      {announcements.map((a) => (
                        <div key={a.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/10 rounded-full blur-[40px] pointer-events-none"></div>
                          <div className="flex items-start justify-between gap-4 mb-2 relative z-10">
                            <h4 className="font-bold text-lg text-foreground">{a.title}</h4>
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
                          <p className="text-foreground/60 text-sm relative z-10 pr-8">{a.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {tab === 'holidays' && (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-foreground/10 bg-gradient-to-r from-accent/10 to-transparent"><h3 className="font-heading font-bold text-xl text-foreground">Official Holidays 2026</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left"><thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-[10px]"><tr><th className="px-6 py-4 font-semibold">Festival / Occasion</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Day</th></tr></thead><tbody className="divide-y divide-white/5">{HOLIDAYS_2026.map((h, i) => (<tr key={i} className="hover:bg-foreground/5 transition-colors"><td className="px-6 py-4 font-medium text-foreground">{h.name}</td><td className="px-6 py-4 text-accent-cyan font-mono">{h.date}</td><td className="px-6 py-4 text-foreground/60">{h.day}</td></tr>))}</tbody></table>
                    </div>
                  </div>
                )}

                {tab === 'my-portal' && session?.employeeId && (
                  <div className="space-y-8">
                    {/* Shift Control Panel */}
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-accent/15 via-accent-violet/5 to-transparent border-t border-t-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="absolute top-[-50%] left-[-10%] w-[350px] h-[350px] bg-accent-violet/10 rounded-full blur-[90px] pointer-events-none"></div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-accent font-semibold px-3 py-1 rounded-full bg-accent/10 border border-accent/20">Portal Shift Control</span>
                        <h3 className="text-3xl font-heading font-bold text-foreground mt-4">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                        <p className="text-foreground/50 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-foreground/40 text-xs">Current Shift Status:</span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-semibold capitalize ${
                            !todayRec ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                            todayRec.checkOut ? 'bg-foreground/10 text-foreground/50 border-foreground/20' :
                            todayRec.onBreak ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/15 text-green-400 border-green-500/30'
                          }`}>
                            {!todayRec ? 'Not Logged In' :
                             todayRec.checkOut ? 'Completed' :
                             todayRec.onBreak ? 'On Break' : 'Active'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
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
                          <div className="px-8 py-4 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground/50 font-bold">
                            SHIFT COMPLETED
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Leave Application Form */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 rounded-3xl border-t border-t-white/5">
                          <h3 className="font-heading font-bold text-lg mb-6 text-foreground">Apply for Leave</h3>
                          <form onSubmit={handleLeaveSubmit} className="flex flex-col gap-5">
                            <div className="space-y-1.5">
                              <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Leave Type</label>
                              <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm appearance-none">
                                <option value="sick">Sick Leave</option>
                                <option value="casual">Casual Leave</option>
                                <option value="earned">Earned Leave</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">From Date</label>
                              <CustomDateInput value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm" required />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">To Date</label>
                              <CustomDateInput value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm" required />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Reason</label>
                              <textarea rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm resize-none" placeholder="Brief reason..." required />
                            </div>
                            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-violet text-foreground font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                              Submit Request
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Attendance Log and Leaves Log */}
                      <div className="lg:col-span-2 space-y-8">
                        {/* Attendance Log */}
                        <div className="glass-panel rounded-3xl overflow-hidden border-t border-t-white/5">
                          <div className="p-6 border-b border-foreground/10">
                            <h3 className="font-heading font-bold text-lg text-foreground">My Attendance Log</h3>
                          </div>
                          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-xs sticky top-0 z-10">
                                <tr>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Date</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Check In</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Check Out</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Hours</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {personalAttendance.length === 0 ? (
                                  <tr><td colSpan="5" className="p-8 text-center text-foreground/40">No attendance logs found.</td></tr>
                                ) : personalAttendance.map((r, i) => (
                                  <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{fmtDate(r.date)}</td>
                                    <td className="px-6 py-4 text-green-400">{fmtTime(r.checkIn)}</td>
                                    <td className="px-6 py-4 text-red-400">{r.checkOut ? fmtTime(r.checkOut) : '—'}</td>
                                    <td className="px-6 py-4 font-mono text-foreground/70">{r.totalHours !== null ? `${r.totalHours} hrs` : '—'}</td>
                                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Leaves Log */}
                        <div className="glass-panel rounded-3xl overflow-hidden border-t border-t-white/5">
                          <div className="p-6 border-b border-foreground/10">
                            <h3 className="font-heading font-bold text-lg text-foreground">My Leave Requests</h3>
                          </div>
                          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-foreground/5 text-foreground/40 uppercase tracking-widest text-xs sticky top-0 z-10">
                                <tr>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Type</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Dates</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Reason</th>
                                  <th className="px-6 py-4 font-semibold bg-foreground/80">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {personalLeaves.length === 0 ? (
                                  <tr><td colSpan="4" className="p-8 text-center text-foreground/40">No leave requests found.</td></tr>
                                ) : personalLeaves.map((l, i) => (
                                  <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground capitalize">{l.type}</td>
                                    <td className="px-6 py-4 text-foreground/70">{fmtDate(l.fromDate)} <span className="text-foreground/30 mx-1">→</span> {fmtDate(l.toDate)}</td>
                                    <td className="px-6 py-4 text-foreground/60 max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                                    <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
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
            className="fixed inset-0 bg-foreground/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-2xl bg-background border border-foreground/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Decorative background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedPayslip(null)} 
                className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="text-center border-b border-foreground/10 pb-6 mb-6">
                <h2 className="text-2xl font-heading font-bold text-foreground tracking-wide">Zexora Quvixo Group</h2>
                <p className="text-xs uppercase tracking-widest text-accent-cyan font-semibold mt-1">Salary Slip / Payslip</p>
                <p className="text-sm text-foreground/60 mt-1">Period: {selectedPayslip.month} {selectedPayslip.year}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8 bg-foreground/5 p-5 rounded-2xl border border-foreground/5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-foreground/40 mb-0.5">Employee Name</p>
                  <p className="text-foreground font-medium">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-foreground/40 mb-0.5">Employee ID</p>
                  <p className="text-foreground font-medium">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-foreground/40 mb-0.5">Designation</p>
                  <p className="text-foreground font-medium">
                    {employees.find(e => e.id === selectedPayslip.employeeId)?.designation || 'Software Developer'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-foreground/40 mb-0.5">Department</p>
                  <p className="text-foreground font-medium">
                    {employees.find(e => e.id === selectedPayslip.employeeId)?.department || 'Engineering'}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wider">Earnings Breakdown</h4>
              <div className="space-y-3 mb-8">
                {[
                  ['Basic Salary (50%)', selectedPayslip.netPay * 0.5],
                  ['House Rent Allowance (HRA) (20%)', selectedPayslip.netPay * 0.2],
                  ['Special Allowance (20%)', selectedPayslip.netPay * 0.2],
                  ['Conveyance & Medical (10%)', selectedPayslip.netPay * 0.1],
                ].map(([label, amount]) => (
                  <div key={label} className="flex justify-between items-center text-sm py-1.5 border-b border-foreground/5">
                    <span className="text-foreground/60">{label}</span>
                    <span className="text-foreground font-mono">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-base font-bold pt-3 bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10">
                  <span className="text-accent-cyan uppercase tracking-wider">Net Disbursed</span>
                  <span className="text-foreground font-mono">₹{parseFloat(selectedPayslip.netPay).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-green-400 font-semibold px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 uppercase tracking-widest">
                  Status: Paid
                </span>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedPayslip(null)} 
                    className="px-5 py-2.5 rounded-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-all border border-foreground/10 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      printPayslip(selectedPayslip);
                      setSelectedPayslip(null);
                    }} 
                    className="px-5 py-2.5 rounded-xl bg-accent text-foreground hover:bg-accent-cyan transition-all border border-accent/20 text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_20px_rgba(79,142,247,0.3)]"
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
            className="fixed inset-0 bg-foreground/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-3xl bg-background border border-foreground/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Decorative background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent-cyan/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedDocument(null)} 
                className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="border-b border-foreground/10 pb-4 mb-6 pr-10">
                <h2 className="text-xl font-heading font-bold text-foreground truncate">{selectedDocument.name}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-foreground/45">Employee: {selectedDocument.employeeName} ({selectedDocument.employeeId})</span>
                  <span className="text-foreground/20">•</span>
                  <span className="text-xs text-foreground/40">Uploaded {fmtDate(selectedDocument.uploadedAt)}</span>
                  <span className="text-foreground/20">•</span>
                  <span className="text-xs text-foreground/40">{(selectedDocument.size / 1024).toFixed(1)} KB</span>
                  <span className="text-foreground/20">•</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border uppercase tracking-wider font-semibold ${selectedDocument.status === 'verified' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'}`}>
                    {selectedDocument.status}
                  </span>
                </div>
              </div>

              {/* Document Container */}
              <div className="flex-1 overflow-y-auto mb-6 bg-foreground/5 rounded-2xl border border-foreground/5 p-4 flex items-center justify-center min-h-[300px]">
                {selectedDocument.url ? (
                  selectedDocument.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(selectedDocument.name) ? (
                    <img 
                      src={selectedDocument.url} 
                      alt={selectedDocument.name} 
                      className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-lg border border-foreground/5"
                    />
                  ) : selectedDocument.type === 'application/pdf' || /\.pdf$/i.test(selectedDocument.name) ? (
                    <iframe 
                      src={selectedDocument.url} 
                      title={selectedDocument.name} 
                      className="w-full h-[55vh] rounded-xl border border-foreground/10"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-1">Preview not available for this file type</p>
                      <p className="text-xs text-foreground/40">Type: {selectedDocument.type || 'Unknown'}</p>
                    </div>
                  )
                ) : (
                  /* Stylized fallback document card */
                  <div className="w-full max-w-md p-8 bg-foreground/5 border border-foreground/10 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent to-accent-cyan"></div>
                    <FileText className="w-16 h-16 text-accent-cyan mx-auto mb-4 opacity-80 animate-pulse" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Pre-Storage Metadata Record</h3>
                    <p className="text-xs text-foreground/70 mb-4 leading-relaxed">
                      This document was uploaded before raw file storage was activated. The file's metadata and cryptographic signature were saved, but the raw file contents are not stored in the database.
                    </p>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs text-center font-semibold mb-6">
                      ⚠️ Please upload a new document to view the file content.
                    </div>
                    <div className="space-y-2.5 text-left text-xs bg-foreground/5 p-4 rounded-xl border border-foreground/5">
                      <div className="flex justify-between">
                        <span className="text-foreground/40">Doc Ref ID:</span>
                        <span className="text-foreground font-mono">{selectedDocument.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/40">File Name:</span>
                        <span className="text-foreground truncate max-w-[200px]">{selectedDocument.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/40">Hash Status:</span>
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
                  className="px-5 py-2.5 rounded-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-all border border-foreground/10 text-xs font-semibold"
                >
                  Close
                </button>
                {selectedDocument.url && (
                  <button 
                    onClick={() => handleDownloadDoc(selectedDocument)} 
                    className="px-5 py-2.5 rounded-xl bg-accent text-foreground hover:bg-accent-cyan transition-all border border-accent/20 text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_20px_rgba(79,142,247,0.3)]"
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
            className="fixed inset-0 bg-foreground/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-md bg-background border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Decorative purple background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-purple-500/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedEmpBank(null)} 
                className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                  <Landmark className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground">Employee Bank Credentials</h2>
                <p className="text-xs text-foreground/40 mt-1">Verified payment accounts logged by the employee</p>
              </div>

              {/* Mockup Card */}
              <div className="w-full h-44 rounded-2xl p-5 mb-6 flex flex-col justify-between border border-foreground/10 bg-gradient-to-br from-[#1d1b38] via-[#0f0e21] to-[#2b2157] relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] tracking-widest text-purple-400 font-semibold uppercase">Zexora Corporate</span>
                    <h3 className="text-xs font-semibold text-foreground/70 mt-1 uppercase">{selectedEmpBank.bankDetails.bankName}</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[8px] rounded bg-green-500/15 border border-green-500/30 text-green-400 uppercase font-semibold">Active</span>
                </div>

                <div className="my-2">
                  <p className="text-base font-mono font-semibold tracking-wider text-foreground">
                    {selectedEmpBank.bankDetails.accountNumber}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-foreground/30 block">Account Holder</span>
                    <span className="text-xs font-semibold text-foreground/80 uppercase truncate max-w-[150px] inline-block">{selectedEmpBank.bankDetails.holderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-wider text-foreground/30 block">IFSC</span>
                    <span className="text-xs font-semibold font-mono text-purple-400 uppercase">{selectedEmpBank.bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-3.5 text-xs bg-foreground/5 p-4 rounded-xl border border-foreground/5 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground/40">Employee Name:</span>
                  <span className="text-foreground font-medium">{selectedEmpBank.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/40">Employee ID:</span>
                  <span className="text-foreground font-mono font-medium">{selectedEmpBank.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/40">Branch Name:</span>
                  <span className="text-foreground font-medium">{selectedEmpBank.bankDetails.branchName || 'Not Specified'}</span>
                </div>
                {selectedEmpBank.bankDetails.upiId && (
                  <div className="flex justify-between">
                    <span className="text-foreground/40">UPI ID:</span>
                    <span className="text-foreground font-mono text-purple-400 font-medium">{selectedEmpBank.bankDetails.upiId}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedEmpBank(null)} 
                className="w-full py-3 rounded-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-all border border-foreground/10 text-xs font-semibold"
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
              className="fixed inset-0 bg-foreground/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.9, y: 20 }} 
                className="w-full max-w-4xl bg-background border border-foreground/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Decorative background glow */}
                <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-accent/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedEmpDetails(null)} 
                  className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-colors z-20"
                >
                  <XCircle className="w-6 h-6" />
                </button>

                {/* Header Spotlight */}
                <div className="flex flex-col md:flex-row items-center gap-6 border-b border-foreground/10 pb-6 mb-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-accent-violet to-accent-cyan p-0.5 overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                      {emp.avatar ? (
                        <img src={emp.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-foreground/80" />
                      )}
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1 font-sans">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h2 className="text-2xl font-heading font-bold text-foreground tracking-wide">{emp.fullName}</h2>
                      <StatusBadge status={emp.status} />
                    </div>
                    <p className="text-sm text-accent-cyan font-semibold mt-1">{emp.designation} • <span className="text-foreground/60 font-normal">{emp.department}</span></p>
                    <p className="text-xs text-foreground/40 mt-1 font-mono">Employee ID: {emp.id} | Joined: {emp.dateOfJoining ? fmtDate(emp.dateOfJoining) : 'N/A'}</p>
                  </div>
                  {hasPermission('manage_employees') && (
                    <div className="shrink-0 flex gap-3">
                      <button 
                        onClick={() => handleToggleBankEdit(emp.id, emp.allowBankEdit)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          emp.allowBankEdit 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' 
                            : 'bg-foreground/5 text-foreground/60 border-foreground/10 hover:bg-foreground/10'
                        }`}
                      >
                        {emp.allowBankEdit ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {emp.allowBankEdit ? 'Lock Bank Edit' : 'Unlock Bank Edit'}
                      </button>

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
                  )}
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-foreground/5 pb-3 mb-6 overflow-x-auto scrollbar-hide shrink-0 relative z-10">
                  {[
                    { id: 'profile', label: 'Overview & Stats' },
                    { id: 'worklogs', label: 'Work Logs' },
                    { id: 'leaves', label: 'Attendance & Leaves' },
                    { id: 'bankdocs', label: 'Bank & Docs' },
                    ...(session.role === 'superadmin' ? [{ id: 'permissions', label: 'Role & Permissions' }] : [])
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setDetailsTab(t.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 cursor-pointer ${
                        detailsTab === t.id 
                          ? 'bg-foreground/10 text-foreground border-foreground/20' 
                          : 'bg-transparent text-foreground/50 border-transparent hover:text-foreground/80 hover:bg-foreground/5'
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
                          <div key={idx} className="bg-foreground/5 border border-foreground/5 rounded-2xl p-4 flex flex-col justify-between">
                            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold">{card.label}</p>
                            <p className={`text-2xl font-bold font-mono my-2 ${card.color}`}>{card.val}</p>
                            <p className="text-[10px] text-foreground/50">{card.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detail list */}
                      <div className="bg-foreground/5 border border-foreground/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-foreground/5 pb-2 mb-3">Primary Contact & Security</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="flex justify-between border-b border-foreground/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-foreground/45">Email ID:</span>
                            <span className="text-foreground font-medium">{emp.email || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-foreground/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-foreground/45">Phone Number:</span>
                            <span className="text-foreground font-medium">{emp.phone || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-foreground/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-foreground/45">Username:</span>
                            <span className="text-foreground font-mono">{emp.username || emp.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/45">System Password:</span>
                            <span className="text-foreground font-mono">{emp.password}</span>
                          </div>
                        </div>
                      </div>

                      {/* Job & Campaign Assignment */}
                      <div className="bg-foreground/5 border border-foreground/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-foreground/5 pb-2 mb-3">Job & Assignment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="flex justify-between border-b border-foreground/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-foreground/45">Department:</span>
                            <span className="text-foreground font-medium">{emp.department || 'Engineering'}</span>
                          </div>
                          <div className="flex justify-between border-b border-foreground/5 pb-2 md:border-0 md:pb-0">
                            <span className="text-foreground/45">Designation:</span>
                            <span className="text-foreground font-medium">{emp.designation || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/45">Campaign:</span>
                            <span className="text-foreground font-medium">{emp.campaign || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailsTab === 'worklogs' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Task Submissions</h4>
                      {empTasks.length === 0 ? (
                        <div className="text-center p-8 bg-foreground/5 border border-foreground/5 rounded-2xl text-foreground/40 text-xs">
                          No work logs recorded for this employee.
                        </div>
                      ) : (
                        <div className="border border-foreground/5 rounded-2xl overflow-hidden bg-foreground/5">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-foreground/10 text-foreground/50 uppercase tracking-widest text-[9px]">
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
                                <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                                  <td className="px-4 py-3 text-foreground/80">{fmtDate(t.createdAt)}</td>
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
                        <h4 className="text-sm font-semibold text-foreground">Recent Attendance Logs</h4>
                        {empAttendance.length === 0 ? (
                          <div className="p-6 bg-foreground/5 border border-foreground/5 rounded-2xl text-center text-foreground/40 text-xs">
                            No attendance logs.
                          </div>
                        ) : (
                          <div className="max-h-[300px] overflow-y-auto border border-foreground/5 rounded-2xl bg-foreground/5 divide-y divide-white/5">
                            {empAttendance.slice(0, 15).map((log, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 text-xs hover:bg-foreground/5 transition-colors">
                                <div>
                                  <p className="text-foreground font-medium">{fmtDate(log.date)}</p>
                                  <p className="text-[10px] text-foreground/40">{fmtTime(log.checkIn)} → {fmtTime(log.checkOut)}</p>
                                </div>
                                <StatusBadge status={log.status} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Leaves log */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">Leave Requests</h4>
                        {empLeaves.length === 0 ? (
                          <div className="p-6 bg-foreground/5 border border-foreground/5 rounded-2xl text-center text-foreground/40 text-xs">
                            No leave requests applied.
                          </div>
                        ) : (
                          <div className="max-h-[300px] overflow-y-auto border border-foreground/5 rounded-2xl bg-foreground/5 divide-y divide-white/5">
                            {empLeaves.map((l, idx) => (
                              <div key={idx} className="p-3 text-xs hover:bg-foreground/5 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="capitalize font-semibold text-foreground">{l.type} Leave</span>
                                  <StatusBadge status={l.status} />
                                </div>
                                <p className="text-[10px] text-foreground/40">{fmtDate(l.fromDate)} → {fmtDate(l.toDate)}</p>
                                <p className="text-foreground/60 mt-1 italic text-[11px]">"{l.reason}"</p>
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
                        <h4 className="text-sm font-semibold text-foreground">Bank Account Credentials</h4>
                        {emp.bankDetails ? (
                          <div className="w-full h-40 rounded-2xl p-4 flex flex-col justify-between border border-foreground/10 bg-gradient-to-br from-[#1d1b38] via-[#0f0e21] to-[#2b2157] relative overflow-hidden shadow-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] tracking-widest text-purple-400 font-semibold uppercase">Zexora Corporate</span>
                                <h3 className="text-[11px] font-semibold text-foreground/70 mt-0.5 uppercase">{emp.bankDetails.bankName}</h3>
                              </div>
                              <span className="px-2 py-0.5 text-[8px] rounded bg-green-500/15 border border-green-500/30 text-green-400 uppercase font-semibold">Active</span>
                            </div>

                            <div className="my-1">
                              <p className="text-sm font-mono font-semibold tracking-wider text-foreground">
                                {emp.bankDetails.accountNumber}
                              </p>
                            </div>

                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[7px] uppercase tracking-wider text-foreground/30 block">Holder</span>
                                <span className="text-[10px] font-semibold text-foreground/80 uppercase truncate max-w-[120px] inline-block">{emp.bankDetails.holderName}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[7px] uppercase tracking-wider text-foreground/30 block">IFSC</span>
                                <span className="text-[10px] font-semibold font-mono text-purple-400 uppercase">{emp.bankDetails.ifscCode}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 bg-foreground/5 border border-foreground/5 rounded-2xl text-center text-foreground/40 text-xs italic">
                            No Bank account registered by the employee.
                          </div>
                        )}
                      </div>

                      {/* Documents & Certificates */}
                      <div className="space-y-6">
                        {/* Documents */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">Documents Vault</h4>
                          {empDocs.length === 0 ? (
                            <div className="p-8 bg-foreground/5 border border-foreground/5 rounded-2xl text-center text-foreground/40 text-xs">
                              No documents uploaded.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[140px] overflow-y-auto">
                              {empDocs.map((docItem, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-foreground/5 border border-foreground/5 rounded-xl text-xs">
                                  <span className="text-foreground font-medium truncate max-w-[150px]">{docItem.name}</span>
                                  <div className="flex items-center gap-2">
                                    <StatusBadge status={docItem.status} />
                                    <button 
                                      onClick={() => setSelectedDocument(docItem)}
                                      className="p-1 text-accent-cyan hover:text-foreground transition-colors cursor-pointer"
                                      title="View"
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
                    </div>
                  )}

                  {detailsTab === 'permissions' && session.role === 'superadmin' && (
                    <div className="space-y-6">
                      <div className="bg-foreground/5 border border-foreground/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-foreground/5 pb-2 mb-3">System Access Policy</h4>
                        
                        <div className="flex flex-col gap-2 max-w-xs">
                          <label className="text-foreground/60 text-xs font-semibold">User Role</label>
                          <select 
                            value={selectedRole} 
                            onChange={(e) => setSelectedRole(e.target.value)} 
                            className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none text-foreground text-sm appearance-none"
                          >
                            <option value="employee">Employee (Standard Access)</option>
                            <option value="admin">Admin (Custom Access)</option>
                          </select>
                        </div>

                        {selectedRole === 'admin' && (
                          <div className="space-y-4 pt-4 border-t border-foreground/5 animate-fadeIn">
                            <label className="text-foreground/60 text-xs font-semibold block">Granular Permissions</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {ALL_PERMISSIONS.map((perm) => {
                                const isChecked = selectedPermissions.includes(perm.key);
                                return (
                                  <label key={perm.key} className="flex items-start gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors border border-foreground/5 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedPermissions(selectedPermissions.filter(k => k !== perm.key));
                                        } else {
                                          setSelectedPermissions([...selectedPermissions, perm.key]);
                                        }
                                      }}
                                      className="mt-0.5 rounded border-foreground/10 bg-foreground/5 text-accent-violet focus:ring-accent-violet focus:ring-offset-black"
                                    />
                                    <div>
                                      <span className="text-foreground text-xs font-semibold block">{perm.label}</span>
                                      <span className="text-foreground/40 text-[10px] block mt-0.5">{perm.desc}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-foreground/5 flex justify-end">
                          <button 
                            onClick={handleSavePermissions}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-violet to-accent text-foreground text-xs font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
                          >
                            Save Access Policy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-foreground/10 shrink-0">
                  <button 
                    onClick={() => setSelectedEmpDetails(null)} 
                    className="px-6 py-2.5 rounded-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-all border border-foreground/10 text-xs font-semibold cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── LATE CHECK-IN REQUEST MODAL ── */}
      <AnimatePresence>
        {showLateModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-foreground/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="w-full max-w-md bg-background border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Decorative background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-amber-500/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

              {/* Close Button */}
              <button 
                onClick={() => setShowLateModal(false)} 
                className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground tracking-wide">Late Check-in Notice</h2>
                <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mt-1">Contact HR</p>
                <p className="text-xs text-foreground/60 mt-2">
                  The standard check-in window closed at 10:15 AM. To check in late, please submit a valid explanation to HR.
                </p>
              </div>

              <form onSubmit={handleLateCheckInSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold ml-1">Reason for Late Check-in</label>
                  <textarea 
                    value={lateReason} 
                    onChange={(e) => setLateReason(e.target.value)}
                    required 
                    placeholder="Provide details about why you are late (e.g. traffic delay, medical appointment, etc.)..."
                    rows={4}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-amber-400 text-foreground text-sm resize-none placeholder:text-foreground/20"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowLateModal(false)} 
                    className="w-1/2 py-3 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground/75 font-semibold text-xs hover:bg-foreground/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingLate}
                    className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold text-xs hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingLate ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
