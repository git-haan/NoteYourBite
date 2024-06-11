require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utils");

app.use(express.json());
app.use(cors({origin: "*"}));

app.get("/", (req, res) => {
    res.json({ data: "hello"});
});


// Create Account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res.status(400).json({ error: true, message: "Full Name Is Required" });
    }

    if (!email) {
        return res.status(400).json({ error: true, message: "Email Is Required" });
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Password Is Required" });
    }

    const isUser = await User.findOne ({ email: email });

    if (isUser) {
        return res.status(400).json({ error: true, message: "Email Already Exists" });
    }

    const user = new User({ fullName, email, password });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "600h" });

    res.json({ error: false, user, accessToken, message: "Account Created!" });

});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: true, message: "Email Is Required" });
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Password Is Required" });
    }

    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
        return res.status(400).json({ error: true, message: "Invalid email" });
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "600h" });
        return res.json({ error: false, message: "Login Successful!", email, accessToken });
    } else {
        return res.status(400).json({ error: true, message: "Invalid Credentials!" });
    }

});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
        return res.status(400).json({ error: true, message: "User Not Found" });
    }

    return res.json({ 
        user: {
            fullName: isUser.fullName, 
            email: isUser.email, 
            "_id": isUser._id, 
            createdOn: isUser.createdOn
        }, 
        message: "" });
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title) {
        return res.status(400).json({ error: true, message: "Title Is Required" });
    }

    if (!content) {
        return res.status(400).json({ error: true, message: "Content Is Required" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        await note.save();

        return res.json({ error: false, note, message: "Note Added Successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal System Error" });
    }
});

// Edit Notes
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags) {
        return res.status(400).json({ error: true, message: "No Changes Provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(400).json({ error: true, message: "Note Not Found" });
        }

        if (title) {
            note.title = title;
        }

        if (content) {
            note.content = content;
        }

        if (tags) {
            note.tags = tags;
        }

        if (isPinned !== undefined) {
            note.isPinned = isPinned;
        }

        await note.save();

        return res.json({ error: false, note, message: "Note Updated Successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal System Error" });
    }

});

// Get Notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

        return res.json({ error: false, notes, message: "Notes Retrieved Successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal System Error" });
    }

});

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(400).json({ error: true, message: "Note Not Found" });
        }

        await Note.deleteOne({ _id: noteId, userId: user._id });

        return res.json({ error: false, message: "Note Deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal System Error" });
    }
});

// Update isPinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(400).json({ error: true, message: "Note Not Found" });
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json({ error: false, note, message: "Note Updated Successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal System Error" });
    }
});

// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: true, message: "Search Query Is Required" });
    }

    try {
        const matchingNotes = await Note.find({ userId: user._id, $or : [
            { title: { $regex: query, $options: "i" } },
            { content: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } }
        ] });

        return res.json({ error: false, notes: matchingNotes, message: "Notes Retrieved Successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal System Error" });
    }

});



app.listen(8000);

module.exports = app;