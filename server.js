const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let notesDatabase = [];

// 1. GET: Fetch all notes
app.get('/api/notes', (req, res) => {
    res.json(notesDatabase);
});

// 2. POST: Create a new note
app.post('/api/notes', (req, res) => {
    // Extract title along with date and text
    const { date, title, text } = req.body;

    if (!date || !text) {
        return res.status(400).json({ error: "Date and Text are required" });
    }

    const newNote = {
        id: Date.now().toString(),
        date,
        title: title || 'Untitled Note', // Added title handling
        text
    };

    notesDatabase.push(newNote);
    res.status(201).json(newNote);
});

// 3. DELETE: Delete a specific note by ID
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = notesDatabase.length;

    notesDatabase = notesDatabase.filter(note => note.id !== id);

    // Check if the note was actually deleted
    if (notesDatabase.length < initialLength) {
        res.json({ message: "Note deleted successfully" });
    } else {
        res.status(404).json({ error: "Note not found" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});