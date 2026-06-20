import { Request, Response } from "express";
import { db } from "../config/db";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// ➕ ENROLL STUDENT
export const enrollStudent = async (req: Request, res: Response) => {
  try {
    // FIX: Body se seedha 'subject' nikalo jo frontend bhej raha hai
    const { name, fatherName, email, phone, subject } = req.body;

    console.log("🚀 Frontend se aya hua Student Data:", req.body);

    if (email && email.trim() !== "") {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .get();

      if (existingUser) {
        return res.status(400).json({ 
          error: `This '${email}' will also registered for this  ${existingUser.role}` 
        });
      }
    }

    const studentEmail = email && email.trim() !== "" 
      ? email.trim().toLowerCase()
      : `std-${Date.now()}-${Math.floor(Math.random() * 1000)}@school.com`;

    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
    const uniquePassword = Math.random().toString(36).slice(-6);
    const generatedId = crypto.randomUUID();

    const [newStudent] = await db.insert(users).values({
      id: generatedId,
      name: name || "Unknown Student",
      email: studentEmail,
      fatherName: fatherName || "N/A",
      phone: phone || "N/A",
      subject: subject || "Not Assigned", // FIX: Using key matching frontend
      role: "student",                          
      pinCode: pinCode,
      isActivated: false,
      password: uniquePassword,
    }).returning();

    console.log("✨ Student successfully saved in DB:", newStudent);

    return res.status(201).json({
      message: "Student Enrolled Successfully! 🎉",
      student: newStudent
    });

  } catch (error) {
    console.error("❌ STUDENT ENROLLMENT ERROR:", error);
    return res.status(500).json({ 
      error: "Failed to enroll student",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// 📝 UPDATE STUDENT PROFILE (NEW FUNCTION)
export const updateStudent = async (req: Request, res: Response) => {
  try {
    // 🌟 FIX: id ko explicitly string cast kar diya taake Drizzle error na de
    const id = req.params.id as string; 
    const { name, email, phone, subject } = req.body;

    console.log(`🚀 Updating Student ID: ${id} with Data:`, req.body);

    // Check if student exists
    const existingStudent = await db
      .select()
      .from(users)
      .where(eq(users.id, id)) // Ab TypeScript yahan complain nahi karega
      .get();

    if (!existingStudent) {
      return res.status(404).json({ error: "Student records inside systems not found." });
    }

    // Perform database mutation
    const [updatedStudent] = await db
      .update(users)
      .set({
        name: name || existingStudent.name,
        email: email ? email.trim().toLowerCase() : existingStudent.email,
        phone: phone || existingStudent.phone,
        subject: subject || existingStudent.subject, 
      })
      .where(eq(users.id, id))
      .returning();

    console.log("✨ DB Update Success:", updatedStudent);

    return res.status(200).json({
      message: "Student Profile Updated Successfully! ✨",
      student: updatedStudent
    });

  } catch (error) {
    console.error("❌ STUDENT UPDATE ERROR:", error);
    return res.status(500).json({ 
      error: "Failed to update student profile matrix",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};