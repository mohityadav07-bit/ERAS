import { Course, ConflictRecord, Resource, SolverResult, TimetableSlot } from '../types';

export const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const TIME_SLOTS = [
  '08:30 - 10:00',
  '10:15 - 11:45',
  '12:00 - 13:30',
  '14:00 - 15:30',
  '15:45 - 17:15',
];

export interface TeacherAvailability {
  teacherId: string;
  unavailableSlots: {
    day: string;
    slot: string;
  }[];
}

/**
 * Educational Resource Allocation System - Smart Timetable & Conflict Resolution Solver
 * Approach: Constraint Satisfaction Problem (CSP) with MRV (Minimum Remaining Values)
 * combined with Best-Fit Room Assignment (Greedy capacity & feature matching).
 */
export function solveTimetableAllocation(
  courses: Course[],
  rooms: Resource[],
  teacherAvailability: TeacherAvailability[] = []
): SolverResult {
  const startTime = performance.now();
  const schedule: TimetableSlot[] = [];
  const conflictLog: ConflictRecord[] = [];
  const unassignedCourses: Course[] = [];

  // Index unavailable slots for fast lookup: `${teacherId}-${day}-${slot}`
  const teacherBlacklist = new Set<string>();
  for (const ta of teacherAvailability) {
    for (const unavail of ta.unavailableSlots) {
      teacherBlacklist.add(`${ta.teacherId}-${unavail.day}-${unavail.slot}`);
    }
  }

  // Tracking occupied states to ensure zero collisions
  const occupiedRooms = new Set<string>(); // `${roomCode}-${day}-${slot}`
  const occupiedTeachers = new Set<string>(); // `${teacherName}-${day}-${slot}`
  const occupiedBatches = new Set<string>(); // `${batch}-${day}-${slot}`

  // Heuristic 1: Most Constrained Variable First (MRV)
  // Sort courses by:
  // 1. Required features length (descending)
  // 2. Student strength (descending - harder to fit in large lecture halls)
  // 3. Weekly hours (descending)
  const sortedCourses = [...courses].sort((a, b) => {
    const featureDiff = b.requiredFeatures.length - a.requiredFeatures.length;
    if (featureDiff !== 0) return featureDiff;
    return b.studentStrength - a.studentStrength;
  });

  // Filter valid educational rooms (Classrooms & Labs)
  const validRooms = rooms.filter(
    (r) => (r.category === 'Classroom' || r.category === 'Lab') && r.status !== 'Maintenance'
  );

  for (const course of sortedCourses) {
    let assigned = false;

    // Find candidate rooms that meet capacity and required features
    const candidateRooms = validRooms
      .filter((room) => {
        // Hard constraint: Capacity must be >= student strength
        if (room.capacity < course.studentStrength) return false;

        // Hard constraint: Room type suitability (Lab courses must be in Labs)
        if (course.type === 'Lab' && room.category !== 'Lab') return false;

        // Feature constraint: Room must have all required features
        const hasAllFeatures = course.requiredFeatures.every((feat) =>
          room.features.some((rf) => rf.toLowerCase().includes(feat.toLowerCase()))
        );
        return hasAllFeatures;
      })
      // Best-fit heuristic: minimize unused capacity seats (room.capacity - course.studentStrength)
      .sort((a, b) => a.capacity - b.capacity);

    if (candidateRooms.length === 0) {
      conflictLog.push({
        type: 'Capacity Exceeded',
        courseCode: course.code,
        timeSlot: 'Any',
        day: 'All Days',
        description: `No available room fits student strength (${course.studentStrength}) or required equipment [${course.requiredFeatures.join(', ')}]`,
        resolution: 'Flagged for HOD review or room upgrade splitting.',
      });
      unassignedCourses.push(course);
      continue;
    }

    // Try slot assignment across days & time slots
    slotSearch: for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        // Constraint: Teacher availability
        const teacherKey = `${course.teacherName}-${day}-${slot}`;
        const teacherUnavailKey = `${course.teacherId}-${day}-${slot}`;

        if (occupiedTeachers.has(teacherKey) || teacherBlacklist.has(teacherUnavailKey)) {
          conflictLog.push({
            type: 'Teacher Overlap',
            courseCode: course.code,
            timeSlot: slot,
            day: day,
            description: `Teacher ${course.teacherName} already booked or unavailable at ${slot}`,
            resolution: 'Slot skipped; algorithm continued search for alternative time block.',
          });
          continue;
        }

        // Constraint: Student Batch clash (same cohort cannot have two classes at once)
        const batchKey = `${course.batch}-${day}-${slot}`;
        if (occupiedBatches.has(batchKey)) {
          continue;
        }

        // Find the first candidate room not occupied in this day/slot
        for (const room of candidateRooms) {
          const roomKey = `${room.code}-${day}-${slot}`;
          if (occupiedRooms.has(roomKey)) {
            conflictLog.push({
              type: 'Double Booking',
              courseCode: course.code,
              timeSlot: slot,
              day: day,
              description: `Collision avoided: ${room.name} (${room.code}) already allocated`,
              resolution: 'Prevented overlapping assignment via constraint satisfaction check.',
            });
            continue;
          }

          // Feasible assignment found!
          occupiedRooms.add(roomKey);
          occupiedTeachers.add(teacherKey);
          occupiedBatches.add(batchKey);

          schedule.push({
            day,
            timeSlot: slot,
            courseCode: course.code,
            courseTitle: course.title,
            teacherName: course.teacherName,
            roomCode: room.code,
            roomName: room.name,
            batch: course.batch,
            studentStrength: course.studentStrength,
            capacity: room.capacity,
          });

          assigned = true;
          break slotSearch;
        }
      }
    }

    if (!assigned) {
      unassignedCourses.push(course);
      conflictLog.push({
        type: 'Double Booking',
        courseCode: course.code,
        timeSlot: 'All Slots',
        day: 'All Days',
        description: `Schedule density reached saturation for batch ${course.batch} or instructor ${course.teacherName}`,
        resolution: 'Moved to unassigned pool for manual scheduling override.',
      });
    }
  }

  const endTime = performance.now();
  const totalSlotsPossible = validRooms.length * DAYS.length * TIME_SLOTS.length;
  const roomUtilizationRate = totalSlotsPossible > 0 ? (schedule.length / totalSlotsPossible) * 100 : 0;

  return {
    schedule,
    conflictsDetected: conflictLog.length,
    conflictsResolved: conflictLog.filter((c) => c.resolution.includes('avoided') || c.resolution.includes('Prevented') || c.resolution.includes('skipped')).length,
    unassignedCourses,
    conflictLog,
    roomUtilizationRate: Math.round(roomUtilizationRate * 10) / 10,
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
  };
}

/**
 * Clean, production-ready Python solution as requested in Prompt 4:
 * "Write a Python function (or Node.js service) that automatically allocates classrooms and labs
 * to courses without schedule conflicts."
 */
export const PYTHON_TIMETABLE_SOLVER_CODE = `"""
Education Resource Allocation System (ERAS)
Automated Timetable & Conflict Resolution Algorithm
Greedy + Constraint Satisfaction Problem (CSP) Formulation
"""

from typing import List, Dict, Any, Optional
import json

def generate_non_conflicting_schedule(
    courses: List[Dict[str, Any]],
    rooms: List[Dict[str, Any]],
    teacher_unavailability: Optional[Dict[str, List[Dict[str, str]]]] = None
) -> Dict[str, Any]:
    \"\"\"
    Automatically allocates classrooms and laboratories to university courses
    guaranteeing ZERO double-booking, zero teacher overlaps, and zero cohort clashes.
    
    Inputs:
        courses: List of dicts containing:
            - code: Course code (e.g., 'CS301')
            - title: Course name
            - batch: Student cohort identifier (e.g., 'CS-Year-3')
            - student_strength: Number of enrolled students (int)
            - teacher_name: Instructor full name (str)
            - type: 'Lecture' | 'Lab' | 'Seminar'
            - required_features: List of required capabilities (e.g. ['GPU', 'Projector'])
        rooms: List of dicts containing:
            - code: Room code (e.g., 'LT-101', 'LAB-204')
            - name: Human-readable name
            - category: 'Classroom' | 'Lab'
            - capacity: Seating limit (int)
            - features: List of installed hardware/features
            - is_operational: bool
        teacher_unavailability: Optional dict of teacher_name -> list of {"day": str, "slot": str}

    Output:
        JSON structure with:
            - schedule: Array of confirmed allocations
            - unassigned: Array of courses needing manual intervention
            - metrics: Execution stats and room utilization
    \"\"\"
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    time_slots = [
        "08:30 - 10:00",
        "10:15 - 11:45",
        "12:00 - 13:30",
        "14:00 - 15:30",
        "15:45 - 17:15"
    ]
    
    teacher_unavailability = teacher_unavailability or {}

    # State tracking sets for O(1) collision detection
    occupied_rooms = set()     # format: (room_code, day, slot)
    occupied_teachers = set()  # format: (teacher_name, day, slot)
    occupied_batches = set()   # format: (batch, day, slot)

    schedule = []
    unassigned = []
    conflict_resolution_log = []

    # Heuristic: Most Constrained Variable First (MRV)
    # 1. More required equipment features first
    # 2. Higher student strength first (hardest to fit into large rooms)
    sorted_courses = sorted(
        courses,
        key=lambda c: (len(c.get("required_features", [])), c.get("student_strength", 0)),
        reverse=True
    )

    # Filter operational rooms
    operational_rooms = [r for r in rooms if r.get("is_operational", True)]

    for course in sorted_courses:
        assigned = False
        course_code = course["code"]
        teacher = course["teacher_name"]
        batch = course["batch"]
        strength = course["student_strength"]
        course_type = course.get("type", "Lecture")
        required_features = set(f.lower() for f in course.get("required_features", []))

        # Filter candidate rooms: Capacity + Type + Feature requirements
        candidate_rooms = []
        for r in operational_rooms:
            # Hard constraint: Seating capacity
            if r["capacity"] < strength:
                continue
            # Hard constraint: Lab requirement
            if course_type == "Lab" and r.get("category") != "Lab":
                continue
            # Hard constraint: Features
            room_features = set(f.lower() for f in r.get("features", []))
            if not required_features.issubset(room_features):
                continue
            candidate_rooms.append(r)

        # Best-Fit Heuristic: Sort rooms by minimum seating waste
        candidate_rooms.sort(key=lambda r: r["capacity"] - strength)

        if not candidate_rooms:
            unassigned.append({
                "course": course,
                "reason": f"No operational room satisfies capacity {strength} and features {list(required_features)}"
            })
            continue

        # Search search space: Days x Time Slots
        for day in days:
            if assigned:
                break
            for slot in time_slots:
                # 1. Constraint Check: Teacher already booked or marked unavailable
                teacher_clash = (teacher, day, slot) in occupied_teachers
                teacher_blocked = any(
                    u.get("day") == day and u.get("slot") == slot 
                    for u in teacher_unavailability.get(teacher, [])
                )
                if teacher_clash or teacher_blocked:
                    continue

                # 2. Constraint Check: Student batch/cohort clash
                if (batch, day, slot) in occupied_batches:
                    continue

                # 3. Find first free candidate room in this slot
                for room in candidate_rooms:
                    room_key = (room["code"], day, slot)
                    if room_key in occupied_rooms:
                        continue

                    # Feasible slot found! Assign and lock state
                    occupied_rooms.add(room_key)
                    occupied_teachers.add((teacher, day, slot))
                    occupied_batches.add((batch, day, slot))

                    schedule.append({
                        "day": day,
                        "time_slot": slot,
                        "course_code": course_code,
                        "course_title": course.get("title", ""),
                        "teacher_name": teacher,
                        "batch": batch,
                        "room_code": room["code"],
                        "room_name": room["name"],
                        "student_strength": strength,
                        "room_capacity": room["capacity"],
                        "seat_utilization_pct": round((strength / room["capacity"]) * 100, 1)
                    })
                    assigned = True
                    break

        if not assigned:
            unassigned.append({
                "course": course,
                "reason": "All matching time-room combinations have conflicting dependencies."
            })

    total_possible_slots = len(operational_rooms) * len(days) * len(time_slots)
    utilization_rate = round((len(schedule) / max(1, total_possible_slots)) * 100, 2)

    return {
        "status": "success",
        "total_scheduled": len(schedule),
        "total_unassigned": len(unassigned),
        "room_utilization_rate_pct": utilization_rate,
        "schedule": schedule,
        "unassigned_courses": unassigned
    }

# Example Usage:
if __name__ == "__main__":
    sample_rooms = [
        {"code": "LT-101", "name": "Aryabhata Hall", "category": "Classroom", "capacity": 120, "features": ["projector", "mic"], "is_operational": True},
        {"code": "LAB-204", "name": "Turing AI Lab", "category": "Lab", "capacity": 45, "features": ["gpu", "projector"], "is_operational": True},
        {"code": "CR-305", "name": "Lovelace Hall", "category": "Classroom", "capacity": 60, "features": ["projector"], "is_operational": True}
    ]
    sample_courses = [
        {"code": "CS301", "title": "OS", "batch": "CS-3A", "student_strength": 100, "teacher_name": "Dr. Chen", "type": "Lecture", "required_features": ["projector"]},
        {"code": "AI402", "title": "Deep Learning", "batch": "CS-4AI", "student_strength": 40, "teacher_name": "Prof. Vance", "type": "Lab", "required_features": ["gpu"]}
    ]
    result = generate_non_conflicting_schedule(sample_courses, sample_rooms)
    print(json.dumps(result, indent=2))
`;
