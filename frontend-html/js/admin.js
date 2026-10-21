/**
 * Smart Campus Connect - Administration Controller
 * Syllabus: Unit 3 (JavaScript Events & Full CRUD Operations) & Unit 4 (PHP API)
 */

document.addEventListener('DOMContentLoaded', async () => {
    initSessionDisplay();
    await loadAdminStats();
    await loadStudentsTable();
    await loadFacultyTable();
    await loadFeedbackList();

    // Tab switching if tabs are used
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) target.style.display = 'block';
        });
    });

    // Add Student Modal Setup
    const addStudentModal = document.getElementById('addStudentModal');
    const openAddStudentBtn = document.getElementById('openAddStudentModalBtn');
    const closeAddStudentBtn = document.getElementById('closeAddStudentModalBtn');
    const addStudentForm = document.getElementById('addStudentForm');

    openAddStudentBtn?.addEventListener('click', () => addStudentModal?.showModal());
    closeAddStudentBtn?.addEventListener('click', () => addStudentModal?.close());

    addStudentForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            username: document.getElementById('newStudUsername').value.trim(),
            email: document.getElementById('newStudEmail').value.trim(),
            password: document.getElementById('newStudPassword').value || 'Password@123',
            full_name: document.getElementById('newStudName').value.trim(),
            roll_number: document.getElementById('newStudRoll').value.trim().toUpperCase(),
            department: document.getElementById('newStudDept').value,
            semester: parseInt(document.getElementById('newStudSem').value, 10),
            phone: document.getElementById('newStudPhone').value.trim(),
            cgpa: parseFloat(document.getElementById('newStudCgpa').value) || 8.0
        };

        try {
            await CampusAPI.admin.addStudent(payload);
            alert('Student added successfully!');
            addStudentModal?.close();
            addStudentForm.reset();
            await loadStudentsTable();
            await loadAdminStats();
        } catch (err) {
            alert(err.message || 'Failed to add student.');
        }
    });

    // Add Faculty Modal Setup
    const addFacultyModal = document.getElementById('addFacultyModal');
    const openAddFacultyBtn = document.getElementById('openAddFacultyModalBtn');
    const closeAddFacultyBtn = document.getElementById('closeAddFacultyModalBtn');
    const addFacultyForm = document.getElementById('addFacultyForm');

    openAddFacultyBtn?.addEventListener('click', () => addFacultyModal?.showModal());
    closeAddFacultyBtn?.addEventListener('click', () => addFacultyModal?.close());

    addFacultyForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            username: document.getElementById('newFacUsername').value.trim(),
            email: document.getElementById('newFacEmail').value.trim(),
            password: document.getElementById('newFacPassword').value || 'Password@123',
            full_name: document.getElementById('newFacName').value.trim(),
            employee_id: document.getElementById('newFacEmpId').value.trim().toUpperCase(),
            department: document.getElementById('newFacDept').value,
            designation: document.getElementById('newFacDesig').value,
            phone: document.getElementById('newFacPhone').value.trim()
        };

        try {
            await CampusAPI.admin.addFaculty(payload);
            alert('Faculty member registered successfully!');
            addFacultyModal?.close();
            addFacultyForm.reset();
            await loadFacultyTable();
            await loadAdminStats();
        } catch (err) {
            alert(err.message || 'Failed to add faculty.');
        }
    });

    // Broadcast Announcement Form
    const announceForm = document.getElementById('adminAnnouncementForm');
    announceForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('announceTitle').value.trim(),
            content: document.getElementById('announceContent').value.trim(),
            target_role: document.getElementById('announceRole').value,
            priority: document.getElementById('announcePriority').value
        };

        try {
            await CampusAPI.announcements.create(payload);
            alert('Announcement broadcasted to campus!');
            announceForm.reset();
        } catch (err) {
            alert(err.message || 'Broadcast failed.');
        }
    });
});

async function loadAdminStats() {
    try {
        const stats = await CampusAPI.admin.getStats();
        setText('adminTotalStudents', stats.total_students);
        setText('adminTotalFaculty', stats.total_faculty);
        setText('adminTotalCourses', stats.total_courses);
        setText('adminTotalEvents', stats.total_events);
        setText('adminAvgAttendance', `${stats.avg_attendance}%`);
        setText('adminPendingFeedback', stats.pending_feedback);
    } catch (e) {
        console.error('Stats error:', e);
    }
}

async function loadStudentsTable() {
    const tableBody = document.getElementById('adminStudentsTableBody');
    if (!tableBody) return;

    try {
        const students = await CampusAPI.admin.getStudents();
        if (!students || students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-muted">No students found.</td></tr>';
            return;
        }

        tableBody.innerHTML = students.map(s => `
            <tr>
                <td><strong>${escapeHtml(s.roll_number)}</strong></td>
                <td>${escapeHtml(s.full_name)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td>${escapeHtml(s.department)}</td>
                <td>Sem ${s.semester}</td>
                <td><span class="badge badge-info">${parseFloat(s.cgpa || 0).toFixed(2)} CGPA</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.student_id}, '${escapeHtml(s.full_name)}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-danger">Failed to load students: ${e.message}</td></tr>`;
    }
}

async function deleteStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to permanently delete student "${studentName}"? All related attendance and submissions will be removed.`)) {
        return;
    }

    try {
        await CampusAPI.admin.deleteStudent(studentId);
        alert('Student deleted successfully.');
        await loadStudentsTable();
        await loadAdminStats();
    } catch (e) {
        alert(e.message || 'Failed to delete student.');
    }
}

async function loadFacultyTable() {
    const tableBody = document.getElementById('adminFacultyTableBody');
    if (!tableBody) return;

    try {
        const faculty = await CampusAPI.admin.getFaculty();
        if (!faculty || faculty.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-muted">No faculty members found.</td></tr>';
            return;
        }

        tableBody.innerHTML = faculty.map(f => `
            <tr>
                <td><strong>${escapeHtml(f.employee_id)}</strong></td>
                <td>${escapeHtml(f.full_name)}</td>
                <td>${escapeHtml(f.email)}</td>
                <td>${escapeHtml(f.department)}</td>
                <td>${escapeHtml(f.designation)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteFaculty(${f.faculty_id}, '${escapeHtml(f.full_name)}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load faculty: ${e.message}</td></tr>`;
    }
}

async function deleteFaculty(facultyId, facultyName) {
    if (!confirm(`Are you sure you want to delete faculty record "${facultyName}"?`)) {
        return;
    }

    try {
        await CampusAPI.admin.deleteFaculty(facultyId);
        alert('Faculty record removed.');
        await loadFacultyTable();
        await loadAdminStats();
    } catch (e) {
        alert(e.message || 'Failed to delete faculty.');
    }
}

async function loadFeedbackList() {
    const container = document.getElementById('adminFeedbackContainer');
    if (!container) return;

    try {
        const list = await CampusAPI.feedback.list('admin');
        if (!list || list.length === 0) {
            container.innerHTML = '<p class="text-muted">No feedback or grievances submitted.</p>';
            return;
        }

        container.innerHTML = list.map(item => `
            <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${item.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge badge-info">${escapeHtml(item.category)}</span>
                        <span class="badge ${item.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${item.status}</span>
                        <h4 style="margin-top: 0.35rem;">${escapeHtml(item.subject)}</h4>
                        <p style="font-size: 0.875rem; margin-top: 0.25rem;">${escapeHtml(item.message)}</p>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                            Submitted by: <strong>${escapeHtml(item.student_name)} (${escapeHtml(item.roll_number)})</strong> &nbsp;|&nbsp; Rating: ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
                        </p>
                        ${item.admin_response ? `
                            <div class="alert alert-success" style="margin-top: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.825rem;">
                                <strong>Admin Response:</strong> ${escapeHtml(item.admin_response)}
                            </div>
                        ` : ''}
                    </div>
                    <div>
                        ${item.status !== 'Resolved' ? `
                            <button class="btn btn-sm btn-primary" onclick="respondToFeedbackPrompt(${item.id})">
                                Resolve & Respond
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p class="text-danger">Failed to load feedback: ${e.message}</p>`;
    }
}

async function respondToFeedbackPrompt(feedbackId) {
    const response = prompt('Enter your resolution notes or action taken:');
    if (!response || !response.trim()) return;

    try {
        await CampusAPI.feedback.respond({
            feedback_id: feedbackId,
            admin_response: response.trim(),
            status: 'Resolved'
        });
        alert('Feedback resolved successfully!');
        await loadFeedbackList();
        await loadAdminStats();
    } catch (e) {
        alert(e.message || 'Failed to update feedback.');
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

window.deleteStudent = deleteStudent;
window.deleteFaculty = deleteFaculty;
window.respondToFeedbackPrompt = respondToFeedbackPrompt;
window.loadStudentsTable = loadStudentsTable;
window.loadFacultyTable = loadFacultyTable;
