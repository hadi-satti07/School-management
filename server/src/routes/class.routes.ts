import { Router } from "express";
// 🌟 Sahi tarah se saare functions curly braces mein import karein
import { getClasses, createClass, updateClass, deleteClass } from "../controllers/classController"; 
import { addTimetableSlot, deleteTimetableSlot, getTimetableData } from "../controllers/timetableController";

const router = Router();

router.get("/", getClasses);       // Line 11
router.post("/", createClass);     // Line 12 👈 Ab yeh undefined nahi hoga!
router.put("/:id", updateClass);   // Line 13
router.delete("/:id", deleteClass);
router.get("/timetable", getTimetableData);
router.post("/timetable", addTimetableSlot);
router.delete("/timetable/:id", deleteTimetableSlot); // Line 14

export default router;