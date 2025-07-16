document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadNews();
    setupLoginForm();
});

function checkAuthStatus() {
    fetch('/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                window.location.href = '/dashboard';
            }
        })
        .catch(error => {
            console.log('Auth check failed:', error);
        });
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        messageDiv.innerHTML = '';
        
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>登入中...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                messageDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle me-2"></i>${data.message}
                    </div>
                `;
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                messageDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>${data.message}
                    </div>
                `;
            }
        } catch (error) {
            messageDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>網路錯誤，請稍後再試
                </div>
            `;
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

function loadNews() {
    fetch('/api/news')
        .then(response => response.json())
        .then(data => {
            const newsContainer = document.getElementById('newsContainer');
            
            if (data.success && data.news.length > 0) {
                newsContainer.innerHTML = data.news.map(news => `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card news-card h-100">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="bi bi-megaphone text-primary me-2"></i>
                                    ${news.title}
                                </h5>
                                <p class="card-text">${news.content.substring(0, 100)}${news.content.length > 100 ? '...' : ''}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="bi bi-person me-1"></i>
                                        ${news.author_name || '系統管理員'}
                                    </small>
                                    <small class="text-muted">
                                        <i class="bi bi-calendar me-1"></i>
                                        ${new Date(news.created_at).toLocaleDateString('zh-TW')}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                newsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            目前沒有最新消息
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            const newsContainer = document.getElementById('newsContainer');
            newsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        無法載入最新消息，請稍後再試
                    </div>
                </div>
            `;
        });
}