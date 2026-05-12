import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CalendarOff, AlertCircle, Plus, Edit2, CheckCircle2, XCircle, Download, Bell, Search, X, UserCheck } from 'lucide-react';
import HRNavbar from '../components/HRNavbar';
import {
  getEmployees, addEmployee, updateEmployee, getAttendance, getLeaves,
  updateLeaveStatus, getAnnouncements, addAnnouncement, getDashboardStats,
  exportAttendanceCSV, getPendingRegistrations, approveRegistration, rejectRegistration,
} from '../utils/hrStorage';

const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }) => {
  const cfg = {
    active: 'bg-green-500/15 text-green-400 border-green-500/30', inactive: 'bg-red-500/15 text-red-400 border-red-500/30',
    present: 'bg-green-500/15 text-green-400 border-green-500/30', pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/15 text-green-400 border-green-500/30', rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${cfg[status] || 'bg-foreground/10 text-foreground/60 border-border/30'}`}>{status}</span>;
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-6 h-6" /></div>
    <div>
      <p className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

const Toast = ({ msg, type }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-medium ${
      type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'
    }`}>
    {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{msg}
  </motion.div>
);

const INIT_EMP = { id: '', fullName: '', department: '', designation: '', email: '', phone: '', username: '', password: '' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({});
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [empModal, setEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState(INIT_EMP);
  const [editingEmp, setEditingEmp] = useState(null);
  const [annForm, setAnnForm] = useState({ title: '', body: '' });
  const [pendingRegs, setPendingRegs] = useState([]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const refresh = async () => {
    setDataLoading(true);
    try {
      const [emps, att, lvs, anns, st, regs] = await Promise.all([
        getEmployees(), getAttendance(), getLeaves(), getAnnouncements(), getDashboardStats(), getPendingRegistrations(),
      ]);
      setEmployees(emps);
      setAttendance(att);
      setLeaves(lvs);
      setAnnouncements(anns);
      setStats(st);
      setPendingRegs(regs);
    } catch (err) {
      showToast('Error loading data', 'error');
    }
    setDataLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmp) {
      const all = await getEmployees();
      if (all.find((e) => e.id === empForm.id || e.username === empForm.username)) {
        showToast('Employee ID or username already exists', 'error'); return;
      }
      await addEmployee(empForm);
      showToast('Employee added successfully!');
    } else {
      await updateEmployee(editingEmp, empForm);
      showToast('Employee updated!');
    }
    setEmpModal(false); setEmpForm(INIT_EMP); setEditingEmp(null);
    await refresh();
  };

  const openEdit = (emp) => { setEmpForm(emp); setEditingEmp(emp.id); setEmpModal(true); };

  const toggleStatus = async (id, current) => {
    await updateEmployee(id, { status: current === 'active' ? 'inactive' : 'active' });
    await refresh();
    showToast(`Employee ${current === 'active' ? 'deactivated' : 'activated'}`);
  };

  const handleLeave = async (docId, status) => {
    await updateLeaveStatus(docId, status);
    await refresh();
    showToast(`Leave ${status}!`);
  };

  const handleAnnounce = async (e) => {
    e.preventDefault();
    await addAnnouncement(annForm);
    setAnnForm({ title: '', body: '' });
    await refresh();
    showToast('Announcement posted!');
  };

  const handleApproveReg = async (id) => {
    await approveRegistration(id);
    await refresh();
    showToast('Employee approved and activated!');
  };

  const handleRejectReg = async (id) => {
    await rejectRegistration(id);
    await refresh();
    showToast('Registration rejected.', 'error');
  };

  const filteredAttendance = attendance.filter(
    (r) => r.employeeName?.toLowerCase().includes(search.toLowerCase()) || r.date?.includes(search)
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: AlertCircle },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: CalendarOff },
    { id: 'registrations', label: `Registrations${pendingRegs.length ? ` (${pendingRegs.length})` : ''}`, icon: UserCheck },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const Spinner = () => (
    <div className="flex items-center justify-center py-20 text-foreground/40">
      <svg className="animate-spin w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/></svg>
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HRNavbar title="Admin Dashboard" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Superadmin Dashboard</h1>
          <p className="text-foreground/50 text-sm mt-1">Manage your team, attendance, and HR operations.</p>
        </div>

        <div className="flex gap-1 bg-card/40 border border-border/30 rounded-2xl p-1 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-accent text-white shadow-lg' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {dataLoading ? <Spinner /> : (
          <>
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees ?? 0} color="bg-accent/20 text-accent" />
                  <StatCard icon={CheckCircle2} label="Present Today" value={stats.presentToday ?? 0} color="bg-green-500/20 text-green-400" />
                  <StatCard icon={CalendarOff} label="On Leave Today" value={stats.onLeaveToday ?? 0} color="bg-yellow-500/20 text-yellow-400" />
                  <StatCard icon={AlertCircle} label="Pending Leaves" value={stats.pendingLeaves ?? 0} color="bg-red-500/20 text-red-400" />
                  <StatCard icon={UserCheck} label="Pending Signups" value={stats.pendingRegistrations ?? 0} color="bg-purple-500/20 text-purple-400" />
                </div>
                <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="p-6 border-b border-border/30 flex items-center justify-between">
                    <h3 className="font-semibold">Recent Leave Requests</h3>
                    <button onClick={() => setTab('leaves')} className="text-xs text-accent hover:underline">View all</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border/30 bg-background/30">
                        <tr>{['Employee', 'Type', 'From', 'To', 'Status', 'Action'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {leaves.slice(0, 5).map((l) => (
                          <tr key={l._docId} className="border-b border-border/20 hover:bg-background/20">
                            <td className="px-5 py-3 font-medium">{l.employeeName}</td>
                            <td className="px-5 py-3 capitalize">{l.type}</td>
                            <td className="px-5 py-3">{fmtDate(l.fromDate)}</td>
                            <td className="px-5 py-3">{fmtDate(l.toDate)}</td>
                            <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                            <td className="px-5 py-3">
                              {l.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleLeave(l._docId, 'approved')} className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30">Approve</button>
                                  <button onClick={() => handleLeave(l._docId, 'rejected')} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30">Reject</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'employees' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">All Employees</h3>
                  <button onClick={() => { setEmpForm(INIT_EMP); setEditingEmp(null); setEmpModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all shadow-[0_0_15px_rgba(60,100,255,0.3)]">
                    <Plus className="w-4 h-4" /> Add Employee
                  </button>
                </div>
                <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border/30 bg-background/30">
                        <tr>{['Name', 'ID', 'Department', 'Designation', 'Email', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => (
                          <tr key={emp.id} className="border-b border-border/20 hover:bg-background/20 transition-colors">
                            <td className="px-5 py-3 font-medium">{emp.fullName}</td>
                            <td className="px-5 py-3 text-foreground/60">{emp.id}</td>
                            <td className="px-5 py-3">{emp.department}</td>
                            <td className="px-5 py-3">{emp.designation}</td>
                            <td className="px-5 py-3 text-foreground/60">{emp.email}</td>
                            <td className="px-5 py-3"><StatusBadge status={emp.status} /></td>
                            <td className="px-5 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => toggleStatus(emp.id, emp.status)}
                                  className={`p-1.5 rounded-lg transition-colors ${emp.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                                  {emp.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'attendance' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="font-semibold text-lg">Attendance Log</h3>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                        className="pl-9 pr-4 py-2.5 rounded-xl bg-card/50 border border-border/40 outline-none focus:border-accent text-sm w-48" />
                    </div>
                    <button onClick={exportAttendanceCSV}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium hover:bg-green-500/30">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border/30 bg-background/30">
                        <tr>{['Employee', 'Date', 'Check-In', 'Check-Out', 'Break', 'Hours Worked', 'Status'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {filteredAttendance.map((r, i) => (
                          <tr key={i} className="border-b border-border/20 hover:bg-background/20 transition-colors">
                            <td className="px-5 py-3 font-medium">{r.employeeName}</td>
                            <td className="px-5 py-3">{fmtDate(r.date)}</td>
                            <td className="px-5 py-3 text-green-400">{fmt(r.checkIn)}</td>
                            <td className="px-5 py-3 text-red-400">{r.checkOut ? fmt(r.checkOut) : '—'}</td>
                            <td className="px-5 py-3 text-yellow-400">{r.totalBreakMinutes ? `${Math.floor(r.totalBreakMinutes)}m` : '—'}</td>
                            <td className="px-5 py-3">{r.totalHours ? `${r.totalHours}h` : '—'}</td>
                            <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'leaves' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-border/30"><h3 className="font-semibold">All Leave Requests</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border/30 bg-background/30">
                      <tr>{['Employee', 'Type', 'From', 'To', 'Reason', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l._docId} className="border-b border-border/20 hover:bg-background/20 transition-colors">
                          <td className="px-5 py-3 font-medium">{l.employeeName}</td>
                          <td className="px-5 py-3 capitalize">{l.type}</td>
                          <td className="px-5 py-3">{fmtDate(l.fromDate)}</td>
                          <td className="px-5 py-3">{fmtDate(l.toDate)}</td>
                          <td className="px-5 py-3 max-w-[160px] truncate" title={l.reason}>{l.reason}</td>
                          <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                          <td className="px-5 py-3">
                            {l.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleLeave(l._docId, 'approved')} className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30">Approve</button>
                                <button onClick={() => handleLeave(l._docId, 'rejected')} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30">Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {tab === 'registrations' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Pending Employee Registrations</h3>
                  <span className="text-sm text-foreground/50">{pendingRegs.length} awaiting approval</span>
                </div>
                {pendingRegs.length === 0 ? (
                  <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm p-12 text-center text-foreground/40">
                    No pending registrations 🎉
                  </div>
                ) : (
                  <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border/30 bg-background/30">
                          <tr>{['Name', 'Username', 'Department', 'Designation', 'Email', 'Phone', 'Actions'].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {pendingRegs.map((emp) => (
                            <tr key={emp.id} className="border-b border-border/20 hover:bg-background/20 transition-colors">
                              <td className="px-5 py-3 font-medium">{emp.fullName}</td>
                              <td className="px-5 py-3 text-foreground/60">{emp.username}</td>
                              <td className="px-5 py-3">{emp.department}</td>
                              <td className="px-5 py-3">{emp.designation}</td>
                              <td className="px-5 py-3 text-foreground/60">{emp.email}</td>
                              <td className="px-5 py-3">{emp.phone}</td>
                              <td className="px-5 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => handleApproveReg(emp.id)}
                                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button onClick={() => handleRejectReg(emp.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> Reject
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
              </motion.div>
            )}

            {tab === 'announcements' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm p-6">
                  <h3 className="font-semibold mb-5">Post New Announcement</h3>
                  <form onSubmit={handleAnnounce} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Title</label>
                      <input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                        placeholder="Announcement title..." required className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Message</label>
                      <textarea rows={4} value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })}
                        placeholder="Write your announcement..." required className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm resize-none" />
                    </div>
                    <button type="submit" className="self-start px-8 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(60,100,255,0.3)]">
                      Post Announcement
                    </button>
                  </form>
                </div>
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div key={a.id} className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-6">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-semibold">{a.title}</h4>
                        <span className="text-xs text-foreground/40 shrink-0">{fmtDate(a.postedAt)}</span>
                      </div>
                      <p className="text-foreground/70 text-sm leading-relaxed">{a.body}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {empModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEmpModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border/40 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">{editingEmp ? 'Edit Employee' : 'Add New Employee'}</h3>
                <button onClick={() => setEmpModal(false)} className="w-8 h-8 rounded-full bg-border/20 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEmpSubmit} className="grid grid-cols-2 gap-4">
                {[
                  ['Full Name', 'fullName', 'text', 'col-span-2'], ['Employee ID', 'id', 'text', ''],
                  ['Department', 'department', 'text', ''], ['Designation', 'designation', 'text', 'col-span-2'],
                  ['Email', 'email', 'email', ''], ['Phone', 'phone', 'tel', ''],
                  ['Username', 'username', 'text', ''], ['Password', 'password', 'password', ''],
                ].map(([label, field, type, span]) => (
                  <div key={field} className={`flex flex-col gap-1.5 ${span}`}>
                    <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">{label}</label>
                    <input type={type} value={empForm[field]} onChange={(e) => setEmpForm({ ...empForm, [field]: e.target.value })}
                      required disabled={field === 'id' && !!editingEmp} placeholder={label}
                      className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm disabled:opacity-50" />
                  </div>
                ))}
                <div className="col-span-2 flex gap-3 mt-2">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all">
                    {editingEmp ? 'Save Changes' : 'Add Employee'}
                  </button>
                  <button type="button" onClick={() => setEmpModal(false)} className="px-6 py-3 rounded-xl border border-border/40 text-sm hover:bg-card transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast key="toast" msg={toast.msg} type={toast.type} />}</AnimatePresence>
    </div>
  );
}
