import { Request, Response } from "express";
import { db } from "../config/db";
import { users, events } from "../models/schema";
import { sql } from "drizzle-orm";
import crypto from "crypto";

// 1. Dashboard Stats Fetch karne ka function
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Database se Live Students Count
    const [studentsCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`role = 'student'`);
    const totalStudents = studentsCount?.count || 0;

    // 2. Database se Live Teachers Count
    const [teachersCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`role = 'teacher'`);
    const totalTeachers = teachersCount?.count || 0;

    // 3. Pending Invoices Logic (Per student $50 fee)
    const pendingInvoicesAmount = totalStudents * 50;

    // 4. Database se Live Events
    const allEvents = await db.select().from(events).all();

    // Clean response bina kisi attendance jhanjhat k
    return res.status(200).json({
      totalStudents,
      totalTeachers, 
      pendingInvoices: `$${pendingInvoicesAmount.toLocaleString()}`, 
      events: allEvents
    });
  } catch (error) {
    console.error("❌ DASHBOARD CONTROLLER ERROR:", error);
    return res.status(500).json({ error: "Failed to load dashboard sync data." });
  }
};

// 2. 🚨 YEH FUNCTION MISSING THA: Naya Event Create karne ka API Endpoint
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, date, time, type } = req.body;
    
    if (!title || !date || !time || !type) {
      return res.status(400).json({ error: "Saari fields lazmi hain!" });
    }

    const newEvent = await db.insert(events).values({
      id: crypto.randomUUID(),
      title,
      date,
      time,
      type
    }).returning();

    return res.status(201).json({ message: "Event saved successfully!", event: newEvent[0] });
  } catch (error) {
    console.error("❌ CREATE EVENT ERROR:", error);
    return res.status(500).json({ error: "Failed to create event" });
  }

  
};
// 🔄 3. Event Update/Edit karne ka endpoint
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date, time, type } = req.body;

    const updated = await db.update(events)
      .set({ title, date, time, type })
      .where(sql`id = ${id}`)
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Event nahi mila!" });
    }

    return res.status(200).json({ message: "Event update ho gaya!", event: updated[0] });
  } catch (error) {
    console.error("❌ UPDATE EVENT ERROR:", error);
    return res.status(500).json({ error: "Failed to update event" });
  }
};

// ❌ 4. Event Delete karne ka endpoint
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db.delete(events)
      .where(sql`id = ${id}`)
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Event nahi mila!" });
    }

    return res.status(200).json({ message: "Event delete ho gaya!" });
  } catch (error) {
    console.error("❌ DELETE EVENT ERROR:", error);
    return res.status(500).json({ error: "Failed to delete event" });
  }
};