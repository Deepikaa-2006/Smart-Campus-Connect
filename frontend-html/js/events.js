/**
 * Smart Campus Connect - Events Controller
 * Syllabus: Unit 3 (JavaScript Events & Interactive Filtering)
 */

document.addEventListener('DOMContentLoaded', async () => {
    initSessionDisplay();
    await loadEventsCatalog();

    // Category Filter Buttons
    document.querySelectorAll('.event-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.event-filter-btn').forEach(b => b.classList.remove('btn-primary'));
            document.querySelectorAll('.event-filter-btn').forEach(b => b.classList.add('btn-secondary'));
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            const category = btn.getAttribute('data-category');
            loadEventsCatalog(category);
        });
    });

    // Search input filtering
    document.getElementById('eventSearchInput')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.event-card-item').forEach(card => {
            const title = card.getAttribute('data-title')?.toLowerCase() || '';
            const desc = card.getAttribute('data-desc')?.toLowerCase() || '';
            if (title.includes(query) || desc.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Add Event Modal
    const addModal = document.getElementById('addEventModal');
    const openAddBtn = document.getElementById('openAddEventModalBtn');
    const closeAddBtn = document.getElementById('closeAddEventModalBtn');
    const addForm = document.getElementById('addEventForm');

    // Only show "Create Event" button if admin or faculty
    const rawUser = localStorage.getItem('smart_campus_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user && (user.role === 'admin' || user.role === 'faculty') && openAddBtn) {
        openAddBtn.style.display = 'inline-flex';
    }

    openAddBtn?.addEventListener('click', () => addModal?.showModal());
    closeAddBtn?.addEventListener('click', () => addModal?.close());

    addForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('eventTitle').value.trim(),
            category: document.getElementById('eventCategory').value,
            event_date: document.getElementById('eventDate').value,
            location: document.getElementById('eventLocation').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            max_participants: parseInt(document.getElementById('eventCapacity').value, 10) || 100
        };

        try {
            await CampusAPI.events.create(payload);
            alert('Event published successfully!');
            addModal?.close();
            addForm.reset();
            await loadEventsCatalog();
        } catch (err) {
            alert(err.message || 'Failed to create event.');
        }
    });
});

async function loadEventsCatalog(category = 'All') {
    const container = document.getElementById('eventsCatalogGrid');
    if (!container) return;

    container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Loading campus events...</p>';

    try {
        const rawUser = localStorage.getItem('smart_campus_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const studentId = user?.student_id || 1;

        const events = await CampusAPI.events.list(category);
        if (!events || events.length === 0) {
            container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No events scheduled in this category.</p>';
            return;
        }

        container.innerHTML = events.map(e => {
            const isFull = (e.registered_count || 0) >= (e.max_participants || 100);
            const isReg = Boolean(e.is_registered);

            return `
                <div class="card event-card-item interactive-hover" data-title="${escapeHtml(e.title)}" data-desc="${escapeHtml(e.description)}" style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <span class="badge badge-info">${escapeHtml(e.category)}</span>
                        <span class="badge ${isFull ? 'badge-danger' : 'badge-success'}">
                            ${e.registered_count || 0} / ${e.max_participants || 100} Registered
                        </span>
                    </div>

                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">${escapeHtml(e.title)}</h3>
                    <p style="font-size: 0.875rem; flex: 1; margin-bottom: 1rem;">${escapeHtml(e.description)}</p>

                    <div style="padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                        <div>📅 <strong>Date:</strong> ${e.event_date}</div>
                        <div>📍 <strong>Venue:</strong> ${escapeHtml(e.location)}</div>
                    </div>

                    <div style="margin-top: auto;">
                        ${isReg ? `
                            <button class="btn btn-block btn-secondary" onclick="toggleEventRegistration(${e.id}, true)">
                                ✓ Registered (Click to Cancel)
                            </button>
                        ` : (isFull ? `
                            <button class="btn btn-block btn-secondary" disabled>Event Full</button>
                        ` : `
                            <button class="btn btn-block btn-primary" onclick="toggleEventRegistration(${e.id}, false)">
                                Register Now
                            </button>
                        `)}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-danger" style="grid-column: 1/-1;">Failed to load events: ${err.message}</p>`;
    }
}

async function toggleEventRegistration(eventId, isCurrentlyRegistered) {
    const rawUser = localStorage.getItem('smart_campus_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const studentId = user?.student_id || 1;

    try {
        if (isCurrentlyRegistered) {
            await CampusAPI.events.unregister(eventId, studentId);
            alert('Registration cancelled.');
        } else {
            await CampusAPI.events.register(eventId, studentId);
            alert('Congratulations! You have registered for this event.');
        }
        await loadEventsCatalog();
    } catch (e) {
        alert(e.message || 'Action failed.');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

window.loadEventsCatalog = loadEventsCatalog;
window.toggleEventRegistration = toggleEventRegistration;
