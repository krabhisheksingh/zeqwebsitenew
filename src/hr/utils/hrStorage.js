// ─── HR Portal Storage Utilities ───────────────────────────────────────────

const KEYS = {
  EMPLOYEES: 'hr_employees',
  ATTENDANCE: 'hr_attendance',
  LEAVES: 'hr_leaves',
  ANNOUNCEMENTS: 'hr_announcements',
  SESSION: 'hr_session',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const get = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
};
const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getObj = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
};
const setObj = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// ── Seed superadmin and demo employee ──────────────────────────────────────

export const seedInitialData = () => {
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    const employees = [
      {
        id: 'EMP001',
        fullName: 'Demo Employee',
        department: 'Engineering',
        designation: 'Software Developer',
        email: 'demo@zexoraquvixo.in',
        phone: '9876543210',
        username: 'demo',
        password: 'demo123',
        role: 'employee',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
    set(KEYS.EMPLOYEES, employees);
  }
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    const announcements = [
      {
        id: 'ANN001',
        title: 'Welcome to the HR Portal!',
        body: 'This portal allows you to manage attendance, apply for leaves, and stay updated with company announcements.',
        postedAt: new Date().toISOString(),
        postedBy: 'superadmin',
      },
    ];
    set(KEYS.ANNOUNCEMENTS, announcements);
  }
};

// ── Session ──────────────────────────────────────────────────────────────────

export const getSession = () => getObj(KEYS.SESSION);
export const setSession = (data) => setObj(KEYS.SESSION, data);
export const clearSession = () => localStorage.removeItem(KEYS.SESSION);

// ── Employees ─────────────────────────────────────────────────────────────────

export const getEmployees = () => get(KEYS.EMPLOYEES);

export const addEmployee = (emp) => {
  const employees = getEmployees();
  employees.push({ ...emp, role: 'employee', status: 'active', createdAt: new Date().toISOString() });
  set(KEYS.EMPLOYEES, employees);
};

export const updateEmployee = (id, updates) => {
  const employees = getEmployees().map((e) => (e.id === id ? { ...e, ...updates } : e));
  set(KEYS.EMPLOYEES, employees);
};

export const findEmployee = (username, password) =>
  getEmployees().find((e) => e.username === username && e.password === password && e.status === 'active');

// ── Attendance ──────────────────────────────────────────────────────────────

export const getAttendance = () => get(KEYS.ATTENDANCE);

export const getTodayRecord = (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  return getAttendance().find((r) => r.employeeId === employeeId && r.date === today) || null;
};

export const checkIn = (employeeId, employeeName) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const records = getAttendance();
  records.push({
    id: `${employeeId}_${today}`,
    employeeId,
    employeeName,
    date: today,
    checkIn: now.toISOString(),
    checkOut: null,
    totalHours: null,
    status: 'present',
  });
  set(KEYS.ATTENDANCE, records);
};

export const checkOut = (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const records = getAttendance().map((r) => {
    if (r.employeeId === employeeId && r.date === today && r.checkOut === null) {
      const inTime = new Date(r.checkIn);
      const hours = ((now - inTime) / 3600000).toFixed(2);
      const status = hours >= 8 ? 'present' : hours >= 4 ? 'half-day' : 'present';
      return { ...r, checkOut: now.toISOString(), totalHours: parseFloat(hours), status };
    }
    return r;
  });
  set(KEYS.ATTENDANCE, records);
};

export const getEmployeeAttendance = (employeeId, days = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return getAttendance()
    .filter((r) => r.employeeId === employeeId && new Date(r.date) >= cutoff)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// ── Leaves ──────────────────────────────────────────────────────────────────

export const getLeaves = () => get(KEYS.LEAVES);

export const applyLeave = (leave) => {
  const leaves = getLeaves();
  leaves.push({
    ...leave,
    id: `LV_${Date.now()}`,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  });
  set(KEYS.LEAVES, leaves);
};

export const updateLeaveStatus = (id, status) => {
  const leaves = getLeaves().map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l));
  set(KEYS.LEAVES, leaves);
};

export const getEmployeeLeaves = (employeeId) =>
  getLeaves().filter((l) => l.employeeId === employeeId).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

// ── Announcements ────────────────────────────────────────────────────────────

export const getAnnouncements = () =>
  get(KEYS.ANNOUNCEMENTS).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

export const addAnnouncement = (ann) => {
  const anns = getAnnouncements();
  anns.unshift({ ...ann, id: `ANN_${Date.now()}`, postedAt: new Date().toISOString(), postedBy: 'superadmin' });
  set(KEYS.ANNOUNCEMENTS, anns);
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getDashboardStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const employees = getEmployees();
  const attendance = getAttendance();
  const leaves = getLeaves();

  const totalEmployees = employees.filter((e) => e.status === 'active').length;
  const presentToday = attendance.filter((r) => r.date === today).length;
  const onLeaveToday = leaves.filter(
    (l) => l.status === 'approved' && l.fromDate <= today && l.toDate >= today
  ).length;
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;

  return { totalEmployees, presentToday, onLeaveToday, pendingLeaves };
};

// ── Export CSV ────────────────────────────────────────────────────────────────

export const exportAttendanceCSV = () => {
  const records = getAttendance();
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
  a.href = url;
  a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
