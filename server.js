require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(cors()); // Allow frontend to connect

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Serve static files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Sample user schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// Serve the login page on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Make sure login.html is in the same directory as server.js
});

// Serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html')); // Make sure signup.html exists in the same directory as server.js
});

// Serve the dashboard page (this will be after successful login/signup)
app.get('/dashboard', (req, res) => {
    // Here, you would typically check if the user is logged in, 
    // for example by checking a session or JWT token.
    res.sendFile(path.join(__dirname, 'dashboard.html')); // Make sure dashboard.html exists
});

// Signup Route
app.post("/signup", async (req, res) => {
    console.log("Received Signup Data:", req.body); // Debugging
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        
        // Send a JSON response to redirect the user
        res.json({ success: true, redirect: "/dashboard" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Send a JSON response to redirect the user
        res.json({ success: true, redirect: "/dashboard" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
