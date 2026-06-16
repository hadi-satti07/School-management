import { Request, Response } from "express";
import { db } from "../config/db";
import { classes } from "../models/schema";
import { eq } from "drizzle-orm";

// 📡 1. Get Timetable Grid Mapping
export async function getTimetableData(req: Request, res: Response) {
  try {
    const data = await db.select().from(classes);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    const formattedTimetable = days.map(day => {
      return {
        day,
        slots: data
          .filter(c => c.dayOfWeek && c.dayOfWeek.toLowerCase() === day.toLowerCase())
          .map(c => {
            const timeParts = c.schedule ? c.schedule.split("-") : ["08:00 AM", "09:00 AM"];
            return {
              id: c.id.toString(),
              className: `${c.name}-${c.section}`,
              subject: c.teacherSubject,
              roomNumber: c.roomNumber,
              startTime: timeParts[0]?.trim() || "08:00 AM",
              endTime: timeParts[1]?.trim() || "09:00 AM"
            };
          })
      };
    });

    return res.status(200).json(formattedTimetable);
  } catch (error) {
    console.error("❌ TIMETABLE FETCH ERROR:", error);
    return res.status(500).json({ error: "Database se timetable grid stream nahi ho saka" });
  }
}

// 📤 2. Add New Scheduled Period
export async function addTimetableSlot(req: Request, res: Response) {
  try {
    const { className, subject, roomNumber, startTime, endTime, day } = req.body;

    let parsedName = className || "Grade 10";
    let parsedSection = "A";
    
    if (className && className.includes("-")) {
      const parts = className.split("-");
      parsedName = parts[0].trim();
      parsedSection = parts[1].trim();
    }

    // 🌟 FIX: Idhar explicit properties pass ki hain jo schema ko required hain
    const newSlot = await db.insert(classes).values({
      id: `class-${Date.now()}`, // Explicit primary key text
      name: parsedName,
      section: parsedSection,
      classTeacher: "Logged In Teacher", 
      teacherSubject: subject || "General",
      roomNumber: roomNumber || "TBD",
      schedule: `${startTime || "08:00 AM"} - ${endTime || "09:00 AM"}`,
      status: "active",
      studentsCount: 0,
      dayOfWeek: day || "Monday" // 🌟 Required property validation fixed
    }).returning();

    return res.status(201).json(newSlot[0]);
  } catch (error) {
    console.error("❌ TIMETABLE INSERT ERROR:", error);
    return res.status(500).json({ error: "Naya slot write process fail hua" });
  }
}

// 🗑️ 3. Delete Scheduled Period
export async function deleteTimetableSlot(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // 🌟 FIX: Type assertions lagayi taaki TS ko sure ho ke yeh single string hi hai
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Sahi ID param nahi mili" });
    }
    
    await db.delete(classes).where(eq(classes.id, id as string));
    
    return res.status(200).json({ message: "Slot successfully deleted from live grid" });
  } catch (error) {
    console.error("❌ TIMETABLE DELETE ERROR:", error);
    return res.status(500).json({ error: "Slot delete karne mein error aaya" });
  }
}