    import { Request, Response } from "express"; 
    import { db } from "../config/db";
    import { classes, events } from "../models/schema";
    import { sql } from "drizzle-orm";

    export async function getDashboardData(req: Request, res: Response) {
    try {
        
        // 1. Total Students ka Sum nikalna (classes table se)
    const totalStudentsResult = await db
    .select({ total: sql<number>`COALESCE(sum(${classes.studentsCount}), 0)` }) // Empty table par zero dega
    .from(classes);

    const totalStudents = totalStudentsResult[0]?.total ?? 0;

        // 2. Total active classes ka count
        const totalClassesResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(classes);
        
        const totalClasses = totalClassesResult[0]?.count || 0;

        // 3. Classes se Roadmap/Timetable ka data nikalna
        const dbClasses = await db.select().from(classes);
        
        const roadmap = dbClasses.map((c) => ({
        id: c.id,
        time: c.schedule, 
        subject: c.teacherSubject,
        class: `${c.name}-${c.section}`,
        room: c.roomNumber,
        status: c.status === "active" ? "Next Up" : "Scheduled", 
        }));

        // 4. Events table se alerts ya notifications nikalna
        const dbEvents = await db.select().from(events).limit(5);
        
        const alerts = dbEvents.map((e) => ({
        id: e.id,
        type: e.type, 
        message: `${e.title} scheduled on ${e.date}`,
        time: e.time,
        }));

        // 5. Response send karna (Express Way)
        return res.status(200).json({
        stats: {
            totalStudents: totalStudents.toString(),
            activeClasses: `${totalClasses} Classes`,
            todayLectures: `${roadmap.length} Lectures`,
            classAvgProgress: "82%", 
        },
        roadmap,
        alerts,
        });

    } catch (error) {
        // Is se server (Express) ke terminal par poora error print hoga
        console.error("❌ BACKEND CRASH LOG:", error); 
        return res.status(500).json({ error: "Database se data fetch nahi ho saka", details: error });
    }
    }