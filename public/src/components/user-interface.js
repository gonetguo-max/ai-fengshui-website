// 用户界面组件 - 登录注册和价格展示
class UserInterface {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentTier = 'FREE';
        this.init();
    }

    init() {
        this.createUserPanel();
        this.createPricingModal();
        this.loadUserSession();
        this.bindEvents();
        console.log('✅ 用户界面初始化完成');
    }

    // 创建用户面板
    createUserPanel() {
        const userPanelHTML = `
            <div id="user-panel" class="user-panel">
                <div id="user-logged-out" class="user-state" style="display: block;">
                    <button class="btn btn-outline" onclick="userInterface.showAuthModal('login')">
                        <span>🔑</span> 登录
                    </button>
                    <button class="btn btn-primary" onclick="userInterface.showAuthModal('register')">
                        <span>👤</span> 注册
                    </button>
                </div>
                
                <div id="user-logged-in" class="user-state" style="display: none;">
                    <div class="user-info">
                        <span class="user-avatar">👤</span>
                        <div class="user-details">
                            <div class="user-email" id="user-email"></div>
                            <div class="user-tier" id="user-tier-badge"></div>
                        </div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="userInterface.showUserDashboard()">
                        仪表板
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="userInterface.logout()">
                        退出
                    </button>
                </div>
            </div>

            <!-- 认证模态框 -->
            <div id="auth-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="auth-title">登录</h3>
                        <button class="modal-close" onclick="userInterface.hideAuthModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="auth-form">
                            <div class="form-group">
                                <label class="form-label">邮箱</label>
                                <input type="email" class="form-input" id="auth-email" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">密码</label>
                                <input type="password" class="form-input" id="auth-password" required>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary btn-full">
                                    <span id="auth-submit-text">登录</span>
                                </button>
                            </div>
                        </form>
                        <div class="auth-switch">
                            <span id="auth-switch-text">还没有账户？</span>
                            <a href="#" id="auth-switch-link" onclick="userInterface.switchAuthMode()">立即注册</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 用户仪表板 -->
            <div id="user-dashboard" class="modal" style="display: none;">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>用户仪表板</h3>
                        <button class="modal-close" onclick="userInterface.hideUserDashboard()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="dashboard-grid">
                            <div class="dashboard-card">
                                <h4>当前套餐</h4>
                                <div id="dashboard-tier-info"></div>
                            </div>
                            <div class="dashboard-card">
                                <h4>使用统计</h4>
                                <div id="dashboard-usage-info"></div>
                            </div>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-primary" onclick="userInterface.showPricingModal()">
                                升级套餐
                            </button>
                            <button class="btn btn-outline" onclick="userInterface.showAnalysisHistory()">
                                分析历史
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 将用户面板插入到页面头部
        document.body.insertAdjacentHTML('afterbegin', userPanelHTML);
    }

    // 创建价格展示模态框
    createPricingModal() {
        const pricingModalHTML = `
            <div id="pricing-modal" class="modal" style="display: none;">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>选择您的套餐</h3>
                        <button class="modal-close" onclick="userInterface.hidePricingModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="pricing-grid">
                            <!-- 免费版 -->
                            <div class="pricing-card" data-tier="FREE">
                                <div class="pricing-header">
                                    <h4>免费版</h4>
                                    <div class="pricing-price">
                                        <span class="price-currency">¥</span>
                                        <span class="price-amount">0</span>
                                        <span class="price-period">/永久</span>
                                    </div>
                                </div>
                                <div class="pricing-features">
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>每月3次分析</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>基础风水评分</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>简化建议报告</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>文本格式导出</span>
                                    </div>
                                </div>
                                <button class="btn btn-outline btn-full" onclick="userInterface.selectTier('FREE')">
                                    当前套餐
                                </button>
                            </div>

                            <!-- 进阶版 -->
                            <div class="pricing-card pricing-popular" data-tier="PREMIUM">
                                <div class="pricing-badge">推荐</div>
                                <div class="pricing-header">
                                    <h4>进阶版</h4>
                                    <div class="pricing-price">
                                        <span class="price-currency">$</span>
                                        <span class="price-amount">4.99</span>
                                        <span class="price-period">/次</span>
                                    </div>
                                </div>
                                <div class="pricing-features">
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>每月10次分析</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>详细风水分析</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>户型图上传识别</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>时间建议</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>PDF专业报告</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>30天重新生成</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary btn-full" onclick="userInterface.selectTier('PREMIUM')">
                                    立即升级
                                </button>
                            </div>

                            <!-- 高级版 -->
                            <div class="pricing-card" data-tier="VIP">
                                <div class="pricing-header">
                                    <h4>高级版</h4>
                                    <div class="pricing-price">
                                        <span class="price-currency">$</span>
                                        <span class="price-amount">29.90</span>
                                        <span class="price-period">/次</span>
                                    </div>
                                </div>
                                <div class="pricing-features">
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>无限次分析</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>大师级深度分析</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>多角度解读</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>个性化定制</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>3D可视化</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>专属客服</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">✅</span>
                                        <span>终身更新</span>
                                    </div>
                                </div>
                                <button class="btn btn-gold btn-full" onclick="userInterface.selectTier('VIP')">
                                    升级至VIP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', pricingModalHTML);
    }

    // 绑定事件
    bindEvents() {
        // 认证表单提交
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        // 模态框外部点击关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // 显示认证模态框
    showAuthModal(mode = 'login') {
        this.authMode = mode;
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('auth-title');
        const submitText = document.getElementById('auth-submit-text');
        const switchText = document.getElementById('auth-switch-text');
        const switchLink = document.getElementById('auth-switch-link');

        if (mode === 'login') {
            title.textContent = '登录';
            submitText.textContent = '登录';
            switchText.textContent = '还没有账户？';
            switchLink.textContent = '立即注册';
        } else {
            title.textContent = '注册';
            submitText.textContent = '注册';
            switchText.textContent = '已有账户？';
            switchLink.textContent = '立即登录';
        }

        modal.style.display = 'flex';
    }

    // 隐藏认证模态框
    hideAuthModal() {
        document.getElementById('auth-modal').style.display = 'none';
        this.clearAuthForm();
    }

    // 切换认证模式
    switchAuthMode() {
        const newMode = this.authMode === 'login' ? 'register' : 'login';
        this.showAuthModal(newMode);
    }

    // 处理认证表单提交
    async handleAuthSubmit() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const submitBtn = document.querySelector('#auth-form button[type="submit"]');
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '处理中...';

            const response = await fetch(`/api/auth/${this.authMode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.handleLoginSuccess(data.data);
                this.hideAuthModal();
                this.showSuccessMessage(this.authMode === 'login' ? '登录成功！' : '注册成功！');
            } else {
                throw new Error(data.error || '认证失败');
            }
        } catch (error) {
            console.error('认证错误:', error);
            this.showErrorMessage(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this.authMode === 'login' ? '登录' : '注册';
        }
    }

    // 处理登录成功
    handleLoginSuccess(data) {
        this.isLoggedIn = true;
        this.currentUser = data.user;
        this.currentTier = data.user.tier;
        
        // 保存会话信息
        localStorage.setItem('userSession', JSON.stringify(data.session));
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        this.updateUserInterface();
        console.log('✅ 用户登录成功:', this.currentUser);
    }

    // 用户退出
    async logout() {
        try {
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });
        } catch (error) {
            console.error('退出请求失败:', error);
        } finally {
            this.isLoggedIn = false;
            this.currentUser = null;
            this.currentTier = 'FREE';
            
            localStorage.removeItem('userSession');
            localStorage.removeItem('currentUser');
            
            this.updateUserInterface();
            this.showSuccessMessage('已成功退出');
        }
    }

    // 加载用户会话
    loadUserSession() {
        try {
            const sessionData = localStorage.getItem('userSession');
            const userData = localStorage.getItem('currentUser');
            
            if (sessionData && userData) {
                const session = JSON.parse(sessionData);
                const user = JSON.parse(userData);
                
                // 检查会话是否过期
                if (new Date() < new Date(session.expiresAt)) {
                    this.isLoggedIn = true;
                    this.currentUser = user;
                    this.currentTier = user.tier;
                    this.updateUserInterface();
                    console.log('✅ 用户会话恢复:', user.email);
                } else {
                    // 会话过期，清理数据
                    localStorage.removeItem('userSession');
                    localStorage.removeItem('currentUser');
                }
            }
        } catch (error) {
            console.error('会话恢复失败:', error);
            localStorage.removeItem('userSession');
            localStorage.removeItem('currentUser');
        }
    }

    // 更新用户界面
    updateUserInterface() {
        const loggedOut = document.getElementById('user-logged-out');
        const loggedIn = document.getElementById('user-logged-in');
        
        if (this.isLoggedIn && this.currentUser) {
            loggedOut.style.display = 'none';
            loggedIn.style.display = 'flex';
            
            document.getElementById('user-email').textContent = this.currentUser.email;
            document.getElementById('user-tier-badge').textContent = this.getTierDisplayName(this.currentTier);
            document.getElementById('user-tier-badge').className = `user-tier tier-${this.currentTier.toLowerCase()}`;
        } else {
            loggedOut.style.display = 'flex';
            loggedIn.style.display = 'none';
        }
    }

    // 显示价格模态框
    showPricingModal() {
        document.getElementById('pricing-modal').style.display = 'flex';
        this.updatePricingCards();
    }

    // 隐藏价格模态框
    hidePricingModal() {
        document.getElementById('pricing-modal').style.display = 'none';
    }

    // 显示用户仪表板
    showUserDashboard() {
        if (!this.isLoggedIn) {
            this.showAuthModal('login');
            return;
        }

        document.getElementById('user-dashboard').style.display = 'flex';
        this.updateDashboardInfo();
    }

    // 隐藏用户仪表板
    hideUserDashboard() {
        document.getElementById('user-dashboard').style.display = 'none';
    }

    // 更新仪表板信息
    async updateDashboardInfo() {
        try {
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            const response = await fetch('/api/user/stats', {
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                const stats = data.data;
                
                // 更新套餐信息
                document.getElementById('dashboard-tier-info').innerHTML = `
                    <div class="tier-display">
                        <span class="tier-badge tier-${stats.tier.toLowerCase()}">${stats.tierName}</span>
                        <p class="tier-description">${this.getTierDescription(stats.tier)}</p>
                    </div>
                `;
                
                // 更新使用统计
                const remainingText = stats.remainingRequests === -1 ? '无限制' : `${stats.remainingRequests}次`;
                document.getElementById('dashboard-usage-info').innerHTML = `
                    <div class="usage-stats">
                        <div class="stat-item">
                            <span class="stat-label">已使用:</span>
                            <span class="stat-value">${stats.requestCount}次</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">剩余额度:</span>
                            <span class="stat-value">${remainingText}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">加入时间:</span>
                            <span class="stat-value">${new Date(stats.joinedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('获取用户统计失败:', error);
        }
    }

    // 选择套餐
    async selectTier(tier) {
        if (!this.isLoggedIn) {
            this.showAuthModal('login');
            return;
        }

        if (tier === 'FREE' || tier === this.currentTier) {
            return;
        }

        try {
            // 创建支付会话
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            const response = await fetch('/api/payment/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({ tier })
            });

            const data = await response.json();
            if (data.success) {
                // 重定向到支付页面
                window.location.href = data.data.url;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('创建支付会话失败:', error);
            this.showErrorMessage('支付初始化失败，请稍后再试');
        }
    }

    // 更新价格卡片
    updatePricingCards() {
        const cards = document.querySelectorAll('.pricing-card');
        cards.forEach(card => {
            const tier = card.dataset.tier;
            const button = card.querySelector('button');
            
            if (tier === this.currentTier) {
                button.textContent = '当前套餐';
                button.className = 'btn btn-outline btn-full';
                button.disabled = true;
            } else if (tier === 'FREE') {
                button.textContent = '免费使用';
                button.className = 'btn btn-outline btn-full';
            } else {
                button.textContent = tier === 'PREMIUM' ? '立即升级' : '升级至VIP';
                button.className = tier === 'VIP' ? 'btn btn-gold btn-full' : 'btn btn-primary btn-full';
                button.disabled = false;
            }
        });
    }

    // 工具方法
    getTierDisplayName(tier) {
        const names = {
            'FREE': '免费版',
            'PREMIUM': '进阶版',
            'VIP': '高级版'
        };
        return names[tier] || tier;
    }

    getTierDescription(tier) {
        const descriptions = {
            'FREE': '基础风水分析，适合初学者',
            'PREMIUM': '专业分析报告，详细改善建议',
            'VIP': '大师级深度咨询，个性化服务'
        };
        return descriptions[tier] || '';
    }

    clearAuthForm() {
        document.getElementById('auth-email').value = '';
        document.getElementById('auth-password').value = '';
    }

    hideAllModals() {
        document.getElementById('auth-modal').style.display = 'none';
        document.getElementById('pricing-modal').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'none';
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    // 处理支付升级
    async handleUpgrade(targetTier) {
        if (!this.isLoggedIn) {
            this.showAuthModal('login');
            this.showErrorMessage('请先登录账户');
            return;
        }

        try {
            // 创建支付会话
            const response = await fetch('/api/payment/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ targetTier })
            });

            const data = await response.json();

            if (data.success) {
                // 跳转到支付页面
                window.location.href = data.data.paymentUrl;
            } else {
                this.showErrorMessage(data.error || '创建支付会话失败');
            }
        } catch (error) {
            console.error('支付升级失败:', error);
            this.showErrorMessage('网络错误，请重试');
        }
    }

    // 验证支付状态
    async verifyPayment(sessionId) {
        try {
            const response = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ sessionId })
            });

            const data = await response.json();

            if (data.success) {
                // 更新用户信息
                this.currentUser = data.data.user;
                this.currentTier = data.data.user.tier;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                this.updateUserInterface();
                this.showSuccessMessage('账户升级成功！');
                return true;
            } else {
                this.showErrorMessage(data.error || '支付验证失败');
                return false;
            }
        } catch (error) {
            console.error('支付验证失败:', error);
            this.showErrorMessage('网络错误，无法验证支付');
            return false;
        }
    }

    // 获取用户统计信息
    async loadUserStats() {
        if (!this.isLoggedIn) return;

        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                return data.data.stats;
            }
        } catch (error) {
            console.error('获取用户统计失败:', error);
        }
        return null;
    }

    // 更新价格卡片的升级按钮
    updatePricingCards() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            const tier = card.dataset.tier;
            const upgradeBtn = card.querySelector('.upgrade-btn');
            
            if (!upgradeBtn) return;

            if (!this.isLoggedIn) {
                upgradeBtn.textContent = '登录后升级';
                upgradeBtn.onclick = () => {
                    this.hidePricingModal();
                    this.showAuthModal('login');
                };
            } else if (this.currentTier === tier) {
                upgradeBtn.textContent = '当前版本';
                upgradeBtn.disabled = true;
                upgradeBtn.style.opacity = '0.5';
            } else {
                upgradeBtn.textContent = `升级到${this.getTierDisplayName(tier)}`;
                upgradeBtn.disabled = false;
                upgradeBtn.style.opacity = '1';
                upgradeBtn.onclick = () => {
                    this.hidePricingModal();
                    this.handleUpgrade(tier);
                };
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 全局实例
const userInterface = new UserInterface();