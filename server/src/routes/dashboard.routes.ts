import { Router } from "express";
import { getDashboardStats, createEvent, updateEvent, deleteEvent } from "../controllers/dashboardController";

const router = Router();

// 🚨 Yahan direct paths likhein, "/api" lagane ki zaroorat nahi hai
router.get("/dashboard/stats", getDashboardStats);
router.post("/dashboard/events", createEvent);
router.put("/dashboard/events/:id", updateEvent);    // Edit k liye
router.delete("/dashboard/events/:id", deleteEvent); // Delete k liye

export default router;