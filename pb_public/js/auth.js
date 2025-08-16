/**
 * Authentication handling for login and register pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    if (CloudStoreAPI.AuthAPI.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Initialize login form if present
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initLoginForm();
    }
    
    // Initialize register form if present
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        initRegisterForm();
    }
});

// Initialize login form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        
        if (!username || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        toggleButtonLoading(loginBtn, true);
        
        try {
            const result = await CloudStoreAPI.AuthAPI.login(username, password);
            
            if (result.success) {
                showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Network error. Please try again.', 'error');
        } finally {
            toggleButtonLoading(loginBtn, false);
        }
    });
}

// Initialize register form
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        const passwordConfirm = formData.get('passwordConfirm');
        
        if (!username || !password || !passwordConfirm) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        if (username.length < 3) {
            showNotification('Username must be at least 3 characters', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        if (password !== passwordConfirm) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        toggleButtonLoading(registerBtn, true);
        
        try {
            const result = await CloudStoreAPI.AuthAPI.register(username, password, passwordConfirm);
            
            if (result.success) {
                showNotification('Account created successfully! Please sign in.', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            toggleButtonLoading(registerBtn, false);
        }
    });
}