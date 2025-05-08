// This is a VERY basic example and does NOT include actual API calls or security
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = this.username.value;
            const password = this.password.value;

            // In a real app, you would send this to your backend API for validation
            // For example: fetch('/api/login', { method: 'POST', body: JSON.stringify({username, password}) })
            // .then(response => response.json())
            // .then(data => { if(data.success) window.location.href = 'dashboard.html'; else loginMessage.textContent = data.message; })

            if (username === 'admin' && password === 'password') { // NEVER do this in a real app
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.style.color = 'green';
                // Store a token (e.g., JWT) in localStorage/sessionStorage
                localStorage.setItem('admin_token', 'fake_token_for_demo'); // Replace with real token
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                loginMessage.textContent = 'Invalid username or password.';
                loginMessage.style.color = 'red';
            }
        });
    }

    // Basic logout (from dashboard.html or common.js)
    window.logout = function() {
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    }

    // Basic auth check for other admin pages
    window.checkAuth = function() {
        if (!localStorage.getItem('admin_token') && !window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }
});