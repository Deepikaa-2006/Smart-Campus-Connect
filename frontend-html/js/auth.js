/**
 * Smart Campus Connect - Authentication Controller
 * Syllabus: Unit 3 (JavaScript DOM & Events) & Unit 4 (PHP Auth Bridge)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Login Form Handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initLoginForm(loginForm);
    }

    // 2. Student Registration Form Handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        initRegisterForm(registerForm);
    }

    // 3. User Avatar and Session Display on Dashboard Pages
    initSessionDisplay();
});

function initLoginForm(form) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('roleSelect');
    const alertBox = document.getElementById('loginAlert');

    // Attach live validators
    Validators.attachLiveValidator(usernameInput, (val) => Validators.validateRequired(val, 'Username or Email'));
    Validators.attachLiveValidator(passwordInput, (val) => Validators.validateRequired(val, 'Password'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const uVal = usernameInput.value.trim();
        const pVal = passwordInput.value;
        const selectedRole = roleSelect ? roleSelect.value : 'student';

        if (!uVal || !pVal) {
            showAlert(alertBox, 'Please provide both username and password.', 'danger');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying Credentials...';

        try {
            const user = await CampusAPI.auth.login({ username: uVal, password: pVal });
            localStorage.setItem('smart_campus_user', JSON.stringify(user));
            showAlert(alertBox, `Welcome back, ${user.full_name}! Redirecting...`, 'success');

            setTimeout(() => {
                redirectByRole(user.role);
            }, 800);
        } catch (err) {
            showAlert(alertBox, err.message || 'Login failed. Check your credentials.', 'danger');
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
}

function initRegisterForm(form) {
    const usernameInput = document.getElementById('regUsername');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const fullNameInput = document.getElementById('regFullName');
    const rollNumberInput = document.getElementById('regRollNumber');
    const departmentInput = document.getElementById('regDepartment');
    const semesterInput = document.getElementById('regSemester');
    const phoneInput = document.getElementById('regPhone');
    const alertBox = document.getElementById('registerAlert');

    // Attach live validators
    const checkUsername = Validators.attachLiveValidator(usernameInput, (v) => Validators.validateUsername(v));
    const checkEmail = Validators.attachLiveValidator(emailInput, (v) => Validators.validateEmail(v));
    const checkPassword = Validators.attachLiveValidator(passwordInput, (v) => Validators.validatePassword(v, true));
    const checkName = Validators.attachLiveValidator(fullNameInput, (v) => Validators.validateName(v));
    const checkRoll = Validators.attachLiveValidator(rollNumberInput, (v) => Validators.validateRollNumber(v));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isUserValid = checkUsername();
        const isEmailValid = checkEmail();
        const isPassValid = checkPassword();
        const isNameValid = checkName();
        const isRollValid = checkRoll();

        if (!isUserValid || !isEmailValid || !isPassValid || !isNameValid || !isRollValid) {
            showAlert(alertBox, 'Please resolve the highlighted validation errors.', 'danger');
            return;
        }

        const payload = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            full_name: fullNameInput.value.trim(),
            roll_number: rollNumberInput.value.trim().toUpperCase(),
            department: departmentInput.value,
            semester: parseInt(semesterInput.value, 10),
            phone: phoneInput.value.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering Account...';

        try {
            const newUser = await CampusAPI.auth.register(payload);
            localStorage.setItem('smart_campus_user', JSON.stringify(newUser));
            showAlert(alertBox, 'Registration Successful! Redirecting to student dashboard...', 'success');

            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 1000);
        } catch (err) {
            showAlert(alertBox, err.message || 'Registration failed.', 'danger');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Student Account';
        }
    });
}

function redirectByRole(role) {
    if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else if (role === 'faculty') {
        window.location.href = 'faculty-dashboard.html';
    } else {
        window.location.href = 'student-dashboard.html';
    }
}

function initSessionDisplay() {
    const rawUser = localStorage.getItem('smart_campus_user');
    if (!rawUser) return;

    try {
        const user = JSON.parse(rawUser);
        document.querySelectorAll('.js-user-name').forEach(el => el.textContent = user.full_name);
        document.querySelectorAll('.js-user-role').forEach(el => el.textContent = user.role.toUpperCase());
        document.querySelectorAll('.js-user-email').forEach(el => el.textContent = user.email);
        document.querySelectorAll('.js-user-initials').forEach(el => {
            el.textContent = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        });

        // Logout buttons
        document.querySelectorAll('.js-logout-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await CampusAPI.auth.logout();
                localStorage.removeItem('smart_campus_user');
                window.location.href = 'login.html';
            });
        });
    } catch (e) {
        console.error('Session load error', e);
    }
}

function showAlert(container, message, type = 'info') {
    if (!container) return;
    container.className = `alert alert-${type} animate-fade-in`;
    container.textContent = message;
    container.style.display = 'block';
}

window.redirectByRole = redirectByRole;
window.initSessionDisplay = initSessionDisplay;
