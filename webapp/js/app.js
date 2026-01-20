/**
 * Web Application JavaScript
 * Handles authentication flow and main app functionality
 */

// View elements
const views = {
    loading: document.getElementById('auth-loading'),
    login: document.getElementById('login-view'),
    register: document.getElementById('register-view'),
    main: document.getElementById('main-view')
};

// Form elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const logoutBtn = document.getElementById('logout-btn');
const userEmailEl = document.getElementById('user-email');

// View toggle links
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

/**
 * Show a specific view and hide others
 */
function showView(viewName) {
    Object.entries(views).forEach(([name, el]) => {
        if (el) {
            el.style.display = name === viewName ? '' : 'none';
        }
    });
}

/**
 * Show error message in a form
 */
function showError(errorEl, message) {
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideError(errorEl) {
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

/**
 * Update UI based on auth state
 */
function updateAuthUI() {
    if (api.isAuthenticated()) {
        const user = api.currentUser();
        if (userEmailEl && user) {
            userEmailEl.textContent = user.email;
        }
        showView('main');
    } else {
        showView('login');
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    hideError(loginError);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await api.login(email, password);
        loginForm.reset();
        updateAuthUI();
    } catch (error) {
        console.error('Login failed:', error);
        showError(loginError, error.message || 'Invalid email or password');
    }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
    e.preventDefault();
    hideError(registerError);

    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;

    if (password !== passwordConfirm) {
        showError(registerError, 'Passwords do not match');
        return;
    }

    try {
        await api.register(email, password, passwordConfirm);
        // Auto-login after registration
        await api.login(email, password);
        registerForm.reset();
        updateAuthUI();
    } catch (error) {
        console.error('Registration failed:', error);
        let message = 'Registration failed';
        if (error.data?.data?.email?.message) {
            message = error.data.data.email.message;
        } else if (error.data?.data?.password?.message) {
            message = error.data.data.password.message;
        } else if (error.message) {
            message = error.message;
        }
        showError(registerError, message);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    api.logout();
    updateAuthUI();
}

/**
 * Initialize the application
 */
function init() {
    // Set up event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideError(loginError);
            showView('register');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideError(registerError);
            showView('login');
        });
    }

    // Subscribe to auth state changes
    api.onAuthChange(() => {
        updateAuthUI();
    });

    // Initial auth check
    updateAuthUI();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
