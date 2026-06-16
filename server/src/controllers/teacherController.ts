import { Request, Response } from "express";
import { db } from "../config/db";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";

export const registerTeacher = async (req: Request, res: Response) => {
  try {
    // 🌟 ADDED: className ko body se destructure karein
    const { name, email, password, subject, className } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ error: "Name aur Subject zaroori hain!" });
    }

    const finalEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@school.com`;

    // Database check (waisa hi rahega)
    const existingUser = await db.select().from(users).where(eq(users.email, finalEmail));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // 🌟 INSERT: assignedClass ko bhi save karein
    const newTeacher = await db.insert(users).values({
      name,
      email: finalEmail,
      password: password || "123456",
      subject,
      assignedClass: className || "Not Assigned", // Yeh column tumhare table schema mein hona chahiye
      role: "teacher",
    }).returning();

    return res.status(201).json({ 
      message: "Teacher registered successfully!", 
      teacher: newTeacher[0] 
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};