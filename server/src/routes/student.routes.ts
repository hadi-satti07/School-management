import { Router } from "express";
import { db } from "../config/db";
import { users } from "../models/schema";
import { eq, and } from "drizzle-orm";
import { enrollStudent, updateStudent } from "../controllers/studentController";

const router = Router();

// 🔄 1. GET ALL STUDENTS
router.get("/", async (req, res) => {
  try {
    const allStudents = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"));

    return res.status(200).json(allStudents);
  } catch (error) {
    console.error("Fetch Students Error:", error);
    return res.status(500).json({ error: "Database se students nahi mil sakay" });
  }
});

// 👩‍🏫 2. GET STUDENTS BY CLASS
router.get("/class/:classLabel", async (req, res) => {
  const { classLabel } = req.params;
  try {
    const classStudents = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "student"),
          eq(users.subject, classLabel) 
        )
      );

    const formattedStudents = classStudents.map((s) => {
      const academicsVal = s.academics ?? 0;
      const attendanceVal = s.attendance ?? 0;
      const behaviourVal = s.behaviour ?? 0;
      
      const avg = (academicsVal + attendanceVal) / 2;
      let status: "Excellent" | "Average" | "Needs Attention" = "Average";
      if (avg >= 85) status = "Excellent";
      else if (avg >= 60) status = "Average";

      return {
        id: s.id,
        rollNumber: s.phone || "N/A", 
        name: s.name,
        guardianName: s.fatherName || "N/A",
        contact: s.email || "N/A", 
        progress: { academics: academicsVal, attendance: attendanceVal, behaviour: behaviourVal },
        overallStatus: status
      };
    });

    return res.status(200).json({ success: true, students: formattedStudents });
  } catch (error) {
    console.error("Teacher Class Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Class roster matrix fetch failed" });
  }
});

// ➕ 3. ENROLL NEW STUDENT
router.post("/enroll", enrollStudent);

// 📝 4. UPDATE EXISTING STUDENT PROFILE (FIXED MISSING ROUTE)
router.put("/:id", updateStudent);

// 🗑️ 5. DELETE STUDENT PROFILE FROM LEDGER (Supports frontend delete method)
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id as string; // 🌟 FIX HERE TOO
    await db.delete(users).where(eq(users.id, id));
    return res.status(200).json({ message: "Student securely removed from systems." });
  } catch (error) {
    console.error("Delete Endpoint Error:", error);
    return res.status(500).json({ error: "Failed to delete student statement." });
  }
});

export default router;