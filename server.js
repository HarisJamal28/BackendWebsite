require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json()); // Middleware to parse JSON
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
    name: String,
    email: String,
    password: String
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
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const newUser = new User({ name, email, password });
        await newUser.save();
        // Redirect to dashboard after successful signup
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Redirect to dashboard after successful login
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
