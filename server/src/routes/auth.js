const express = require("express");
const router = express.Router();
const { db } = require("../config/db"); 
const { users } = require("../models/schema"); 
const { eq } = require("drizzle-orm");

// 🎯 STRICT DEFAULT ADMIN CREDENTIALS
const DEFAULT_ADMIN_EMAIL = "codexhadi067@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "adminhadi@067";

// ==========================================
// 🔍 GET CURRENT USER SESSION (Dynamic Data for Layout)
// ==========================================
router.get("/me", async (req, res) => {
  const userId = req.query.id; 
  
  if (!userId) return res.status(400).json({ success: false, message: "No ID provided" });

  try {
    const userArray = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userArray[0];

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🔑 LOGIN ENDPOINT
// ==========================================
router.post("/login", async (req, res) => {
  const identifier = req.body.identifier ? req.body.identifier.trim() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  try {
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email aur Password/Pin likhna zaroori hai!" });
    }

    // 👑 1. ADMIN BYPASS
    if (identifier.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && password === DEFAULT_ADMIN_PASSWORD) {
      return res.json({
        success: true,
        role: "admin",
        user: { id: "admin-super-hadi", name: "Hadi (Admin)", email: DEFAULT_ADMIN_EMAIL }
      });
    }

    // 🗄️ 2. DB PIPELINE
    const dbUserArray = await db
      .select()
      .from(users)
      .where(eq(users.email, identifier.toLowerCase()))
      .limit(1);

    const user = dbUserArray[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Ghalat credentials!" });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Ghalat credentials!" });
    }

    return res.json({
      success: true,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subject: user.subject || ""
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 📝 SIGNUP ENDPOINT
// ==========================================
router.post("/signup", async (req, res) => {
  const { name, role, email, password } = req.body;
  try {
    if (role === "admin") {
      return res.status(403).json({ success: false, message: "Forbidden!" });
    }
    // Yahan apni DB insert logic add karo
    return res.json({ success: true, message: "User registered successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;