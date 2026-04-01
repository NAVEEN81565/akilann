export type SlotType = 'car' | 'bike';
export type ShiftType = 'morning' | 'night';
export type SlotStatus = 'free' | 'occupied';

export interface ParkingSlot {
  slot_id: string;
  slot_type: SlotType;
  shift_type: ShiftType;
  status: SlotStatus;
  created_at: string;
}

export interface Employee {
  emp_id: string;
  name: string;
  vehicle_number: string;
  shift_type: ShiftType;
  created_at: string;
}

export interface ParkingLog {
  id: string;
  person_name: string;
  person_type: 'employee' | 'visitor';
  vehicle_number: string;
  slot_id: string;
  in_time: string;
  out_time: string | null;
}

export interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  totalEmployees: number;
  activeVehicles: number;
}
