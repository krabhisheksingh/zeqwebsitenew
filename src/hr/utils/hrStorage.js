import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, query, where,
} from 'firebase/firestore';

// ── Session (localStorage — device-specific login state) ─────────────────────
export const getSession = () => {
  try { return JSON.parse(localStorage.getItem('hr_session')) || null; } catch { return null; }
};
export const setSession = (data) => localStorage.setItem('hr_session', JSON.stringify(data));
export const clearSession = () => localStorage.removeItem('hr_session');

// ── Seed initial data (runs once, checks before inserting) ───────────────────
export const seedInitialData = async () => {
  const empSnap = await getDocs(collection(db, 'employees'));
  if (empSnap.empty) {
    await setDoc(doc(db, 'employees', 'EMP001'), {
      id: 'EMP001', fullName: 'Demo Employee', department: 'Engineering',
      designation: 'Software Developer', email: 'demo@zexoraquvixo.in',
      phone: '9876543210', username: 'demo', password: 'demo123',
      role: 'employee', status: 'active', createdAt: new Date().toISOString(),
    });
  }
  const annSnap = await getDocs(collection(db, 'announcements'));
  if (annSnap.empty) {
    await addDoc(collection(db, 'announcements'), {
      title: 'Welcome to the HR Portal!',
      body: 'This portal allows you to manage attendance, apply for leaves, and stay updated with company announcements.',
      postedAt: new Date().toISOString(), postedBy: 'superadmin',
    });
  }
};

// ── Employees ─────────────────────────────────────────────────────────────────
export const getEmployees = async () => {
  const snap = await getDocs(collection(db, 'employees'));
  return snap.docs.map((d) => ({ ...d.data() }));
};

export const addEmployee = async (emp) => {
  await setDoc(doc(db, 'employees', emp.id), {
    ...emp, role: 'employee', status: 'active', createdAt: new Date().toISOString(),
  });
};

export const updateEmployee = async (id, updates) => {
  await updateDoc(doc(db, 'employees', id), updates);
};

export const findEmployee = async (username, password) => {
  const q = query(collection(db, 'employees'), where('username', '==', username), where('status', '==', 'active'));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const emp = snap.docs[0].data();
  return emp.password === password ? emp : null;
};

// ── Attendance ───────────────────────────────────────────────────────────────
export const getAttendance = async () => {
  const snap = await getDocs(collection(db, 'attendance'));
  return snap.docs.map((d) => d.data()).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getTodayRecord = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const snap = await getDoc(doc(db, 'attendance', `${employeeId}_${today}`));
  return snap.exists() ? snap.data() : null;
};

export const checkIn = async (employeeId, employeeName) => {
  const today = new Date().toISOString().split('T')[0];
  const docId = `${employeeId}_${today}`;
  await setDoc(doc(db, 'attendance', docId), {
    id: docId, employeeId, employeeName, date: today,
    checkIn: new Date().toISOString(), checkOut: null, totalHours: null, status: 'present',
  });
};

export const checkOut = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'attendance', `${employeeId}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const record = snap.data();
  const now = new Date();
  const hours = parseFloat(((now - new Date(record.checkIn)) / 3600000).toFixed(2));
  await updateDoc(ref, {
    checkOut: now.toISOString(),
    totalHours: hours,
    status: hours >= 8 ? 'present' : hours >= 4 ? 'half-day' : 'present',
  });
};

export const getEmployeeAttendance = async (employeeId, days = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const q = query(collection(db, 'attendance'), where('employeeId', '==', employeeId), where('date', '>=', cutoffStr));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data()).sort((a, b) => new Date(b.date) - new Date(a.date));
};

// ── Leaves ───────────────────────────────────────────────────────────────────
export const getLeaves = async () => {
  const snap = await getDocs(collection(db, 'leaves'));
  return snap.docs.map((d) => ({ ...d.data(), _docId: d.id })).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
};

export const applyLeave = async (leave) => {
  await addDoc(collection(db, 'leaves'), { ...leave, status: 'pending', appliedAt: new Date().toISOString() });
};

export const updateLeaveStatus = async (docId, status) => {
  await updateDoc(doc(db, 'leaves', docId), { status, updatedAt: new Date().toISOString() });
};

export const getEmployeeLeaves = async (employeeId) => {
  const q = query(collection(db, 'leaves'), where('employeeId', '==', employeeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), _docId: d.id })).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
};

// ── Announcements ────────────────────────────────────────────────────────────
export const getAnnouncements = async () => {
  const snap = await getDocs(collection(db, 'announcements'));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
};

export const addAnnouncement = async (ann) => {
  await addDoc(collection(db, 'announcements'), { ...ann, postedAt: new Date().toISOString(), postedBy: 'superadmin' });
};

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const [employees, attendance, leaves] = await Promise.all([getEmployees(), getAttendance(), getLeaves()]);
  return {
    totalEmployees: employees.filter((e) => e.status === 'active').length,
    presentToday: attendance.filter((r) => r.date === today).length,
    onLeaveToday: leaves.filter((l) => l.status === 'approved' && l.fromDate <= today && l.toDate >= today).length,
    pendingLeaves: leaves.filter((l) => l.status === 'pending').length,
  };
};

// ── Export CSV ────────────────────────────────────────────────────────────────
export const exportAttendanceCSV = async () => {
  const records = await getAttendance();
  const header = 'Employee Name,Employee ID,Date,Check-In,Check-Out,Total Hours,Status\n';
  const rows = records.map((r) => {
    const ci = r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-';
    const co = r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-';
    return `"${r.employeeName}","${r.employeeId}","${r.date}","${ci}","${co}","${r.totalHours ?? '-'}","${r.status}"`;
  });
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
};
