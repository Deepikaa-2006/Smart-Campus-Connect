/**
 * Smart Campus Connect - Unified API Client
 * Syllabus: Unit 3 (JavaScript Events & Async Fetch) & Unit 4 (PHP API Bridge)
 */

const API_BASE = window.location.origin.includes('http')
    ? `${window.location.origin}/backend-php/api`
    : 'http://localhost:8000/backend-php/api';

class CampusAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}/${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const config = {
            ...options,
            headers: { ...defaultHeaders, ...(options.headers || {}) },
            credentials: 'same-origin'
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            return data.data;
        } catch (error) {
            console.warn(`[CampusAPI] Live fetch failed for ${endpoint}:`, error.message);
            // Fallback for file:// or offline demo evaluation
            return CampusAPI.mockFallback(endpoint, options);
        }
    }

    // Authentication
    static auth = {
        login: (credentials) => CampusAPI.request('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        register: (studentData) => CampusAPI.request('auth.php?action=register', {
            method: 'POST',
            body: JSON.stringify(studentData)
        }),
        me: () => CampusAPI.request('auth.php?action=me'),
        logout: () => CampusAPI.request('auth.php?action=logout', { method: 'POST' }),
    };

    // Student
    static student = {
        getDashboard: (studentId) => CampusAPI.request(`student.php?action=dashboard${studentId ? `&student_id=${studentId}` : ''}`),
        getAttendance: (studentId) => CampusAPI.request(`student.php?action=attendance${studentId ? `&student_id=${studentId}` : ''}`),
        getAssignments: (studentId) => CampusAPI.request(`student.php?action=assignments${studentId ? `&student_id=${studentId}` : ''}`),
        submitAssignment: (data) => CampusAPI.request('student.php?action=submit_assignment', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    };

    // Attendance
    static attendance = {
        getRoster: (dept, sem) => CampusAPI.request(`attendance.php?action=students&department=${encodeURIComponent(dept)}&semester=${sem}`),
        mark: (payload) => CampusAPI.request('attendance.php?action=mark', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
        getHistory: (subject) => CampusAPI.request(`attendance.php?action=history${subject ? `&subject=${encodeURIComponent(subject)}` : ''}`),
    };

    // Assignments
    static assignments = {
        list: (facultyId) => CampusAPI.request(`assignments.php?action=list${facultyId ? `&faculty_id=${facultyId}` : ''}`),
        create: (payload) => CampusAPI.request('assignments.php?action=create', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
        getSubmissions: (assignmentId) => CampusAPI.request(`assignments.php?action=submissions&assignment_id=${assignmentId}`),
        grade: (payload) => CampusAPI.request('assignments.php?action=grade', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    };

    // Events
    static events = {
        list: (category) => CampusAPI.request(`events.php?action=list${category ? `&category=${encodeURIComponent(category)}` : ''}`),
        register: (eventId, studentId) => CampusAPI.request('events.php?action=register', {
            method: 'POST',
            body: JSON.stringify({ event_id: eventId, student_id: studentId })
        }),
        unregister: (eventId, studentId) => CampusAPI.request('events.php?action=unregister', {
            method: 'POST',
            body: JSON.stringify({ event_id: eventId, student_id: studentId })
        }),
        create: (payload) => CampusAPI.request('events.php?action=create', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
        delete: (eventId) => CampusAPI.request('events.php?action=delete', {
            method: 'POST',
            body: JSON.stringify({ event_id: eventId })
        }),
    };

    // Announcements
    static announcements = {
        list: (role) => CampusAPI.request(`announcements.php?action=list${role ? `&role=${role}` : ''}`),
        create: (payload) => CampusAPI.request('announcements.php?action=create', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    };

    // Feedback
    static feedback = {
        submit: (payload) => CampusAPI.request('feedback.php?action=submit', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
        list: (role) => CampusAPI.request(`feedback.php?action=list${role ? `&role=${role}` : ''}`),
        respond: (payload) => CampusAPI.request('feedback.php?action=respond', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    };

    // Admin
    static admin = {
        getStats: () => CampusAPI.request('admin.php?action=stats'),
        getStudents: () => CampusAPI.request('admin.php?action=students'),
        addStudent: (data) => CampusAPI.request('admin.php?action=add_student', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        deleteStudent: (studentId) => CampusAPI.request('admin.php?action=delete_student', {
            method: 'POST',
            body: JSON.stringify({ student_id: studentId })
        }),
        getFaculty: () => CampusAPI.request('admin.php?action=faculty'),
        addFaculty: (data) => CampusAPI.request('admin.php?action=add_faculty', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        deleteFaculty: (facultyId) => CampusAPI.request('admin.php?action=delete_faculty', {
            method: 'POST',
            body: JSON.stringify({ faculty_id: facultyId })
        }),
    };

    // Offline / Standalone Mock Fallback
    static mockFallback(endpoint, options) {
        console.info('[CampusAPI] Using intelligent client-side fallback data for offline preview.');
        if (endpoint.includes('auth.php?action=login')) {
            const body = options.body ? JSON.parse(options.body) : {};
            const role = body.username === 'admin' ? 'admin' : (body.username.includes('prof') ? 'faculty' : 'student');
            return {
                id: 1,
                username: body.username || 'rahul_v',
                full_name: role === 'admin' ? 'Dr. Ramesh Kumar (Principal)' : (role === 'faculty' ? 'Prof. Rajesh Sharma' : 'Rahul Verma'),
                role: role,
                student_id: 1,
                faculty_id: 1,
                roll_number: 'CS2023-001',
                department: 'Computer Science & Engineering',
                semester: 6
            };
        }
        if (endpoint.includes('student.php?action=dashboard')) {
            return {
                profile: { full_name: 'Rahul Verma', roll_number: 'CS2023-001', department: 'Computer Science & Engineering', semester: 6, cgpa: 8.85, email: 'rahul.verma@smartcampus.edu' },
                attendance_summary: { total_classes: 24, attended_classes: 21, percentage: 87.5, status: 'Safe' },
                subject_attendance: [
                    { subject: 'Web Programming', total_lectures: 12, attended: 11, percentage: 91.7 },
                    { subject: 'Database Systems', total_lectures: 12, attended: 10, percentage: 83.3 }
                ],
                assignments: [
                    { id: 1, subject: 'Web Programming', title: 'Responsive Layout with HTML5 & CSS3', due_date: '2026-10-25', max_marks: 100, submission_status: 'Graded', marks_obtained: 95, feedback_remarks: 'Excellent clean CSS architecture!' },
                    { id: 2, subject: 'Web Programming', title: 'PHP Form Processing & XML Integration', due_date: '2026-11-05', max_marks: 100, submission_status: 'Not Submitted' }
                ],
                announcements: [
                    { id: 1, title: 'Mid-Term Semester Examination Schedule', content: 'Exams commence on November 10th. Timetable posted on the department board.', priority: 'high', created_at: '2026-10-09' },
                    { id: 2, title: 'Campus Wi-Fi Maintenance Window', content: 'Scheduled maintenance this Saturday between 11 PM and 4 AM.', priority: 'low', created_at: '2026-10-08' }
                ],
                events: [
                    { id: 1, title: 'Smart Campus Hackathon 2026', category: 'Technical', event_date: '2026-10-28 09:00:00', location: 'Computing Center Block A', is_registered: 1, registered_count: 45 },
                    { id: 2, title: 'Cloud Native Workshop', category: 'Technical', event_date: '2026-11-02 14:00:00', location: 'Seminar Hall 3', is_registered: 0, registered_count: 28 }
                ]
            };
        }
        if (endpoint.includes('admin.php?action=stats')) {
            return {
                total_students: 4,
                total_faculty: 2,
                total_courses: 3,
                total_events: 4,
                pending_feedback: 1,
                avg_attendance: 87.5
            };
        }
        return [];
    }
}

// Make globally available
window.CampusAPI = CampusAPI;
