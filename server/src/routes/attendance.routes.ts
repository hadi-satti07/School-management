import { Router } from "express";
import { getClassAttendance, saveClassAttendance } from "../controllers/attendanceController";

const router = Router();
router.get("/", getClassAttendance);
router.post("/save", saveClassAttendance);

export default router;