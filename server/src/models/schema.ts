import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import crypto from "crypto";

export const users = sqliteTable("users", {
  // 🌟 FIX: Users table mein bhi UUID generation auto set kar di taake controller mein error na aaye
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),          
  email: text("email").unique().notNull(),
  phone: text("phone"),                  
  subject: text("subject"),              // Department/Subject store karne k liye
  role: text("role").notNull(),          // "admin" | "teacher" | "student"
  pinCode: text("pin_code"),             
  password: text("password"),
  fatherName: text("father_name"),
  academics: integer("academics").default(0),
  assignedClass: text("assigned_class"),
attendance: integer("attendance").default(0),
behaviour: integer("behaviour").default(0),
  isActivated: integer("is_activated", { mode: "boolean" }).default(false),
  // 🌟 BETTER PRACTICE: Live current timestamp ke liye sql keyword use karein
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()), // Isko bhi auto-generate kar diya
  title: text("title").notNull(),
  date: text("date").notNull(), 
  time: text("time").notNull(), 
  type: text("type").notNull(), 
});

export const classes = sqliteTable("classes", {
  id: text("id").primaryKey(), // ya integer agar autoIncrement hai
  name: text("name").notNull(),
  section: text("section").notNull(),
  classTeacher: text("class_teacher").notNull(),
  teacherSubject: text("teacher_subject").notNull(),
  roomNumber: text("room_number").notNull(),
  schedule: text("schedule").notNull(), // e.g., "08:00 AM - 09:00 AM"
  status: text("status").default("active"),
  studentsCount: integer("students_count").default(0),
  
  // 🌟 FIX: Yeh new column add karein timetable matrix segregation ke liye
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
});

export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),   // linked to users.id
  classId: text("class_id").notNull(),       // linked to classes.id
  date: text("date").notNull(),              // e.g., "2026-06-07"
  status: text("status").notNull(),          // "present" ya "absent"
});