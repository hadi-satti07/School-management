import { Request, Response } from "express";
import { db } from "../config/db";
import { users, attendance } from "../models/schema";
import { eq, and } from "drizzle-orm";

// 1. Get Students Roster with Attendance Status
export async function getClassAttendance(req: Request, res: Response) {
  try {
    const { className, section, date } = req.query;

    if (!className || !section || !date) {
      return res.status(400).json({ error: "Missing parameters: className, section, date are required." });
    }

    // Dynamic grouping match string (e.g., "Grade 10-A")
    const pinGroup = `${className}-${section}`;

    // Students list from real users database table matching target class group
    const studentsList = await db
      .select({
        id: users.id,
        rollNumber: users.id, 
        name: users.name,
        fatherName: users.fatherName, // 🌟 Fixed: Fetching actual column field directly now
      })
      .from(users)
      .where(and(eq(users.role, "student"), eq(users.pinCode, pinGroup)));

    // Fetch matching day historical telemetry logs
    const existingAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, String(date)));

    // Uniform state mapping formulation
    const roster = studentsList.map(student => {
      const record = existingAttendance.find(a => a.studentId === student.id);
      return {
        id: student.id,
        rollNumber: student.rollNumber.substring(0, 6).toUpperCase(),
        name: student.name,
        fatherName: student.fatherName || "N/A", // Safe fallback asset
        avatar: student.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2),
        isPresent: record ? record.status === "present" : true
      };
    });

    return res.status(200).json(roster);
  } catch (error) {
    console.error("❌ ATTENDANCE FETCH ERROR:", error);
    return res.status(500).json({ error: "Attendance sheet fetch execution stack crash." });
  }
}

// 2. Save/Update Register Sheet (Anti-Locking Batch Transaction Engine)
export async function saveClassAttendance(req: Request, res: Response) {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: "Invalid data format submitted." });
    }

    // 🌟 Using strict SQLite atomic transaction processing wrapper to prevent compaction drops!
    await db.transaction(async (tx) => {
      for (const rec of records) {
        const existing = await tx
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.studentId, String(rec.studentId)), 
              eq(attendance.date, String(date))
            )
          );

        if (existing.length > 0) {
          // Sync update metrics
          await tx
            .update(attendance)
            .set({ status: rec.isPresent ? "present" : "absent" })
            .where(eq(attendance.id, existing[0].id));
        } else {
          // Allocate unique entry rows safely
          await tx.insert(attendance).values({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            studentId: String(rec.studentId),
            classId: "dynamic-class-id",
            date: String(date),
            status: rec.isPresent ? "present" : "absent"
          });
        }
      }
    });

    return res.status(200).json({ success: true, message: "Register sheet safely synced." });
  } catch (error) {
    console.error("❌ ATTENDANCE SAVE ERROR:", error);
    return res.status(500).json({ error: "Failed to write database pipeline metrics." });
  }
}