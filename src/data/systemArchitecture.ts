export interface EREntity {
  name: string;
  tableName: string;
  description: string;
  color: string;
  fields: {
    name: string;
    type: string;
    constraint?: string;
    isPk?: boolean;
    isFk?: boolean;
    refTable?: string;
  }[];
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  category: string;
  description: string;
  authRoles: string[];
  requestBody?: string;
  responseBody: string;
  statusCodes: number[];
}

export interface SprintPlan {
  sprintNumber: number;
  title: string;
  duration: string;
  goal: string;
  stories: {
    title: string;
    points: number;
    tasks: string[];
    acceptanceCriteria: string[];
  }[];
}

export const ER_ENTITIES: EREntity[] = [
  {
    name: 'User',
    tableName: 'users',
    description: 'System identity holding credentials, institutional roles, and department association',
    color: 'emerald',
    fields: [
      { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', isPk: true },
      { name: 'email', type: 'VARCHAR(255)', constraint: 'UNIQUE NOT NULL' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraint: 'NOT NULL' },
      { name: 'full_name', type: 'VARCHAR(150)', constraint: 'NOT NULL' },
      { name: 'role', type: 'user_role_enum', constraint: "NOT NULL CHECK (role IN ('Admin', 'HOD', 'Faculty', 'Student'))" },
      { name: 'department_id', type: 'UUID', constraint: 'REFERENCES departments(id) ON DELETE SET NULL', isFk: true, refTable: 'departments' },
      { name: 'status', type: 'VARCHAR(20)', constraint: "DEFAULT 'active' CHECK (status IN ('active', 'suspended'))" },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraint: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'Department',
    tableName: 'departments',
    description: 'Academic or administrative divisions with budget allocations and resource ownership',
    color: 'blue',
    fields: [
      { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', isPk: true },
      { name: 'code', type: 'VARCHAR(20)', constraint: 'UNIQUE NOT NULL' },
      { name: 'name', type: 'VARCHAR(150)', constraint: 'NOT NULL' },
      { name: 'hod_user_id', type: 'UUID', constraint: 'REFERENCES users(id) ON DELETE SET NULL', isFk: true, refTable: 'users' },
      { name: 'annual_budget_pool', type: 'NUMERIC(14,2)', constraint: 'DEFAULT 0.00' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraint: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'Resource',
    tableName: 'resources',
    description: 'Physical classrooms, laboratories, high-end compute equipment, or software license pools',
    color: 'amber',
    fields: [
      { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', isPk: true },
      { name: 'resource_code', type: 'VARCHAR(50)', constraint: 'UNIQUE NOT NULL' },
      { name: 'name', type: 'VARCHAR(150)', constraint: 'NOT NULL' },
      { name: 'category', type: 'resource_category_enum', constraint: "NOT NULL CHECK (category IN ('Classroom', 'Lab', 'Equipment', 'Software License'))" },
      { name: 'type', type: 'VARCHAR(80)', constraint: 'NOT NULL' },
      { name: 'capacity', type: 'INTEGER', constraint: 'NOT NULL CHECK (capacity > 0)' },
      { name: 'building', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
      { name: 'floor', type: 'SMALLINT', constraint: 'NOT NULL' },
      { name: 'features', type: 'TEXT[]', constraint: "DEFAULT '{}'" },
      { name: 'is_operational', type: 'BOOLEAN', constraint: 'DEFAULT TRUE' },
      { name: 'hourly_rate', type: 'NUMERIC(8,2)', constraint: 'DEFAULT 0.00' },
    ],
  },
  {
    name: 'Booking',
    tableName: 'bookings',
    description: 'Confirmed or requested time slot reservations on resources with exclusion constraints',
    color: 'indigo',
    fields: [
      { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', isPk: true },
      { name: 'resource_id', type: 'UUID', constraint: 'NOT NULL REFERENCES resources(id) ON DELETE CASCADE', isFk: true, refTable: 'resources' },
      { name: 'user_id', type: 'UUID', constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE', isFk: true, refTable: 'users' },
      { name: 'department_id', type: 'UUID', constraint: 'REFERENCES departments(id)', isFk: true, refTable: 'departments' },
      { name: 'start_time', type: 'TIMESTAMPTZ', constraint: 'NOT NULL' },
      { name: 'end_time', type: 'TIMESTAMPTZ', constraint: 'NOT NULL CHECK (end_time > start_time)' },
      { name: 'purpose', type: 'TEXT', constraint: 'NOT NULL' },
      { name: 'priority', type: 'priority_enum', constraint: "DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'))" },
      { name: 'status', type: 'booking_status_enum', constraint: "DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected', 'Cancelled'))" },
      { name: 'approved_by', type: 'UUID', constraint: 'REFERENCES users(id)', isFk: true, refTable: 'users' },
      { name: 'time_range', type: 'TSRANGE', constraint: 'GENERATED ALWAYS AS (tsrange(start_time, end_time)) STORED' },
    ],
  },
  {
    name: 'Budget',
    tableName: 'budgets',
    description: 'Fiscal year budgetary allocations and expenditure tracking per department',
    color: 'teal',
    fields: [
      { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', isPk: true },
      { name: 'department_id', type: 'UUID', constraint: 'NOT NULL REFERENCES departments(id) ON DELETE CASCADE', isFk: true, refTable: 'departments' },
      { name: 'fiscal_year', type: 'VARCHAR(20)', constraint: 'NOT NULL' },
      { name: 'total_allocated', type: 'NUMERIC(14,2)', constraint: 'NOT NULL CHECK (total_allocated >= 0)' },
      { name: 'spent', type: 'NUMERIC(14,2)', constraint: 'DEFAULT 0.00 CHECK (spent >= 0)' },
      { name: 'pending_commitments', type: 'NUMERIC(14,2)', constraint: 'DEFAULT 0.00' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', constraint: 'DEFAULT NOW()' },
    ],
  },
  {
    name: 'Request',
    tableName: 'resource_requests',
    description: 'Formal procurement and scheduling change requests routed through HOD & Admin approval pipelines',
    color: 'rose',
    fields: [
      { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT gen_random_uuid()', isPk: true },
      { name: 'requested_by', type: 'UUID', constraint: 'NOT NULL REFERENCES users(id)', isFk: true, refTable: 'users' },
      { name: 'resource_id', type: 'UUID', constraint: 'REFERENCES resources(id)', isFk: true, refTable: 'resources' },
      { name: 'priority', type: 'priority_enum', constraint: 'NOT NULL' },
      { name: 'approval_status', type: 'approval_enum', constraint: "DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected'))" },
      { name: 'decision_reason', type: 'TEXT' },
      { name: 'decided_by', type: 'UUID', constraint: 'REFERENCES users(id)', isFk: true, refTable: 'users' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraint: 'DEFAULT NOW()' },
    ],
  },
];

export const POSTGRESQL_SCHEMA_SQL = `-- ============================================================================
-- EDUCATION RESOURCE ALLOCATION SYSTEM (ERAS)
-- Production PostgreSQL Database DDL Schema
-- Enforces Foreign Keys, Check Constraints, and Anti-Double-Booking Guards
-- ============================================================================

-- 1. Enable btree_gist extension for PostgreSQL Exclusion Constraints
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Custom Enumerations
CREATE TYPE user_role AS ENUM ('Admin', 'HOD', 'Faculty', 'Student');
CREATE TYPE resource_category AS ENUM ('Classroom', 'Lab', 'Equipment', 'Software License');
CREATE TYPE booking_status AS ENUM ('Approved', 'Pending', 'Rejected', 'Cancelled');
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High', 'Urgent');
CREATE TYPE asset_condition AS ENUM ('Optimal', 'Fair', 'Under Maintenance', 'Decommissioned');

-- 3. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    hod_user_id UUID,
    annual_budget_pool NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (annual_budget_pool >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Users Table (with RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Circular FK link from departments to users
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_hod
    FOREIGN KEY (hod_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Resources Table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category resource_category NOT NULL,
    type VARCHAR(80) NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor SMALLINT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    features TEXT[] NOT NULL DEFAULT '{}',
    is_operational BOOLEAN NOT NULL DEFAULT TRUE,
    hourly_rate NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (hourly_rate >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Bookings Table (Core Engine)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    purpose TEXT NOT NULL,
    course_code VARCHAR(30),
    expected_attendance INTEGER CHECK (expected_attendance > 0),
    priority priority_level NOT NULL DEFAULT 'Medium',
    status booking_status NOT NULL DEFAULT 'Pending',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_booking_time_valid CHECK (end_time > start_time),
    
    -- Anti-Double-Booking Exclusion Constraint:
    -- Guarantees that no two 'Approved' bookings can overlap on the same resource
    CONSTRAINT no_overlapping_approved_bookings EXCLUDE USING gist (
        resource_id WITH =,
        tsrange(start_time, end_time) WITH &&
    ) WHERE (status = 'Approved')
);

-- 7. Budgets & Department Ledger
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    fiscal_year VARCHAR(20) NOT NULL,
    total_allocated NUMERIC(14, 2) NOT NULL CHECK (total_allocated >= 0),
    spent NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (spent >= 0),
    pending_commitments NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (pending_commitments >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_dept_fiscal UNIQUE (department_id, fiscal_year)
);

CREATE TABLE budget_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(80) NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 8. Inventory & Physical Assets
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    condition asset_condition NOT NULL DEFAULT 'Optimal',
    department_id UUID REFERENCES departments(id),
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quantity_total INTEGER NOT NULL DEFAULT 1 CHECK (quantity_total >= 1),
    quantity_available INTEGER NOT NULL DEFAULT 1 CHECK (quantity_available >= 0),
    next_maintenance_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Secondary Indexes for Ultra-Fast Lookups
CREATE INDEX idx_bookings_resource_times ON bookings(resource_id, start_time, end_time);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_resources_category_building ON resources(category, building);

-- ============================================================================
-- ANTI-DOUBLE-BOOKING TRIGGER & VALIDATION FUNCTION
-- Prevents race conditions and provides human-friendly error messages
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_prevent_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
    v_conflicting_id UUID;
    v_conflicting_user VARCHAR(150);
BEGIN
    -- Only validate when booking is being set to 'Approved'
    IF NEW.status = 'Approved' THEN
        SELECT b.id, u.full_name
        INTO v_conflicting_id, v_conflicting_user
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.resource_id = NEW.resource_id
          AND b.status = 'Approved'
          AND b.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND tsrange(b.start_time, b.end_time) && tsrange(NEW.start_time, NEW.end_time)
        LIMIT 1;

        IF FOUND THEN
            RAISE EXCEPTION 'Double-booking conflict! Resource % is already reserved by % during time range [%, %].',
                NEW.resource_id, v_conflicting_user, NEW.start_time, NEW.end_time
                USING ERRCODE = '23P01'; -- exclusion_violation
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_booking_collision
    BEFORE INSERT OR UPDATE OF resource_id, start_time, end_time, status
    ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_booking_overlap();

-- ============================================================================
-- SQL QUERY TO DETECT CONFLICTS FOR A GIVEN CANDIDATE SLOT
-- Used by the backend before accepting reservations
-- ============================================================================
/*
SELECT 
    b.id AS conflicting_booking_id,
    r.name AS resource_name,
    u.full_name AS booked_by_user,
    b.start_time,
    b.end_time,
    b.purpose
FROM bookings b
JOIN resources r ON b.resource_id = r.id
JOIN users u ON b.user_id = u.id
WHERE b.resource_id = :candidate_resource_id
  AND b.status = 'Approved'
  AND b.start_time < :candidate_end_time
  AND b.end_time > :candidate_start_time;
*/
`;

export const MONGODB_SCHEMA_DOC = `/**
 * MongoDB Alternative Document Schemas (Mongoose format)
 * Ideal for multi-tenant, schema-flexible campus deployments
 */

const { Schema, model } = require('mongoose');

// Resource Schema with GeoJSON & Embedded Equipment
const ResourceSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Classroom', 'Lab', 'Equipment', 'Software License'], required: true },
  type: String,
  building: { type: String, required: true, index: true },
  floor: Number,
  capacity: { type: Number, required: true, min: 1 },
  features: [String],
  isOperational: { type: Boolean, default: true },
  hourlyRate: { type: Number, default: 0 },
  activeSchedule: [{
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    startMinute: Number, // 0 - 1440
    endMinute: Number,
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' }
  }]
}, { timestamps: true });

// Booking Schema with Compound Index for Fast Collision Checks
const BookingSchema = new Schema({
  resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  purpose: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Approved', 'Pending', 'Rejected', 'Cancelled'], default: 'Pending', index: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  equipmentRequested: [String]
}, { timestamps: true });

// Compound Index to accelerate time-range collision scans
BookingSchema.index({ resourceId: 1, status: 1, startTime: 1, endTime: 1 });
`;

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/resources',
    category: 'Resources',
    description: 'Retrieve all campus resources with real-time occupancy status and capability filter tags',
    authRoles: ['Admin', 'HOD', 'Faculty', 'Student'],
    responseBody: `{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "res-lt-101",
      "code": "LT-101",
      "name": "Aryabhata Lecture Theatre",
      "category": "Classroom",
      "capacity": 120,
      "status": "Occupied",
      "features": ["4K Laser Projector", "Acoustic Surround"]
    }
  ]
}`,
    statusCodes: [200, 401],
  },
  {
    method: 'GET',
    path: '/api/v1/resources/:id/availability',
    category: 'Resources',
    description: 'Get granular time-slot availability matrix for a specific resource on a given date',
    authRoles: ['Admin', 'HOD', 'Faculty', 'Student'],
    responseBody: `{
  "resourceId": "res-lt-101",
  "date": "2026-10-09",
  "slots": [
    { "slot": "08:30-10:00", "available": true },
    { "slot": "10:30-12:00", "available": false, "bookedBy": "Dr. Sarah Chen" },
    { "slot": "14:00-15:30", "available": true }
  ]
}`,
    statusCodes: [200, 404],
  },
  {
    method: 'POST',
    path: '/api/v1/bookings',
    category: 'Bookings',
    description: 'Create a new resource reservation. Atomic clash check prevents duplicate booking',
    authRoles: ['Admin', 'HOD', 'Faculty', 'Student'],
    requestBody: `{
  "resourceId": "res-cr-305",
  "date": "2026-10-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "purpose": "ACM Student Chapter Hackathon Mentorship",
  "priority": "Medium",
  "expectedAttendance": 45
}`,
    responseBody: `{
  "success": true,
  "booking": {
    "id": "bk-9941",
    "status": "Pending",
    "resourceName": "Ada Lovelace Smart Classroom (CR-305)",
    "requestedAt": "2026-10-09T10:45:00Z"
  }
}`,
    statusCodes: [201, 400, 409],
  },
  {
    method: 'PATCH',
    path: '/api/v1/bookings/:id/status',
    category: 'Bookings',
    description: 'Approve, Reject, or Cancel a pending resource booking request',
    authRoles: ['Admin', 'HOD'],
    requestBody: `{
  "status": "Approved",
  "comments": "Approved for departmental tech symposium"
}`,
    responseBody: `{
  "success": true,
  "bookingId": "bk-1003",
  "newStatus": "Approved",
  "approvedBy": "Prof. Elena Rostova"
}`,
    statusCodes: [200, 403, 404, 409],
  },
  {
    method: 'POST',
    path: '/api/v1/timetable/solve',
    category: 'Timetable AI',
    description: 'Run CSP & Greedy room allocation algorithm to generate non-conflicting weekly schedule',
    authRoles: ['Admin', 'HOD'],
    requestBody: `{
  "courses": [ ... ],
  "availableRooms": [ ... ],
  "teacherConstraints": [ ... ]
}`,
    responseBody: `{
  "status": "success",
  "totalScheduled": 24,
  "conflictsResolved": 6,
  "utilizationRatePct": 84.5,
  "schedule": [ ... ]
}`,
    statusCodes: [200, 422],
  },
  {
    method: 'GET',
    path: '/api/v1/budgets/:departmentId',
    category: 'Budgets',
    description: 'Fetch departmental budget ledger, categorized expenses, and remaining allocation',
    authRoles: ['Admin', 'HOD'],
    responseBody: `{
  "departmentId": "dept-cs",
  "fiscalYear": "FY 2026-27",
  "totalAllocated": 240000,
  "spent": 168400,
  "pendingCommitments": 24500,
  "utilizationPct": 70.17
}`,
    statusCodes: [200, 403],
  },
];

export const ROADMAP_SPRINTS: SprintPlan[] = [
  {
    sprintNumber: 1,
    title: 'Core Foundation, Auth, & RBAC Multi-Tenancy',
    duration: 'Sprint 1 (Weeks 1-2)',
    goal: 'Establish PostgreSQL schema, JWT authentication, and Role-Based Access Control (Admin/HOD/Faculty/Student).',
    stories: [
      {
        title: 'Database & ORM Setup (PostgreSQL + Drizzle/Prisma)',
        points: 8,
        tasks: ['Deploy PostgreSQL schema with constraints', 'Configure btree_gist extension for tsrange exclusion', 'Setup database migrations & seeds'],
        acceptanceCriteria: ['Users and Resources tables created', 'Indexes on resource_id and timestamps active'],
      },
      {
        title: 'Authentication & Role-Based Guard Middleware',
        points: 5,
        tasks: ['Implement JWT access/refresh token rotation', 'Create role verification middleware for routes', 'Build login & profile components'],
        acceptanceCriteria: ['Admin, HOD, Faculty, Student roles enforced on protected endpoints'],
      },
      {
        title: 'Resource Catalog & Inventory Registry CRUD',
        points: 5,
        tasks: ['Create resource CRUD endpoints', 'Support filter by category, building, and capacity', 'Seed campus room directory'],
        acceptanceCriteria: ['Admins can add/edit rooms and mark equipment status'],
      },
    ],
  },
  {
    sprintNumber: 2,
    title: 'Booking Engine & Anti-Double-Booking Guard',
    duration: 'Sprint 2 (Weeks 3-4)',
    goal: 'Deliver responsive booking UI, time slot reservation pipeline, and automated conflict rejection.',
    stories: [
      {
        title: 'Atomic Conflict Detection & Exclusion Constraints',
        points: 8,
        tasks: ['Implement PL/pgSQL fn_prevent_booking_overlap trigger', 'Handle PostgreSQL exclusion violation error (23P01)', 'Write unit tests for edge-case overlapping time intervals'],
        acceptanceCriteria: ['Zero duplicate bookings possible even under concurrent requests'],
      },
      {
        title: 'Interactive Room Availability Grid & Quick Booking Modal',
        points: 8,
        tasks: ['Build interactive time slot matrix', 'Create Quick Request Resource modal with validation', 'Add building and floor filtering chips'],
        acceptanceCriteria: ['User can visually see occupied vs available slots and book in under 3 clicks'],
      },
      {
        title: 'Approval Pipeline & Notification Dispatcher',
        points: 5,
        tasks: ['HOD approval queue for priority requests', 'In-app notifications when request is approved/rejected', 'Cancellation workflow'],
        acceptanceCriteria: ['HODs can approve/reject with custom comments'],
      },
    ],
  },
  {
    sprintNumber: 3,
    title: 'Smart Timetable Solver & Department Budget Ledger',
    duration: 'Sprint 3 (Weeks 5-6)',
    goal: 'Implement automated CSP/Greedy schedule generator and fiscal budget tracking with expenditure audits.',
    stories: [
      {
        title: 'Automated Timetable Allocation Engine (CSP / MRV Heuristic)',
        points: 13,
        tasks: ['Develop greedy constraint solver in Node.js/Python', 'Implement teacher availability matrix check', 'Best-fit room matching to minimize empty seat waste', 'JSON schedule export'],
        acceptanceCriteria: ['Generates clash-free weekly schedule across 50+ classes in < 500ms'],
      },
      {
        title: 'Department Budget Visualizer & Expense Tracking',
        points: 8,
        tasks: ['Build budget consumption progress bars', 'Expense categorization (Hardware, AV, Subscriptions)', 'Budget commitment locks on equipment approvals'],
        acceptanceCriteria: ['Warns HOD when departmental spend exceeds 80% threshold'],
      },
    ],
  },
  {
    sprintNumber: 4,
    title: 'Inventory Lifecycle, Analytics Heatmaps, & Production Hardening',
    duration: 'Sprint 4 (Weeks 7-8)',
    goal: 'Complete asset lifecycle tracking, room utilization heatmaps, audit logging, and PWA responsiveness.',
    stories: [
      {
        title: 'Asset Checkout, Maintenance Schedules, & Software Licenses',
        points: 5,
        tasks: ['Equipment check-in/check-out workflow', 'Track asset condition (Optimal/Fair/Maintenance)', 'Software license concurrent pool monitoring'],
        acceptanceCriteria: ['Inventory counts decrement and increment accurately upon checkout'],
      },
      {
        title: 'Campus Resource Analytics & Utilization Heatmaps',
        points: 5,
        tasks: ['Aggregate peak utilization hours', 'Export reports in CSV and formatted PDF', 'Departmental resource consumption graphs'],
        acceptanceCriteria: ['Admins can identify underutilized lecture halls and peak bottleneck hours'],
      },
      {
        title: 'End-to-End Hardening & Security Audit',
        points: 5,
        tasks: ['Rate-limiting on reservation endpoints', 'WCAG AA accessibility validation', 'Comprehensive Lighthouse optimization'],
        acceptanceCriteria: ['API load test passes 1,000 req/sec; zero accessibility violations'],
      },
    ],
  },
];

export const FRONTEND_ARCHITECTURE_SPEC = {
  stateManagement: `// Zustand Store Architecture for ERAS (React / Next.js)
// State slices separated by concern with optimistic UI updates

interface ErasStore {
  // User Session Slice
  currentUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;

  // Resources Slice
  resources: Resource[];
  selectedResource: Resource | null;
  filterBuilding: string;
  filterCategory: string;
  setFilterBuilding: (b: string) => void;
  
  // Bookings Slice (Optimistic updates)
  bookings: Booking[];
  addBooking: (newBooking: Booking) => Promise<{ success: boolean; error?: string }>;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  
  // Timetable State
  solverResult: SolverResult | null;
  runAutoScheduler: () => void;
  
  // UI States
  isRequestModalOpen: boolean;
  openRequestModal: (preselectedRoomId?: string) => void;
  closeRequestModal: () => void;
  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
}`,
  routingStructure: `// App Router / Page Directory Hierarchy
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                // Responsive sidebar + TopBar + Role Context
│   │   ├── page.tsx                  // Overview Dashboard + KPI cards + Live Room Grid
│   │   ├── bookings/
│   │   │   ├── page.tsx              // Resource Matrix & Calendar View
│   │   │   └── [id]/page.tsx         // Detailed Reservation View
│   │   ├── timetable/
│   │   │   └── page.tsx              // Interactive Weekly Grid & CSP Auto-Scheduler
│   │   ├── budget/
│   │   │   └── page.tsx              // Department Ledger & HOD Approvals (RBAC: Admin, HOD)
│   │   ├── inventory/
│   │   │   └── page.tsx              // Hardware & Software License Pools
│   │   ├── reports/
│   │   │   └── page.tsx              // Utilization Heatmaps & Peak Time Analytics
│   │   └── architecture/
│   │       └── page.tsx              // System Design, ER Diagrams, SQL Schemas, Sprint Plans
│   └── api/
│       ├── v1/bookings/route.ts
│       ├── v1/resources/route.ts
│       └── v1/timetable/solve/route.ts
└── middleware.ts                     // Role-based route protection guards`,
};
