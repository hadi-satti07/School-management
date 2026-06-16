const express = require("express");
const router = express.Router();
import { db } from "../config/db"; // 👈 Aapka Drizzle DB connection path
const { users } = require("../models/schema"); // 👈 Aapka users schema path
const { eq } = require("drizzle-orm");

// 🎯 STRICT DEFAULT ADMIN CREDENTIALS
const DEFAULT_ADMIN_EMAIL = "codexhadi067@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "adminhadi@067";

// ==========================================
// 🔑 REAL REVOLUTIONARY LOGIN ENDPOINT
// ==========================================

router.post("/url",async (req,res)=>{
  
})
router.post("/login", async (req, res) => {
  const identifier = req.body.identifier ? req.body.identifier.trim() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  try {
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email aur Password/Pin likhna zaroori hai!" });
    }

    // 👑 1. SUPER ADMIN BYPASS LAYER (Aap ka security master gate waisa hi rahega)
    if (identifier.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && password === DEFAULT_ADMIN_PASSWORD) {
      console.log("👑 Admin Hadi successfully authenticated via secure master bypass!");
      return res.json({
        success: true,
        role: "admin",
        user: {
          id: "admin-super-hadi",
          name: "Hadi (Admin)",
          email: DEFAULT_ADMIN_EMAIL
        }
      });
    }

    // 🗄️ 2. REAL DATABASE PIPELINE ENGINE (For dynamically added Teachers & Students)
    // Hum database ke user table mein search kar rahe hain jahan email input match ho
    const dbUserArray = await db
      .select()
      .from(users)
      .where(eq(users.email, identifier.toLowerCase()))
      .limit(1);

    const user = dbUserArray[0];

    // Check A: Kya yeh user database mein mila?
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Ghalat credentials! System mein koi record nahi mila." 
      });
    }

    // Check B: Password / Pin code match calculation
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: "Ghalat credentials! Password/Pin code dobara check karein." 
      });
    }

    // 🎉 SUCCESS MATRIX RESPONSE (Dynamic data delivery)
    // Ab role chahe database mein 'teacher' ho ya 'student', yeh automatic dynamic pass karega
    return res.json({
      success: true,
      role: user.role, // 'teacher' ya 'student' jo bhi database mein saved tha
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subject: user.subject || "" // Agar student ke paas subject filter lagana ho
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 📝 SIGNUP ENDPOINT (Keep as clean backup router if needed)
// ==========================================
router.post("/signup", async (req, res) => {
  const { name, role, email, password } = req.body;

  try {
    if (role === "admin" || (email && email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())) {
      return res.status(403).json({ 
        success: false, 
        message: "Action Forbidden! Naya Admin register karne ki ijazat nahi hai." 
      });
    }

    // Note: Chunki aap admin panel se teachers pehle se save kar rahay hain, 
    // isliye signup route agar use nahi ho raha to as it is default para rahe.
    return res.json({ success: true, message: "Use admin panel dashboard engine to insert records safely." });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;