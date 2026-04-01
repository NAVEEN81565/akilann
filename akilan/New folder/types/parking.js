// Constants (instead of TypeScript union types)
export const SlotType = {
  CAR: "car",
  BIKE: "bike",
};

export const ShiftType = {
  MORNING: "morning",
  NIGHT: "night",
};

export const SlotStatus = {
  FREE: "free",
  OCCUPIED: "occupied",
};

// Example data structures (instead of interfaces)

// Parking Slot
export const createParkingSlot = (data) => ({
  slot_id: data.slot_id,
  slot_type: data.slot_type, // "car" | "bike"
  shift_type: data.shift_type, // "morning" | "night"
  status: data.status, // "free" | "occupied"
  created_at: data.created_at,
});

// Employee
export const createEmployee = (data) => ({
  emp_id: data.emp_id,
  name: data.name,
  vehicle_number: data.vehicle_number,
  shift_type: data.shift_type,
  created_at: data.created_at,
});

// Parking Log
export const createParkingLog = (data) => ({
  id: data.id,
  person_name: data.person_name,
  person_type: data.person_type, // "employee" | "visitor"
  vehicle_number: data.vehicle_number,
  slot_id: data.slot_id,
  in_time: data.in_time,
  out_time: data.out_time || null,
});

// Dashboard Stats
export const createDashboardStats = (data) => ({
  totalSlots: data.totalSlots,
  occupiedSlots: data.occupiedSlots,
  freeSlots: data.freeSlots,
  totalEmployees: data.totalEmployees,
  activeVehicles: data.activeVehicles,
});