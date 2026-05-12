import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ClockIcon, History, FileText, Bell, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import HRNavbar from '../components/HRNavbar';
import {
  getSession, getTodayRecord, checkIn, checkOut,
  getEmployeeAttendance, getEmployeeLeaves, applyLeave,
  getAnnouncements, updateEmployee, findEmployee,
} from '../utils/hrStorage';

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
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${cfg[status] || 'bg-foreground/10 text-foreground/60 border-border/30'}`}>
      {status}
    </span>
  );
};

const Card = ({ icon: Icon, label, value, sub, color = 'accent' }) => (
  <div className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-${color}/20 border border-${color}/30 flex items-center justify-center shrink-0`}>
      <Icon className={`w-6 h-6 text-${color}`} />
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Toast = ({ msg, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-medium ${
      type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
      type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
      'bg-accent/20 border-accent/30 text-accent'
    }`}
  >
    {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : type === 'error' ? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
    {msg}
  </motion.div>
);

export default function EmployeeDashboard() {
  const session = getSession();
  const [tab, setTab] = useState('attendance');
  const [todayRec, setTodayRec] = useState(null);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ type: 'sick', fromDate: '', toDate: '', reason: '' });
  const [profileForm, setProfileForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [empData, setEmpData] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refresh = () => {
    setTodayRec(getTodayRecord(session.employeeId));
    setHistory(getEmployeeAttendance(session.employeeId, 30));
    setLeaves(getEmployeeLeaves(session.employeeId));
    setAnnouncements(getAnnouncements());
    const all = JSON.parse(localStorage.getItem('hr_employees') || '[]');
    setEmpData(all.find((e) => e.id === session.employeeId) || null);
  };

  useEffect(() => { refresh(); }, []);

  const handleCheckIn = () => {
    if (todayRec) return;
    checkIn(session.employeeId, session.name);
    refresh();
    showToast(`Checked in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleCheckOut = () => {
    if (!todayRec || todayRec.checkOut) return;
    checkOut(session.employeeId);
    refresh();
    showToast(`Checked out at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      showToast('Please fill all fields', 'error'); return;
    }
    applyLeave({ ...leaveForm, employeeId: session.employeeId, employeeName: session.name });
    setLeaveForm({ type: 'sick', fromDate: '', toDate: '', reason: '' });
    refresh();
    showToast('Leave request submitted successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!empData) return;
    if (profileForm.oldPass !== empData.password) { showToast('Current password is incorrect', 'error'); return; }
    if (profileForm.newPass.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (profileForm.newPass !== profileForm.confirmPass) { showToast('Passwords do not match', 'error'); return; }
    updateEmployee(session.employeeId, { password: profileForm.newPass });
    setProfileForm({ oldPass: '', newPass: '', confirmPass: '' });
    refresh();
    showToast('Password updated successfully!');
  };

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'history', label: 'History', icon: History },
    { id: 'leave', label: 'Leave', icon: FileText },
    { id: 'announcements', label: 'Updates', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HRNavbar title="Employee Dashboard" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {session?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-foreground/50 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card icon={Clock} label="Check-In" value={todayRec ? fmt(todayRec.checkIn) : '—'} sub="Today" />
          <Card icon={ClockIcon} label="Check-Out" value={todayRec?.checkOut ? fmt(todayRec.checkOut) : '—'} sub="Today" />
          <Card icon={History} label="Hours" value={todayRec?.totalHours ? `${todayRec.totalHours}h` : '—'} sub="Worked today" />
          <Card icon={FileText} label="Leaves" value={leaves.filter((l) => l.status === 'pending').length} sub="Pending requests" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card/40 border border-border/30 rounded-2xl p-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-accent text-white shadow-lg' : 'text-foreground/60 hover:text-foreground hover:bg-background/50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── ATTENDANCE TAB ─── */}
        {tab === 'attendance' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-bold text-foreground">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-foreground/40 text-sm">{new Date().toLocaleDateString('en-IN')}</div>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={handleCheckIn}
                  disabled={!!todayRec}
                  className="flex-1 py-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-lg hover:bg-green-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {todayRec ? `Checked In at ${fmt(todayRec.checkIn)}` : 'Check In'}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={!todayRec || !!todayRec?.checkOut}
                  className="flex-1 py-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-lg hover:bg-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  {todayRec?.checkOut ? `Checked Out at ${fmt(todayRec.checkOut)}` : 'Check Out'}
                </button>
              </div>
            </div>

            {todayRec && (
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border/30 bg-card/40 p-4 text-center">
                  <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Check-In</p>
                  <p className="text-xl font-bold text-green-400">{fmt(todayRec.checkIn)}</p>
                </div>
                <div className="rounded-2xl border border-border/30 bg-card/40 p-4 text-center">
                  <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Check-Out</p>
                  <p className="text-xl font-bold text-red-400">{todayRec.checkOut ? fmt(todayRec.checkOut) : '—'}</p>
                </div>
                <div className="rounded-2xl border border-border/30 bg-card/40 p-4 text-center">
                  <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-xl font-bold text-accent">{todayRec.totalHours ? `${todayRec.totalHours}h` : '—'}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {tab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h3 className="font-semibold">Attendance History — Last 30 Days</h3>
            </div>
            {history.length === 0 ? (
              <div className="p-12 text-center text-foreground/40">No attendance records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/30 bg-background/30">
                    <tr>
                      {['Date', 'Check-In', 'Check-Out', 'Hours', 'Status'].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-background/20 transition-colors">
                        <td className="px-6 py-4 font-medium">{fmtDate(r.date)}</td>
                        <td className="px-6 py-4 text-green-400">{fmt(r.checkIn)}</td>
                        <td className="px-6 py-4 text-red-400">{r.checkOut ? fmt(r.checkOut) : '—'}</td>
                        <td className="px-6 py-4">{r.totalHours ? `${r.totalHours}h` : '—'}</td>
                        <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── LEAVE TAB ─── */}
        {tab === 'leave' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Apply Form */}
            <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm p-6">
              <h3 className="font-semibold mb-5">Apply for Leave</h3>
              <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Leave Type</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="earned">Earned Leave</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">From Date</label>
                  <input type="date" value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">To Date</label>
                  <input type="date" value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm" required />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Reason</label>
                  <textarea rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Briefly explain your reason..."
                    className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm resize-none" required />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="px-8 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(60,100,255,0.3)]">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>

            {/* Leave History */}
            <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-border/30">
                <h3 className="font-semibold">My Leave Requests</h3>
              </div>
              {leaves.length === 0 ? (
                <div className="p-12 text-center text-foreground/40">No leave requests found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border/30 bg-background/30">
                      <tr>
                        {['Type', 'From', 'To', 'Reason', 'Status'].map((h) => (
                          <th key={h} className="text-left px-6 py-3 text-xs uppercase tracking-wider text-foreground/40 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-background/20 transition-colors">
                          <td className="px-6 py-4 capitalize">{l.type}</td>
                          <td className="px-6 py-4">{fmtDate(l.fromDate)}</td>
                          <td className="px-6 py-4">{fmtDate(l.toDate)}</td>
                          <td className="px-6 py-4 max-w-[180px] truncate" title={l.reason}>{l.reason}</td>
                          <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── ANNOUNCEMENTS TAB ─── */}
        {tab === 'announcements' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {announcements.length === 0 ? (
              <div className="p-12 text-center text-foreground/40">No announcements yet.</div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-semibold text-foreground">{a.title}</h4>
                    <span className="text-xs text-foreground/40 shrink-0">{fmtDate(a.postedAt)}</span>
                  </div>
                  <p className="text-foreground/70 text-sm leading-relaxed">{a.body}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ─── PROFILE TAB ─── */}
        {tab === 'profile' && empData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-2">
                <User className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold">{empData.fullName}</h3>
              {[
                ['Employee ID', empData.id],
                ['Department', empData.department],
                ['Designation', empData.designation],
                ['Email', empData.email],
                ['Phone', empData.phone],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center border-b border-border/20 pb-2">
                  <span className="text-xs uppercase tracking-wider text-foreground/40 font-semibold">{label}</span>
                  <span className="text-sm font-medium text-foreground">{val}</span>
                </div>
              ))}
            </div>

            {/* Change Password */}
            <div className="rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm p-6">
              <h3 className="font-semibold mb-5">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                {[
                  ['Current Password', 'oldPass'],
                  ['New Password', 'newPass'],
                  ['Confirm New Password', 'confirmPass'],
                ].map(([label, field]) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">{label}</label>
                    <input
                      type="password"
                      value={profileForm[field]}
                      onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                      className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                ))}
                <button type="submit" className="mt-2 px-8 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all">
                  Update Password
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
