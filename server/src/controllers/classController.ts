import { Request, Response } from "express"; 
import { db } from "../config/db";
import { classes, users } from "../models/schema";
import { eq, sql } from "drizzle-orm";

// 1. Get All Classes
export const getClasses = async (req: Request, res: Response) => {
  try {
    const allClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
        section: classes.section,
        classTeacher: classes.classTeacher,
        teacherSubject: classes.teacherSubject,
        roomNumber: classes.roomNumber,
        schedule: classes.schedule,
        status: classes.status,
        studentsCount: sql<number>`count(${users.id})`.mapWith(Number),
      })
      .from(classes)
      .leftJoin(
        users, 
        sql`${users.role} = 'student' AND ${users.pinCode} = (${classes.name} || '-' || ${classes.section})`
      ) 
      .groupBy(classes.id);

    return res.status(200).json(allClasses);
  } catch (error) {
    console.error("❌ FETCH CLASSES ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// 2. Create Class (FIXED OVERLOAD ERROR)
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, section, classTeacher, teacherSubject, roomNumber, schedule, status, dayOfWeek } = req.body;

    // Validation Check
    if (!name || !section || !classTeacher) {
      return res.status(400).json({ error: "Name, Section, and Class Teacher are required fields!" });
    }

    // 🌟 FIX: TypeScript overload hatane ke liye explicitly type-safe object banaya hai
    const insertValues = {
      id: `class-${Date.now()}`, // 👈 String ID generated dynamically to satisfy schema
      name: String(name),
      section: String(section),
      classTeacher: String(classTeacher),
      teacherSubject: String(teacherSubject || "General"),
      roomNumber: String(roomNumber || "N/A"),
      schedule: String(schedule || "08:00 AM - 03:00 PM"),
      status: String(status || "active"),
      studentsCount: 0,
      dayOfWeek: String(dayOfWeek || "Monday"), // 👈 Added missing required dayOfWeek field
    };

    const [newClass] = await db
      .insert(classes)
      .values(insertValues) // 👈 Ab overload matcher crash nahi hoga
      .returning();

    return res.status(201).json(newClass);
  } catch (error) {
    console.error("❌ CREATE CLASS DATABASE ERROR:", error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : error 
    });
  }
};

// 3. Update Class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ error: "Class ID is required for update operation." });
    }

    const { name, section, classTeacher, teacherSubject, roomNumber, schedule, status, dayOfWeek } = req.body;

    const [updatedClass] = await db
      .update(classes)
      .set({
        name,
        section,
        classTeacher,
        teacherSubject,
        roomNumber,
        schedule,
        status,
        dayOfWeek, // Included for structural alignment
      })
      .where(eq(classes.id, id as string)) 
      .returning();

    if (!updatedClass) {
      return res.status(404).json({ error: "Class stream not found in database." });
    }

    return res.status(200).json(updatedClass);
  } catch (error) {
    console.error("❌ UPDATE CLASS DATABASE ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// 4. Delete Class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ error: "Class ID is required for delete operation." });
    }

    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, id as string)) 
      .returning();

    if (!deletedClass) {
      return res.status(404).json({ error: "Class stream already empty or doesn't exist." });
    }

    return res.status(200).json({ message: "Class deleted successfully from database.", deletedClass });
  } catch (error) {
    console.error("❌ DELETE CLASS DATABASE ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};