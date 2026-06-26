const noteForm = document.getElementById('noteForm');
const noteDateInput = document.getElementById('noteDate');
const noteTitleInput = document.getElementById('noteTitle'); // Added Title Input
const noteTextInput = document.getElementById('noteText');
const notesListContainer = document.getElementById('notesList');
const filterDateInput = document.getElementById('filterDate');
const btnClearFilter = document.getElementById('btnClearFilter');
const toastContainer = document.getElementById('toastContainer'); // Added Toast Container

let allNotes = [];

// --- Toast Notification Logic ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (type === 'error') toast.classList.add('error');

    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} ${message}`;

    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Fetch & Render Logic ---
async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        if (!response.ok) throw new Error('Failed to fetch notes');

        allNotes = await response.json();
        applyFilterAndRender();
    } catch (error) {
        console.error('Error fetching notes:', error);
        showToast('Could not load entries from server.', 'error');
    }
}

function applyFilterAndRender() {
    const filterValue = filterDateInput.value;
    let filteredNotes = allNotes;

    if (filterValue) {
        filteredNotes = allNotes.filter(note => note.date === filterValue);
    }

    renderNotes(filteredNotes);
}

function renderNotes(notes) {
    notesListContainer.innerHTML = '';

    if (notes.length === 0) {
        // Updated to match the new Empty State CSS
        notesListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open fa-3x"></i>
                <p class="no-notes">No entries found. Your logs will appear here.</p>
            </div>
        `;
        return;
    }

    // Sort by newest first
    notes.sort((a, b) => new Date(b.date) - new Date(a.date));

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note-item');

        const formattedDate = new Date(note.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Inserted Title, Icons, and formatted layout
        noteElement.innerHTML = `
            <div class="note-content">
                <h3>${note.title || 'Untitled Note'}</h3>
                <span class="note-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
                <p style="white-space: pre-wrap;">${note.text}</p>
            </div>
            <button class="btn-delete" onclick="deleteNote('${note.id}')" title="Delete Entry">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        notesListContainer.appendChild(noteElement);
    });
}

// --- Event Listeners ---
filterDateInput.addEventListener('input', applyFilterAndRender);

btnClearFilter.addEventListener('click', () => {
    filterDateInput.value = '';
    applyFilterAndRender();
});

noteForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: noteDateInput.value,
                title: noteTitleInput.value, // Included Title
                text: noteTextInput.value
            })
        });

        if (response.ok) {
            noteTitleInput.value = ''; // Clear inputs
            noteTextInput.value = '';
            showToast('Entry saved successfully!');
            fetchNotes(); // Refresh list
        } else {
            throw new Error('Server returned an error');
        }
    } catch (error) {
        console.error('Error saving note:', error);
        showToast('Failed to save entry.', 'error');
    }
});

async function deleteNote(noteId) {
    // Added confirmation dialog
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Entry deleted!');
            fetchNotes();
        } else {
            throw new Error('Server returned an error');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        showToast('Failed to delete entry.', 'error');
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date automatically in the input
    const today = new Date().toISOString().split('T')[0];
    noteDateInput.value = today;

    fetchNotes();
});