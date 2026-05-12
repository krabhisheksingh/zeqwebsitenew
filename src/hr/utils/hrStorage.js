import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, query, where,
} from 'firebase/firestore';

// ── Session ────────────────────────────────────────────────────────────────────
export const getSession = () => {
  try { return JSON.parse(localStorage.getItem('hr_session')) || null; } catch { return null; }
};
export const setSession = (data) => localStorage.setItem('hr_session', JSON.stringify(data));
export const clearSession = () => localStorage.removeItem('hr_session');

// ── Seed ──────────────────────────────────────────────────────────────────────
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

// ── Employees ──────────────────────────────────────────────────────────────────
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
  const q = query(collection(db, 'employees'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return { result: null, reason: 'not_found' };
  const emp = snap.docs[0].data();
  if (emp.password !== password) return { result: null, reason: 'wrong_password' };
  if (emp.status === 'pending_approval') return { result: null, reason: 'pending_approval' };
  if (emp.status === 'rejected') return { result: null, reason: 'rejected' };
  if (emp.status !== 'active') return { result: null, reason: 'inactive' };
  return { result: emp, reason: null };
};

// ── Employee Self-Registration ─────────────────────────────────────────────────
export const registerEmployee = async (data) => {
  // Check username/email uniqueness
  const all = await getEmployees();
  if (all.find((e) => e.username === data.username)) return { ok: false, msg: 'Username already taken.' };
  if (all.find((e) => e.email === data.email)) return { ok: false, msg: 'Email already registered.' };
  const newId = `EMP${Date.now()}`;
  await setDoc(doc(db, 'employees', newId), {
    id: newId, ...data, role: 'employee',
    status: 'pending_approval', createdAt: new Date().toISOString(),
  });
  return { ok: true };
};

export const getPendingRegistrations = async () => {
  const q = query(collection(db, 'employees'), where('status', '==', 'pending_approval'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

export const approveRegistration = async (id) => {
  await updateDoc(doc(db, 'employees', id), { status: 'active', approvedAt: new Date().toISOString() });
};

export const rejectRegistration = async (id) => {
  await updateDoc(doc(db, 'employees', id), { status: 'rejected', rejectedAt: new Date().toISOString() });
};

// ── Attendance — BREAK functions defined FIRST to avoid hoisting issues ────────
export const endBreak = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'attendance', `${employeeId}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const record = snap.data();
  const now = new Date();
  const breaks = (record.breaks || []).map((b) =>
    b.end === null ? { ...b, end: now.toISOString() } : b
  );
  const totalBreakMinutes = parseFloat(
    breaks.reduce((acc, b) => {
      if (b.end) return acc + (new Date(b.end) - new Date(b.start)) / 60000;
      return acc;
    }, 0).toFixed(2)
  );
  await updateDoc(ref, { breaks, onBreak: false, totalBreakMinutes });
};

export const startBreak = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'attendance', `${employeeId}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const record = snap.data();
  if (record.checkOut || record.onBreak) return;
  const breaks = [...(record.breaks || [])];
  breaks.push({ start: new Date().toISOString(), end: null });
  await updateDoc(ref, { breaks, onBreak: true });
};

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
  // Guard: only check in once per day
  const existing = await getDoc(doc(db, 'attendance', docId));
  if (existing.exists()) return false; // already checked in
  await setDoc(doc(db, 'attendance', docId), {
    id: docId, employeeId, employeeName, date: today,
    checkIn: new Date().toISOString(), checkOut: null,
    breaks: [], onBreak: false, totalBreakMinutes: 0,
    totalHours: null, status: 'present',
  });
  return true;
};

export const checkOut = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'attendance', `${employeeId}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const record = snap.data();
  if (record.checkOut) return; // already checked out
  // End any open break first (endBreak is defined above — no hoisting issue)
  if (record.onBreak) await endBreak(employeeId);
  // Re-fetch fresh record after break end
  const freshSnap = await getDoc(ref);
  const fresh = freshSnap.data();
  const now = new Date();
  const totalMinutes = (now - new Date(fresh.checkIn)) / 60000;
  const breakMinutes = fresh.totalBreakMinutes || 0;
  const workedMinutes = Math.max(0, totalMinutes - breakMinutes);
  const hours = parseFloat((workedMinutes / 60).toFixed(2));
  await updateDoc(ref, {
    checkOut: now.toISOString(), totalHours: hours, onBreak: false,
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

// ── Leaves ────────────────────────────────────────────────────────────────────
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

// ── Announcements ─────────────────────────────────────────────────────────────
export const getAnnouncements = async () => {
  const snap = await getDocs(collection(db, 'announcements'));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
};

export const addAnnouncement = async (ann) => {
  await addDoc(collection(db, 'announcements'), { ...ann, postedAt: new Date().toISOString(), postedBy: 'superadmin' });
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const [employees, attendance, leaves, pending] = await Promise.all([
    getEmployees(), getAttendance(), getLeaves(), getPendingRegistrations(),
  ]);
  return {
    totalEmployees: employees.filter((e) => e.status === 'active').length,
    presentToday: attendance.filter((r) => r.date === today).length,
    onLeaveToday: leaves.filter((l) => l.status === 'approved' && l.fromDate <= today && l.toDate >= today).length,
    pendingLeaves: leaves.filter((l) => l.status === 'pending').length,
    pendingRegistrations: pending.length,
  };
};

// ── Export CSV ────────────────────────────────────────────────────────────────
export const exportAttendanceCSV = async () => {
  const records = await getAttendance();
  const header = 'Employee Name,Employee ID,Date,Check-In,Check-Out,Break (mins),Total Hours,Status\n';
  const rows = records.map((r) => {
    const ci = r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-';
    const co = r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-';
    return `"${r.employeeName}","${r.employeeId}","${r.date}","${ci}","${co}","${r.totalBreakMinutes ?? 0}","${r.totalHours ?? '-'}","${r.status}"`;
  });
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
};
