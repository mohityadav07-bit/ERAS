export type UserRole = 'Admin' | 'HOD' | 'Faculty' | 'Student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
}

export type ResourceCategory = 'Classroom' | 'Lab' | 'Equipment' | 'Software License';

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface Resource {
  id: string;
  name: string;
  code: string;
  category: ResourceCategory;
  type: string;
  building: string;
  floor: number;
  capacity: number;
  status: RoomStatus;
  currentOccupant?: string;
  currentCourse?: string;
  currentEndsAt?: string;
  features: string[]; // e.g. ['Projector', 'GPU Workstations', 'Smart Board', 'Audio System']
  hourlyCost?: number;
}

export type BookingStatus = 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  courseCode?: string;
  expectedAttendance: number;
  priority: PriorityLevel;
  status: BookingStatus;
  requestedAt: string;
  approvedBy?: string;
  rejectionReason?: string;
  equipmentRequested?: string[];
}

export interface DepartmentBudget {
  id: string;
  departmentId: string;
  departmentName: string;
  fiscalYear: string;
  totalAllocated: number;
  spent: number;
  pendingCommitments: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
  }[];
  recentExpenses: {
    id: string;
    description: string;
    amount: number;
    date: string;
    approvedBy: string;
    category: string;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  assetTag: string;
  category: 'Hardware' | 'AudioVisual' | 'LabEquipment' | 'Software';
  location: string;
  condition: 'Optimal' | 'Fair' | 'Under Maintenance' | 'Decommissioned';
  assignedTo?: string;
  assignedDepartment: string;
  purchaseDate: string;
  nextMaintenanceDate?: string;
  quantityTotal: number;
  quantityAvailable: number;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  batch: string; // e.g. 'CS-Year-3'
  studentStrength: number;
  teacherId: string;
  teacherName: string;
  weeklyHours: number;
  type: 'Lecture' | 'Lab' | 'Seminar';
  requiredFeatures: string[];
}

export interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string; // e.g., '09:00 - 10:30'
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  roomCode: string;
  roomName: string;
  batch: string;
  studentStrength: number;
  capacity: number;
}

export interface ConflictRecord {
  type: 'Double Booking' | 'Capacity Exceeded' | 'Teacher Overlap' | 'Feature Missing';
  description: string;
  courseCode: string;
  timeSlot: string;
  day: string;
  resolution: string;
}

export interface SolverResult {
  schedule: TimetableSlot[];
  conflictsDetected: number;
  conflictsResolved: number;
  unassignedCourses: Course[];
  conflictLog: ConflictRecord[];
  roomUtilizationRate: number; // percentage
  executionTimeMs: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'alert' | 'budget' | 'maintenance';
  priority: 'info' | 'warning' | 'critical';
  actionableId?: string;
}
