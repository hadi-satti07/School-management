import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import dashboardRoutes from "./routes/dashboard.routes"
import teachdashRoutes from './routes/teachdash.route'
import classRoutes from "./routes/class.routes"; // 👈 Yeh line top par add karein


dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Frontend port permission
app.use(express.json());

// Main Routes Prefix
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teacher", teachdashRoutes);
// Aapki main server file mein prefixes is tarah hone chahiye:
   // teachdash.routes.ts (Teacher dashboard ke liye)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 [Server]: Running smoothly on http://localhost:${PORT}`);
});