/**
 * Smart Campus Connect - Client-Side Validation Engine
 * Syllabus: Unit 3 (JavaScript Events & Form Validation)
 * Provides real-time field validation, regex verification, and accessible error messaging.
 */

const Validators = {
    // Regex Patterns
    patterns: {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        rollNumber: /^[A-Z]{2,4}\d{4}-\d{3,4}$/i, // e.g., CS2023-001
        phone: /^[0-9+\-\s()]{10,15}$/,
        username: /^[a-zA-Z0-9_]{3,30}$/,
    },

    // Validation Rules
    validateEmail(value) {
        if (!value.trim()) return { valid: false, message: 'Email address is required.' };
        if (!this.patterns.email.test(value.trim())) return { valid: false, message: 'Please enter a valid email address (e.g., student@college.edu).' };
        return { valid: true };
    },

    validateRollNumber(value) {
        if (!value.trim()) return { valid: false, message: 'Roll number is required.' };
        if (!this.patterns.rollNumber.test(value.trim())) return { valid: false, message: 'Roll number format should be DeptYear-Number (e.g. CS2023-001).' };
        return { valid: true };
    },

    validateUsername(value) {
        if (!value.trim()) return { valid: false, message: 'Username is required.' };
        if (value.length < 3) return { valid: false, message: 'Username must be at least 3 characters.' };
        if (!this.patterns.username.test(value.trim())) return { valid: false, message: 'Only letters, numbers, and underscores allowed.' };
        return { valid: true };
    },

    validatePassword(value, isRegistration = false) {
        if (!value) return { valid: false, message: 'Password is required.' };
        if (value.length < 6) return { valid: false, message: 'Password must be at least 6 characters long.' };
        if (isRegistration && !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
            return { valid: false, message: 'Password must include both letters and numbers for security.' };
        }
        return { valid: true };
    },

    validateName(value) {
        if (!value.trim()) return { valid: false, message: 'Full name is required.' };
        if (value.trim().length < 2) return { valid: false, message: 'Full name must be at least 2 characters.' };
        return { valid: true };
    },

    validatePhone(value) {
        if (!value.trim()) return { valid: true }; // Optional field
        if (!this.patterns.phone.test(value.trim())) return { valid: false, message: 'Please enter a valid 10-digit phone number.' };
        return { valid: true };
    },

    validateRequired(value, fieldLabel = 'This field') {
        if (!value || !value.toString().trim()) return { valid: false, message: `${fieldLabel} is required.` };
        return { valid: true };
    },

    // UI Helper: Sets error state on an input element
    setError(inputElement, errorMessage) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('has-error');
        inputElement.setAttribute('aria-invalid', 'true');

        let errorEl = formGroup.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            formGroup.appendChild(errorEl);
        }
        errorEl.textContent = errorMessage;
    },

    // UI Helper: Clears error state
    clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('has-error');
        inputElement.removeAttribute('aria-invalid');
        const errorEl = formGroup.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = '';
        }
    },

    // Attach real-time validation to an input element
    attachLiveValidator(inputElement, validatorFunc) {
        const handleValidation = () => {
            const res = validatorFunc(inputElement.value);
            if (!res.valid) {
                Validators.setError(inputElement, res.message);
            } else {
                Validators.clearError(inputElement);
            }
            return res.valid;
        };

        inputElement.addEventListener('input', handleValidation);
        inputElement.addEventListener('blur', handleValidation);
        return handleValidation;
    }
};

window.Validators = Validators;
