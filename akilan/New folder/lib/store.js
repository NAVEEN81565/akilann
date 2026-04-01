// ❌ Removed TypeScript imports

const SLOTS_KEY = "parking_slots";
const EMPLOYEES_KEY = "parking_employees";
const LOGS_KEY = "parking_logs";

// Helpers (removed generics)
function getItem(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed data
const seedSlots = [
  { slot_id: "A-01", slot_type: "car", shift_type: "morning", status: "free", created_at: new Date().toISOString() },
  { slot_id: "A-02", slot_type: "car", shift_type: "morning", status: "occupied", created_at: new Date().toISOString() },
  { slot_id: "A-03", slot_type: "car", shift_type: "night", status: "free", created_at: new Date().toISOString() },
  { slot_id: "B-01", slot_type: "bike", shift_type: "morning", status: "free", created_at: new Date().toISOString() },
  { slot_id: "B-02", slot_type: "bike", shift_type: "night", status: "occupied", created_at: new Date().toISOString() },
  { slot_id: "B-03", slot_type: "bike", shift_type: "morning", status: "free", created_at: new Date().toISOString() },
  { slot_id: "A-04", slot_type: "car", shift_type: "night", status: "occupied", created_at: new Date().toISOString() },
  { slot_id: "B-04", slot_type: "bike", shift_type: "night", status: "free", created_at: new Date().toISOString() },
];

const seedEmployees = [
  { emp_id: "EMP001", name: "Rahul Sharma", vehicle_number: "MH-12-AB-1234", shift_type: "morning", created_at: new Date().toISOString() },
  { emp_id: "EMP002", name: "Priya Patel", vehicle_number: "MH-14-CD-5678", shift_type: "night", created_at: new Date().toISOString() },
  { emp_id: "EMP003", name: "Amit Kumar", vehicle_number: "MH-12-EF-9012", shift_type: "morning", created_at: new Date().toISOString() },
  { emp_id: "EMP004", name: "Sneha Desai", vehicle_number: "MH-04-GH-3456", shift_type: "night", created_at: new Date().toISOString() },
];

const now = new Date();
const seedLogs = [
  { id: "1", person_name: "Rahul Sharma", person_type: "employee", vehicle_number: "MH-12-AB-1234", slot_id: "A-02", in_time: new Date(now.getTime() - 3600000 * 5).toISOString(), out_time: null },
  { id: "2", person_name: "Visitor - Ajay", person_type: "visitor", vehicle_number: "MH-01-XY-7890", slot_id: "B-02", in_time: new Date(now.getTime() - 3600000 * 2).toISOString(), out_time: null },
  { id: "3", person_name: "Amit Kumar", person_type: "employee", vehicle_number: "MH-12-EF-9012", slot_id: "A-04", in_time: new Date(now.getTime() - 3600000 * 8).toISOString(), out_time: null },
  { id: "4", person_name: "Priya Patel", person_type: "employee", vehicle_number: "MH-14-CD-5678", slot_id: "A-01", in_time: new Date(now.getTime() - 86400000).toISOString(), out_time: new Date(now.getTime() - 86400000 + 28800000).toISOString() },
  { id: "5", person_name: "Visitor - Ravi", person_type: "visitor", vehicle_number: "MH-03-PQ-4567", slot_id: "B-01", in_time: new Date(now.getTime() - 86400000 * 2).toISOString(), out_time: new Date(now.getTime() - 86400000 * 2 + 7200000).toISOString() },
];

// Init
function initIfEmpty() {
  if (!localStorage.getItem(SLOTS_KEY)) setItem(SLOTS_KEY, seedSlots);
  if (!localStorage.getItem(EMPLOYEES_KEY)) setItem(EMPLOYEES_KEY, seedEmployees);
  if (!localStorage.getItem(LOGS_KEY)) setItem(LOGS_KEY, seedLogs);
}

initIfEmpty();

// Slots
export const getSlots = () => getItem(SLOTS_KEY, seedSlots);

export const addSlot = (slot) => {
  const slots = getSlots();
  slots.push(slot);
  setItem(SLOTS_KEY, slots);
};

export const updateSlot = (slot_id, updates) => {
  const slots = getSlots().map((s) =>
    s.slot_id === slot_id ? { ...s, ...updates } : s
  );
  setItem(SLOTS_KEY, slots);
};

export const deleteSlot = (slot_id) => {
  setItem(
    SLOTS_KEY,
    getSlots().filter((s) => s.slot_id !== slot_id)
  );
};

// Employees
export const getEmployees = () => getItem(EMPLOYEES_KEY, seedEmployees);

export const addEmployee = (emp) => {
  const emps = getEmployees();
  emps.push(emp);
  setItem(EMPLOYEES_KEY, emps);
};

export const updateEmployee = (emp_id, updates) => {
  const emps = getEmployees().map((e) =>
    e.emp_id === emp_id ? { ...e, ...updates } : e
  );
  setItem(EMPLOYEES_KEY, emps);
};

export const deleteEmployee = (emp_id) => {
  setItem(
    EMPLOYEES_KEY,
    getEmployees().filter((e) => e.emp_id !== emp_id)
  );
};

// Logs
export const getLogs = () => getItem(LOGS_KEY, seedLogs);

export const addLog = (log) => {
  const logs = getLogs();
  logs.push(log);
  setItem(LOGS_KEY, logs);
};

export const updateLog = (id, updates) => {
  const logs = getLogs().map((l) =>
    l.id === id ? { ...l, ...updates } : l
  );
  setItem(LOGS_KEY, logs);
};

// Dashboard
export const getDashboardStats = () => {
  const slots = getSlots();
  const employees = getEmployees();
  const logs = getLogs();

  return {
    totalSlots: slots.length,
    occupiedSlots: slots.filter((s) => s.status === "occupied").length,
    freeSlots: slots.filter((s) => s.status === "free").length,
    totalEmployees: employees.length,
    activeVehicles: logs.filter((l) => !l.out_time).length,
  };
};