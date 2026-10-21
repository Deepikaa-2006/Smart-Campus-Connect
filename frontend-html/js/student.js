/**
 * Smart Campus Connect - Student Dashboard Controller
 * Syllabus: Unit 3 (JavaScript DOM Manipulation, Events & Dynamic Content)
 */

document.addEventListener('DOMContentLoaded', async () => {
    initSessionDisplay();
    await loadStudentDashboard();

    // Setup assignment submission modal
    const subModal = document.getElementById('submissionModal');
    const subForm = document.getElementById('submissionForm');
    if (subModal && subForm) {
        subForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const aid = document.getElementById('modalAssignmentId').value;
            const text = document.getElementById('modalSubmissionText').value.trim();

            if (!text) {
                alert('Please enter your submission text or repository URL.');
                return;
            }

            try {
                await CampusAPI.student.submitAssignment({
                    assignment_id: aid,
                    submission_text: text
                });
                subModal.close();
                alert('Assignment submitted successfully!');
                await loadStudentDashboard();
            } catch (err) {
                alert(err.message || 'Submission failed.');
            }
        });

        document.getElementById('closeSubmissionModalBtn')?.addEventListener('click', () => {
            subModal.close();
        });
    }
});

async function loadStudentDashboard() {
    try {
        const rawUser = localStorage.getItem('smart_campus_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const studentId = user?.student_id || 1;

        const data = await CampusAPI.student.getDashboard(studentId);
        renderProfile(data.profile);
        renderAttendance(data.attendance_summary, data.subject_attendance);
        renderAssignments(data.assignments);
        renderAnnouncements(data.announcements);
        renderEvents(data.events);
    } catch (err) {
        console.error('Failed to load student dashboard:', err);
    }
}

function renderProfile(profile) {
    if (!profile) return;
    setText('studentName', profile.full_name);
    setText('studentRoll', profile.roll_number);
    setText('studentDept', profile.department);
    setText('studentSem', `Semester ${profile.semester}`);
    setText('studentCgpa', profile.cgpa ? parseFloat(profile.cgpa).toFixed(2) : '8.50');
    setText('studentEmail', profile.email);
    setText('studentPhone', profile.phone || 'Not Provided');
}

function renderAttendance(summary, subjectBreakdown) {
    if (!summary) return;
    const pct = summary.percentage || 0;
    setText('attendancePct', `${pct}%`);
    setText('attendedCount', `${summary.attended_classes || 0} / ${summary.total_classes || 0} Classes`);

    const fillEl = document.getElementById('attendanceProgressFill');
    const statusEl = document.getElementById('attendanceStatusBadge');

    if (fillEl) {
        fillEl.style.width = `${Math.min(pct, 100)}%`;
        fillEl.className = 'progress-bar-fill ' + (pct >= 75 ? 'safe' : (pct >= 65 ? 'warning' : 'danger'));
    }

    if (statusEl) {
        statusEl.textContent = summary.status || (pct >= 75 ? 'Eligible for Exams' : 'Attendance Shortage Alert');
        statusEl.className = 'badge ' + (pct >= 75 ? 'badge-success' : 'badge-danger');
    }

    // Render Subject-wise table
    const tableBody = document.getElementById('subjectAttendanceTableBody');
    if (tableBody && subjectBreakdown) {
        tableBody.innerHTML = subjectBreakdown.map(s => {
            const spct = parseFloat(s.percentage || 0);
            const badgeClass = spct >= 75 ? 'badge-success' : (spct >= 65 ? 'badge-warning' : 'badge-danger');
            return `
                <tr>
                    <td><strong>${escapeHtml(s.subject)}</strong></td>
                    <td>${s.total_lectures}</td>
                    <td>${s.attended}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span>${spct}%</span>
                            <div class="progress-bar-container" style="flex: 1; height: 6px; margin: 0;">
                                <div class="progress-bar-fill ${spct >= 75 ? 'safe' : 'danger'}" style="width: ${Math.min(spct, 100)}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge ${badgeClass}">${spct >= 75 ? 'Good' : 'Shortage'}</span></td>
                </tr>
            `;
        }).join('');
    }
}

function renderAssignments(assignments) {
    const container = document.getElementById('studentAssignmentsList');
    if (!container || !assignments) return;

    if (assignments.length === 0) {
        container.innerHTML = '<p class="text-muted">No assignments posted for your semester at this time.</p>';
        return;
    }

    container.innerHTML = assignments.map(a => {
        const isGraded = a.submission_status === 'Graded';
        const isSubmitted = a.submission_status === 'Submitted';
        const statusBadge = isGraded
            ? `<span class="badge badge-success">Graded (${a.marks_obtained}/${a.max_marks})</span>`
            : (isSubmitted
                ? `<span class="badge badge-warning">Submitted (Under Review)</span>`
                : `<span class="badge badge-danger">Pending Submission</span>`);

        return `
            <div class="card interactive-hover" style="margin-bottom: 1rem; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge badge-info" style="margin-bottom: 0.35rem;">${escapeHtml(a.subject)}</span>
                        <h4 style="margin-top: 0.25rem;">${escapeHtml(a.title)}</h4>
                        <p style="font-size: 0.875rem; margin-top: 0.35rem;">${escapeHtml(a.description)}</p>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                            📅 Due: <strong>${a.due_date}</strong> &nbsp;|&nbsp; 👨‍🏫 Faculty: ${escapeHtml(a.faculty_name || 'Department Faculty')}
                        </p>
                        ${a.feedback_remarks ? `<div class="alert alert-info" style="margin-top: 0.75rem; padding: 0.5rem 0.75rem; font-size: 0.825rem;"><strong>Teacher Feedback:</strong> ${escapeHtml(a.feedback_remarks)}</div>` : ''}
                    </div>
                    <div style="text-align: right; flex-shrink: 0; margin-left: 1rem;">
                        ${statusBadge}
                        <div style="margin-top: 0.75rem;">
                            ${!isGraded ? `
                                <button class="btn btn-sm btn-primary" onclick="openSubmissionModal(${a.assignment_id || a.id}, '${escapeHtml(a.title)}')">
                                    ${isSubmitted ? 'Resubmit' : 'Submit Work'}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAnnouncements(announcements) {
    const list = document.getElementById('studentAnnouncementsList');
    if (!list || !announcements) return;

    list.innerHTML = announcements.map(n => {
        const priorityBadge = n.priority === 'high'
            ? '<span class="badge badge-danger">Urgent</span>'
            : (n.priority === 'medium' ? '<span class="badge badge-warning">Notice</span>' : '<span class="badge badge-info">Info</span>');

        return `
            <div style="padding: 0.85rem 0; border-bottom: 1px solid var(--border);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h5 style="font-size: 0.95rem;">${escapeHtml(n.title)}</h5>
                    ${priorityBadge}
                </div>
                <p style="font-size: 0.85rem; margin-top: 0.35rem;">${escapeHtml(n.content)}</p>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
                    ${n.created_at ? n.created_at.substring(0, 10) : 'Today'}
                </span>
            </div>
        `;
    }).join('');
}

function renderEvents(events) {
    const container = document.getElementById('studentEventsList');
    if (!container || !events) return;

    container.innerHTML = events.map(e => `
        <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="badge badge-info" style="font-size: 0.7rem;">${escapeHtml(e.category)}</span>
                    <h5 style="margin-top: 0.25rem; font-size: 0.95rem;">${escapeHtml(e.title)}</h5>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">📍 ${escapeHtml(e.location)} | 🕒 ${e.event_date}</p>
                </div>
                <div>
                    ${e.is_registered ? `
                        <span class="badge badge-success">✓ Registered</span>
                    ` : `
                        <button class="btn btn-sm btn-secondary" onclick="registerForEvent(${e.id})">Register</button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

function openSubmissionModal(assignmentId, assignmentTitle) {
    const modal = document.getElementById('submissionModal');
    if (!modal) return;
    document.getElementById('modalAssignmentId').value = assignmentId;
    document.getElementById('modalAssignmentTitle').textContent = assignmentTitle;
    document.getElementById('modalSubmissionText').value = '';
    modal.showModal();
}

async function registerForEvent(eventId) {
    try {
        const rawUser = localStorage.getItem('smart_campus_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const studentId = user?.student_id || 1;

        await CampusAPI.events.register(eventId, studentId);
        alert('Registered for event successfully!');
        await loadStudentDashboard();
    } catch (e) {
        alert(e.message || 'Failed to register.');
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

window.openSubmissionModal = openSubmissionModal;
window.registerForEvent = registerForEvent;
window.loadStudentDashboard = loadStudentDashboard;
