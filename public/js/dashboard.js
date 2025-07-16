document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupNavigation();
    setupLogout();
    loadDashboardData();
});

function checkAuthStatus() {
    fetch('/auth/status')
        .then(response => response.json())
        .then(data => {
            if (!data.isLoggedIn) {
                window.location.href = '/';
                return;
            }
            displayUserInfo(data.user);
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        });
}

function displayUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `
        <div class="text-center">
            <i class="bi bi-person-circle display-6"></i>
            <p class="mb-0 mt-2">${user.username}</p>
            <small class="text-light">${user.role === 'admin' ? '管理員' : '使用者'}</small>
        </div>
    `;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.add('d-none'));
            
            const targetSection = document.getElementById(this.dataset.section + '-section');
            if (targetSection) {
                targetSection.classList.remove('d-none');
                
                if (this.dataset.section === 'items') {
                    loadItems();
                } else if (this.dataset.section === 'borrowings') {
                    loadBorrowings();
                }
            }
        });
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('確定要登出嗎？')) {
            fetch('/auth/logout', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/';
                    }
                })
                .catch(error => {
                    console.error('Logout failed:', error);
                    window.location.href = '/';
                });
        }
    });
}

function loadDashboardData() {
    Promise.all([
        fetch('/api/items').then(r => r.json()),
        fetch('/api/my-borrowings').then(r => r.json()),
        fetch('/api/news').then(r => r.json())
    ]).then(([itemsData, borrowingsData, newsData]) => {
        updateStats(itemsData, borrowingsData);
        loadDashboardNews(newsData);
    }).catch(error => {
        console.error('Failed to load dashboard data:', error);
    });
}

function updateStats(itemsData, borrowingsData) {
    if (itemsData.success) {
        const items = itemsData.items;
        document.getElementById('totalItems').textContent = items.length;
        document.getElementById('availableItems').textContent = 
            items.filter(item => item.status === 'available').length;
        document.getElementById('borrowedItems').textContent = 
            items.filter(item => item.status === 'borrowed').length;
    }
    
    if (borrowingsData.success) {
        const activeBorrowings = borrowingsData.borrowings.filter(b => b.status === 'active');
        document.getElementById('myBorrowings').textContent = activeBorrowings.length;
    }
}

function loadDashboardNews(newsData) {
    const newsContainer = document.getElementById('dashboardNews');
    
    if (newsData.success && newsData.news.length > 0) {
        newsContainer.innerHTML = newsData.news.slice(0, 3).map(news => `
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">${news.title}</h6>
                    <p class="card-text">${news.content.substring(0, 150)}${news.content.length > 150 ? '...' : ''}</p>
                    <small class="text-muted">
                        ${news.author_name || '系統管理員'} • 
                        ${new Date(news.created_at).toLocaleDateString('zh-TW')}
                    </small>
                </div>
            </div>
        `).join('');
    } else {
        newsContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>目前沒有最新消息
            </div>
        `;
    }
}

function loadItems() {
    const container = document.getElementById('itemsContainer');
    
    fetch('/api/items')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.items.length > 0) {
                    container.innerHTML = `
                        <div class="row">
                            ${data.items.map(item => `
                                <div class="col-md-6 col-lg-4 mb-4">
                                    <div class="card item-card h-100">
                                        <div class="card-body">
                                            <h5 class="card-title">${item.name}</h5>
                                            <p class="card-text">${item.description || '無說明'}</p>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="badge status-badge ${getStatusClass(item.status)}">
                                                    ${getStatusText(item.status)}
                                                </span>
                                                <small class="text-muted">${item.category_name || '未分類'}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="alert alert-info text-center">
                            <i class="bi bi-box me-2"></i>目前沒有物品
                        </div>
                    `;
                }
            } else {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>載入物品失敗
                    </div>
                `;
            }
        })
        .catch(error => {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>網路錯誤，請稍後再試
                </div>
            `;
        });
}

function loadBorrowings() {
    const container = document.getElementById('borrowingsContainer');
    
    fetch('/api/my-borrowings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.borrowings.length > 0) {
                    container.innerHTML = `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th>物品名稱</th>
                                        <th>借用日期</th>
                                        <th>到期日期</th>
                                        <th>狀態</th>
                                        <th>歸還日期</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.borrowings.map(borrowing => `
                                        <tr>
                                            <td>${borrowing.item_name}</td>
                                            <td>${new Date(borrowing.borrowed_at).toLocaleDateString('zh-TW')}</td>
                                            <td>${new Date(borrowing.due_date).toLocaleDateString('zh-TW')}</td>
                                            <td>
                                                <span class="badge ${getBorrowingStatusClass(borrowing.status)}">
                                                    ${getBorrowingStatusText(borrowing.status)}
                                                </span>
                                            </td>
                                            <td>${borrowing.returned_at ? new Date(borrowing.returned_at).toLocaleDateString('zh-TW') : '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="alert alert-info text-center">
                            <i class="bi bi-clipboard-check me-2"></i>您還沒有借用記錄
                        </div>
                    `;
                }
            } else {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>載入借用記錄失敗
                    </div>
                `;
            }
        })
        .catch(error => {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>網路錯誤，請稍後再試
                </div>
            `;
        });
}

function getStatusClass(status) {
    const classes = {
        'available': 'bg-success',
        'borrowed': 'bg-warning',
        'maintenance': 'bg-secondary',
        'retired': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getStatusText(status) {
    const texts = {
        'available': '可借用',
        'borrowed': '已借出',
        'maintenance': '維護中',
        'retired': '已除役'
    };
    return texts[status] || '未知';
}

function getBorrowingStatusClass(status) {
    const classes = {
        'active': 'bg-primary',
        'returned': 'bg-success',
        'overdue': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getBorrowingStatusText(status) {
    const texts = {
        'active': '借用中',
        'returned': '已歸還',
        'overdue': '逾期'
    };
    return texts[status] || '未知';
}