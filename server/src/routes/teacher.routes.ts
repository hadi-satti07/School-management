import { Router } from "express";
import { db } from "../config/db";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";
import { registerTeacher } from "../controllers/teacherController"; 

const router = Router();

// 🔄 1. GET ALL TEACHERS (Admin Panel View)
router.get("/", async (req, res) => {
  try {
    const allTeachers = await db
      .select()
      .from(users)
      .where(eq(users.role, "teacher"));

    return res.status(200).json(allTeachers);
  } catch (error) {
    console.error("Fetch Teachers Error:", error);
    return res.status(500).json({ error: "Database se teachers nahi mil sakay" });
  }
});

// ➕ 2. REGISTER NEW TEACHER (Admin Actions)
router.post("/register", registerTeacher);

export default router;