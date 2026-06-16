import { Router } from "express";
import { getDashboardData } from "../controllers/teachdashController"; 
import { db } from "../config/db";
import { users } from "../models/schema";
import { eq, and } from "drizzle-orm"; 

const router = Router();

// 📊 1. Dashboard core metrics stats data (http://localhost:5000/api/teacher/dashboard-data)
router.get("/dashboard-data", getDashboardData);

// 👩‍🏫 2. REAL PROFILE FETCH (http://localhost:5000/api/teacher/profile/:email)
router.get("/profile/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const teacherData = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "teacher"),
          eq(users.email, email)
        )
      )
      .limit(1);

    if (teacherData.length === 0) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    return res.status(200).json({ success: true, teacher: teacherData[0] });
  } catch (error) {
    console.error("Database Teacher Sync Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;