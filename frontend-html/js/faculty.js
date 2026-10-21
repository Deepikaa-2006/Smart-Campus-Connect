/**
 * Smart Campus Connect - Faculty Dashboard Controller
 * Syllabus: Unit 3 (JavaScript Events & Attendance Marker) & Unit 4 (PHP API)
 */

document.addEventListener('DOMContentLoaded', async () => {
    initSessionDisplay();
    await loadRoster();
    await loadAssignmentsList();

    // Subject/Date change triggers
    document.getElementById('attDeptSelect')?.addEventListener('change', loadRoster);
    document.getElementById('attSemSelect')?.addEventListener('change', loadRoster);

    // Mark All Present Shortcut
    document.getElementById('markAllPresentBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.attendance-radio[value="Present"]').forEach(r => r.checked = true);
    });

    // Save Attendance Batch
    document.getElementById('saveAttendanceBtn')?.addEventListener('click', saveAttendanceBatch);

    // New Assignment Form Modal
    const createAssignModal = document.getElementById('createAssignmentModal');
    const openCreateAssignBtn = document.getElementById('openCreateAssignmentBtn');
    const closeCreateAssignBtn = document.getElementById('closeCreateAssignModalBtn');
    const createAssignForm = document.getElementById('createAssignmentForm');

    openCreateAssignBtn?.addEventListener('click', () => createAssignModal?.showModal());
    closeCreateAssignBtn?.addEventListener('click', () => createAssignModal?.close());

    createAssignForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            subject: document.getElementById('assignSubject').value,
            title: document.getElementById('assignTitle').value.trim(),
            description: document.getElementById('assignDescription').value.trim(),
            due_date: document.getElementById('assignDueDate').value,
            max_marks: parseInt(document.getElementById('assignMaxMarks').value, 10) || 100
        };

        try {
            await CampusAPI.assignments.create(payload);
            alert('Assignment posted successfully!');
            createAssignModal?.close();
            createAssignForm.reset();
            await loadAssignmentsList();
        } catch (err) {
            alert(err.message || 'Failed to create assignment.');
        }
    });

    // Grading Modal Setup
    const gradingModal = document.getElementById('gradingModal');
    const gradingForm = document.getElementById('gradingForm');
    document.getElementById('closeGradingModalBtn')?.addEventListener('click', () => gradingModal?.close());

    gradingForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subId = document.getElementById('modalGradingSubId').value;
        const marks = document.getElementById('modalGradingMarks').value;
        const remarks = document.getElementById('modalGradingRemarks').value.trim();

        try {
            await CampusAPI.assignments.grade({
                submission_id: parseInt(subId, 10),
                marks_obtained: parseInt(marks, 10),
                feedback_remarks: remarks
            });
            alert('Grade and remarks saved successfully!');
            gradingModal?.close();
            const currentAid = document.getElementById('modalGradingAssignId').value;
            if (currentAid) {
                viewSubmissions(parseInt(currentAid, 10));
            }
        } catch (err) {
            alert(err.message || 'Failed to save grade.');
        }
    });
});

async function loadRoster() {
    const tableBody = document.getElementById('attendanceRosterTableBody');
    if (!tableBody) return;

    const dept = document.getElementById('attDeptSelect')?.value || 'Computer Science & Engineering';
    const sem = document.getElementById('attSemSelect')?.value || 6;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading student roster...</td></tr>';

    try {
        const students = await CampusAPI.attendance.getRoster(dept, sem);
        if (!students || students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-muted">No students enrolled for this semester.</td></tr>';
            return;
        }

        tableBody.innerHTML = students.map((s, idx) => `
            <tr data-student-id="${s.student_id}">
                <td>${idx + 1}</td>
                <td><strong>${escapeHtml(s.roll_number)}</strong></td>
                <td>${escapeHtml(s.full_name)}</td>
                <td>
                    <div style="display: flex; gap: 1rem;">
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
                            <input type="radio" class="attendance-radio" name="att_status_${s.student_id}" value="Present" checked>
                            <span class="text-success font-semibold">Present</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
                            <input type="radio" class="attendance-radio" name="att_status_${s.student_id}" value="Absent">
                            <span class="text-danger font-semibold">Absent</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
                            <input type="radio" class="attendance-radio" name="att_status_${s.student_id}" value="Late">
                            <span class="text-warning font-semibold">Late</span>
                        </label>
                    </div>
                </td>
                <td>
                    <input type="text" class="form-input form-input-sm attendance-remarks" placeholder="Optional notes" style="padding: 0.25rem 0.5rem; font-size: 0.825rem;">
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load roster: ${e.message}</td></tr>`;
    }
}

async function saveAttendanceBatch() {
    const subject = document.getElementById('attSubjectInput')?.value.trim();
    const date = document.getElementById('attDateInput')?.value;

    if (!subject) {
        alert('Please specify the subject/course name.');
        return;
    }
    if (!date) {
        alert('Please select an attendance date.');
        return;
    }

    const rows = document.querySelectorAll('#attendanceRosterTableBody tr[data-student-id]');
    const records = [];

    rows.forEach(r => {
        const sid = parseInt(r.getAttribute('data-student-id'), 10);
        const checkedRadio = r.querySelector('.attendance-radio:checked');
        const status = checkedRadio ? checkedRadio.value : 'Present';
        const remarks = r.querySelector('.attendance-remarks')?.value.trim() || '';

        records.push({ student_id: sid, status, remarks });
    });

    if (records.length === 0) {
        alert('No students in roster to save.');
        return;
    }

    const saveBtn = document.getElementById('saveAttendanceBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving Attendance...';

    try {
        const res = await CampusAPI.attendance.mark({
            subject,
            attendance_date: date,
            records
        });
        alert(`Success: ${res.records_saved} attendance records saved for ${subject}!`);
    } catch (e) {
        alert(e.message || 'Failed to save attendance.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Attendance';
    }
}

async function loadAssignmentsList() {
    const container = document.getElementById('facultyAssignmentsContainer');
    if (!container) return;

    try {
        const assignments = await CampusAPI.assignments.list();
        if (!assignments || assignments.length === 0) {
            container.innerHTML = '<p class="text-muted">No assignments created yet. Click "Create Assignment" above.</p>';
            return;
        }

        container.innerHTML = assignments.map(a => `
            <div class="card interactive-hover" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge badge-info">${escapeHtml(a.subject)}</span>
                        <h4 style="margin-top: 0.35rem;">${escapeHtml(a.title)}</h4>
                        <p style="font-size: 0.85rem; margin-top: 0.25rem;">${escapeHtml(a.description)}</p>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                            📅 Due Date: <strong>${a.due_date}</strong> &nbsp;|&nbsp; Max Marks: <strong>${a.max_marks}</strong>
                        </p>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                        <span class="badge badge-warning">${a.total_submissions || 0} Submissions</span>
                        <div style="margin-top: 0.75rem;">
                            <button class="btn btn-sm btn-secondary" onclick="viewSubmissions(${a.id}, '${escapeHtml(a.title)}')">
                                Review Submissions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p class="text-danger">Failed to load assignments: ${e.message}</p>`;
    }
}

async function viewSubmissions(assignmentId, assignmentTitle = 'Assignment Submissions') {
    const modal = document.getElementById('submissionsViewerModal');
    const tableBody = document.getElementById('submissionsTableBody');
    if (!modal || !tableBody) return;

    document.getElementById('modalSubmissionsTitle').textContent = assignmentTitle;
    document.getElementById('modalGradingAssignId').value = assignmentId;
    tableBody.innerHTML = '<tr><td colspan="5">Loading student submissions...</td></tr>';
    modal.showModal();

    try {
        const submissions = await CampusAPI.assignments.getSubmissions(assignmentId);
        if (!submissions || submissions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-muted">No students have submitted this assignment yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = submissions.map(s => `
            <tr>
                <td><strong>${escapeHtml(s.roll_number)}</strong></td>
                <td>${escapeHtml(s.student_name)}</td>
                <td style="max-width: 250px; word-break: break-all; font-size: 0.8rem;">
                    ${escapeHtml(s.submission_text)}
                </td>
                <td>
                    <span class="badge ${s.status === 'Graded' ? 'badge-success' : 'badge-warning'}">
                        ${s.status} ${s.marks_obtained !== null ? `(${s.marks_obtained})` : ''}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openGradingModal(${s.submission_id}, '${escapeHtml(s.student_name)}', ${s.marks_obtained || 0}, '${escapeHtml(s.feedback_remarks || '')}', ${assignmentId})">
                        ${s.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load submissions: ${e.message}</td></tr>`;
    }
}

function openGradingModal(submissionId, studentName, marks, remarks, assignmentId) {
    const modal = document.getElementById('gradingModal');
    if (!modal) return;
    document.getElementById('modalGradingSubId').value = submissionId;
    document.getElementById('modalGradingAssignId').value = assignmentId;
    document.getElementById('modalGradingStudentName').textContent = studentName;
    document.getElementById('modalGradingMarks').value = marks || '';
    document.getElementById('modalGradingRemarks').value = remarks || '';
    modal.showModal();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

window.loadRoster = loadRoster;
window.saveAttendanceBatch = saveAttendanceBatch;
window.viewSubmissions = viewSubmissions;
window.openGradingModal = openGradingModal;
