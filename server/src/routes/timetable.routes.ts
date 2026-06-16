import { Router } from "express";
import { 
  getTimetableData, 
  addTimetableSlot, 
  deleteTimetableSlot 
} from "../controllers/timetableController";

const router = Router();

// 📡 GET: /api/classes/timetable
router.get("/timetable", getTimetableData);

// 📤 POST: /api/classes/timetable
router.post("/timetable", addTimetableSlot);

// 🗑️ DELETE: /api/classes/timetable/:id
router.delete("/timetable/:id", deleteTimetableSlot);

export default router;