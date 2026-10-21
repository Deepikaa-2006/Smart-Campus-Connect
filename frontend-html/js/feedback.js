/**
 * Smart Campus Connect - Feedback Controller
 * Syllabus: Unit 3 (JavaScript Events & Interactive Star Rating)
 */

let selectedRating = 5;

document.addEventListener('DOMContentLoaded', async () => {
    initSessionDisplay();
    initStarRating();
    await loadStudentFeedbackHistory();

    const form = document.getElementById('studentFeedbackForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const category = document.getElementById('fbCategory').value;
        const subject = document.getElementById('fbSubject').value.trim();
        const message = document.getElementById('fbMessage').value.trim();

        if (!subject || !message) {
            alert('Please provide both a subject and details for your grievance/suggestion.');
            return;
        }

        const rawUser = localStorage.getItem('smart_campus_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const studentId = user?.student_id || 1;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Feedback...';

        try {
            await CampusAPI.feedback.submit({
                student_id: studentId,
                category,
                subject,
                message,
                rating: selectedRating
            });

            alert('Thank you! Your feedback has been safely submitted to college administration.');
            form.reset();
            setStarRating(5);
            await loadStudentFeedbackHistory();
        } catch (err) {
            alert(err.message || 'Failed to submit feedback.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Grievance / Suggestion';
        }
    });
});

function initStarRating() {
    const stars = document.querySelectorAll('.star-rating-icon');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'), 10);
            setStarRating(val);
        });

        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.getAttribute('data-value'), 10);
            highlightStars(val);
        });

        star.addEventListener('mouseleave', () => {
            highlightStars(selectedRating);
        });
    });
}

function setStarRating(val) {
    selectedRating = val;
    highlightStars(val);
    const label = document.getElementById('starRatingLabel');
    const descriptions = ['', 'Very Poor', 'Needs Improvement', 'Average', 'Good', 'Excellent'];
    if (label) label.textContent = `${val}/5 - ${descriptions[val] || ''}`;
}

function highlightStars(val) {
    document.querySelectorAll('.star-rating-icon').forEach(star => {
        const starVal = parseInt(star.getAttribute('data-value'), 10);
        if (starVal <= val) {
            star.style.color = '#f59e0b';
        } else {
            star.style.color = '#cbd5e1';
        }
    });
}

async function loadStudentFeedbackHistory() {
    const container = document.getElementById('myFeedbackHistoryContainer');
    if (!container) return;

    try {
        const rawUser = localStorage.getItem('smart_campus_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const role = user?.role || 'student';

        const list = await CampusAPI.feedback.list(role);
        if (!list || list.length === 0) {
            container.innerHTML = '<p class="text-muted">You have not submitted any feedback yet.</p>';
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
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem;">
                            Date: ${item.created_at ? item.created_at.substring(0, 10) : 'Recent'} &nbsp;|&nbsp; Rating: ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
                        </p>
                        ${item.admin_response ? `
                            <div class="alert alert-success" style="margin-top: 0.75rem; padding: 0.5rem 0.75rem; font-size: 0.825rem;">
                                <strong>Admin Response:</strong> ${escapeHtml(item.admin_response)}
                            </div>
                        ` : '<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;"><em>Status: Under administration review</em></p>'}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p class="text-danger">Failed to load history: ${e.message}</p>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

window.loadStudentFeedbackHistory = loadStudentFeedbackHistory;
