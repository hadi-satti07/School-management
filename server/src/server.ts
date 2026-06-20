import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import teachdashRoutes from './routes/teachdash.route.js';
import classRoutes from "./routes/class.routes.js";

dotenv.config();

const app = express();

// --- CORS POLICY UPDATED ---
const allowedOrigins = [
  "http://localhost:3000", 
  "https://school-management-drab-nine.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// ---------------------------

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth"); // Agar ye require hai toh aise hi rehne do
app.use("/api", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teacher", teachdashRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 [Server]: Running smoothly on http://localhost:${PORT}`);
});