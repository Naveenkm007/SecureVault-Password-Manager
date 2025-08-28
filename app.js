// SecureVault Password Manager - Main Application Logic

class SecureVault {
    constructor() {
        this.masterKey = null;
        this.vault = [];
        this.currentEditingId = null;
        this.autoLockTimeout = null;
        this.autoLockDuration = 300000; // 5 minutes default
        this.isLocked = true;
        
        // Sample data for demonstration
        this.sampleData = {
            "passwords": [
                {
                    "id": "1",
                    "title": "Gmail",
                    "username": "user@gmail.com",
                    "password": "Gm@il2024!Secure",
                    "website": "https://gmail.com",
                    "notes": "Personal email account",
                    "dateCreated": "2025-01-15",
                    "dateModified": "2025-01-15",
                    "category": "Email",
                    "favorite": true
                },
                {
                    "id": "2", 
                    "title": "Banking",
                    "username": "john_doe",
                    "password": "B@nk#2024$Strong",
                    "website": "https://mybank.com",
                    "notes": "Main checking account",
                    "dateCreated": "2025-01-10",
                    "dateModified": "2025-01-20",
                    "category": "Finance",
                    "favorite": true
                }
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingVault();
        this.setupAutoLock();
        this.setupTheme();
        this.setupPWA();
    }

    // Encryption/Decryption Functions
    generateKey(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256/32,
            iterations: 100000
        });
    }

    encrypt(data, password) {
        try {
            const salt = CryptoJS.lib.WordArray.random(128/8);
            const key = this.generateKey(password, salt);
            const iv = CryptoJS.lib.WordArray.random(128/8);
            
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            const result = {
                salt: salt.toString(),
                iv: iv.toString(),
                data: encrypted.toString()
            };

            return JSON.stringify(result);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    decrypt(encryptedData, password) {
        try {
            const parsed = JSON.parse(encryptedData);
            const salt = CryptoJS.enc.Hex.parse(parsed.salt);
            const iv = CryptoJS.enc.Hex.parse(parsed.iv);
            const key = this.generateKey(password, salt);

            const decrypted = CryptoJS.AES.decrypt(parsed.data, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // Password Strength Analysis
    analyzePasswordStrength(password) {
        if (!password) return { score: 0, text: 'Enter password', color: '#666' };

        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else feedback.push('Use at least 8 characters');

        // Character variety
        if (/[a-z]/.test(password)) score += 15;
        else feedback.push('Include lowercase letters');

        if (/[A-Z]/.test(password)) score += 15;
        else feedback.push('Include uppercase letters');

        if (/\d/.test(password)) score += 15;
        else feedback.push('Include numbers');

        if (/[^a-zA-Z\d]/.test(password)) score += 20;
        else feedback.push('Include special characters');

        // Bonus points
        if (password.length >= 16) score += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

        let text, color;
        if (score >= 80) {
            text = 'Very Strong';
            color = 'var(--color-success)';
        } else if (score >= 60) {
            text = 'Strong';
            color = 'var(--color-success)';
        } else if (score >= 40) {
            text = 'Medium';
            color = 'var(--color-warning)';
        } else if (score >= 20) {
            text = 'Weak';
            color = 'var(--color-error)';
        } else {
            text = 'Very Weak';
            color = 'var(--color-error)';
        }

        return { score, text, color, feedback };
    }

    // Password Generator
    generatePassword(options = {}) {
        const defaults = {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
            excludeAmbiguous: false
        };

        const settings = { ...defaults, ...options };
        
        let charset = '';
        
        if (settings.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (settings.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (settings.numbers) charset += '0123456789';
        if (settings.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (settings.excludeAmbiguous) {
            charset = charset.replace(/[0O1lI]/g, '');
        }

        if (!charset) {
            throw new Error('No character set selected');
        }

        let password = '';
        const array = new Uint8Array(settings.length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < settings.length; i++) {
            password += charset[array[i] % charset.length];
        }

        return password;
    }

    // Vault Management
    saveVault() {
        if (!this.masterKey) return false;

        const encryptedData = this.encrypt(this.vault, this.masterKey);
        if (encryptedData) {
            localStorage.setItem('secureVault', encryptedData);
            localStorage.setItem('vaultExists', 'true');
            return true;
        }
        return false;
    }

    loadVault(masterPassword) {
        const encryptedData = localStorage.getItem('secureVault');
        if (!encryptedData) return false;

        const decryptedData = this.decrypt(encryptedData, masterPassword);
        if (decryptedData) {
            this.vault = decryptedData;
            this.masterKey = masterPassword;
            return true;
        }
        return false;
    }

    addPassword(passwordData) {
        const newPassword = {
            id: Date.now().toString(),
            ...passwordData,
            dateCreated: new Date().toISOString().split('T')[0],
            dateModified: new Date().toISOString().split('T')[0]
        };

        this.vault.push(newPassword);
        this.saveVault();
        this.addActivity(`Added password for ${passwordData.title}`);
        return newPassword;
    }

    updatePassword(id, passwordData) {
        const index = this.vault.findIndex(p => p.id === id);
        if (index !== -1) {
            this.vault[index] = {
                ...this.vault[index],
                ...passwordData,
                dateModified: new Date().toISOString().split('T')[0]
            };
            this.saveVault();
            this.addActivity(`Updated password for ${passwordData.title}`);
            return this.vault[index];
        }
        return null;
    }

    deletePassword(id) {
        const index = this.vault.findIndex(p => p.id === id);
        if (index !== -1) {
            const deleted = this.vault.splice(index, 1)[0];
            this.saveVault();
            this.addActivity(`Deleted password for ${deleted.title}`);
            return deleted;
        }
        return null;
    }

    getPassword(id) {
        return this.vault.find(p => p.id === id);
    }

    searchPasswords(query, category = '') {
        let results = this.vault;

        if (category) {
            results = results.filter(p => p.category === category);
        }

        if (query) {
            const lowercaseQuery = query.toLowerCase();
            results = results.filter(p => 
                p.title.toLowerCase().includes(lowercaseQuery) ||
                p.username.toLowerCase().includes(lowercaseQuery) ||
                p.website.toLowerCase().includes(lowercaseQuery) ||
                p.notes.toLowerCase().includes(lowercaseQuery)
            );
        }

        return results;
    }

    // Security Analysis
    analyzeVaultSecurity() {
        const analysis = {
            totalPasswords: this.vault.length,
            weakPasswords: 0,
            duplicatePasswords: 0,
            oldPasswords: 0,
            issues: [],
            score: 100
        };

        const passwordMap = new Map();
        const currentDate = new Date();

        this.vault.forEach(entry => {
            // Check password strength
            const strength = this.analyzePasswordStrength(entry.password);
            if (strength.score < 60) {
                analysis.weakPasswords++;
            }

            // Check for duplicates
            if (passwordMap.has(entry.password)) {
                analysis.duplicatePasswords++;
            } else {
                passwordMap.set(entry.password, 1);
            }

            // Check password age (older than 1 year)
            const modifiedDate = new Date(entry.dateModified);
            const daysDiff = (currentDate - modifiedDate) / (1000 * 60 * 60 * 24);
            if (daysDiff > 365) {
                analysis.oldPasswords++;
            }
        });

        // Generate issues and calculate score
        if (analysis.weakPasswords > 0) {
            analysis.issues.push({
                type: 'weak',
                message: `${analysis.weakPasswords} weak password${analysis.weakPasswords > 1 ? 's' : ''} found`,
                icon: '⚠️'
            });
            analysis.score -= Math.min(30, analysis.weakPasswords * 5);
        }

        if (analysis.duplicatePasswords > 0) {
            analysis.issues.push({
                type: 'duplicate',
                message: `${analysis.duplicatePasswords} duplicate password${analysis.duplicatePasswords > 1 ? 's' : ''} found`,
                icon: '🔄'
            });
            analysis.score -= Math.min(40, analysis.duplicatePasswords * 10);
        }

        if (analysis.oldPasswords > 0) {
            analysis.issues.push({
                type: 'old',
                message: `${analysis.oldPasswords} password${analysis.oldPasswords > 1 ? 's' : ''} older than 1 year`,
                icon: '📅'
            });
            analysis.score -= Math.min(20, analysis.oldPasswords * 3);
        }

        analysis.score = Math.max(0, Math.min(100, analysis.score));
        return analysis;
    }

    // Activity Tracking
    addActivity(message) {
        const activities = this.getActivities();
        activities.unshift({
            id: Date.now(),
            message,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 activities
        const recent = activities.slice(0, 10);
        localStorage.setItem('vaultActivities', JSON.stringify(recent));
        this.updateActivityDisplay();
    }

    getActivities() {
        try {
            return JSON.parse(localStorage.getItem('vaultActivities') || '[]');
        } catch {
            return [];
        }
    }

    // Auto-lock functionality
    setupAutoLock() {
        this.resetAutoLock();
        
        // Reset timer on user activity
        document.addEventListener('click', () => this.resetAutoLock());
        document.addEventListener('keypress', () => this.resetAutoLock());
        document.addEventListener('scroll', () => this.resetAutoLock());
        document.addEventListener('touchstart', () => this.resetAutoLock());
    }

    resetAutoLock() {
        if (this.autoLockTimeout) {
            clearTimeout(this.autoLockTimeout);
        }

        if (!this.isLocked && this.autoLockDuration > 0) {
            this.autoLockTimeout = setTimeout(() => {
                this.lockVault();
            }, this.autoLockDuration);
        }
    }

    lockVault() {
        this.masterKey = null;
        this.isLocked = true;
        this.hideMainApp();
        this.showScreen('login-screen');
        this.showToast('Vault locked for security', 'warning');
    }

    // Event Listeners
    setupEventListeners() {
        // Welcome screen
        const setupVaultBtn = document.getElementById('setup-vault-btn');
        const existingVaultBtn = document.getElementById('existing-vault-btn');
        
        if (setupVaultBtn) {
            setupVaultBtn.addEventListener('click', () => {
                this.showScreen('setup-screen');
            });
        }

        if (existingVaultBtn) {
            existingVaultBtn.addEventListener('click', () => {
                this.showScreen('login-screen');
            });
        }

        // Setup screen
        const setupForm = document.getElementById('setup-form');
        if (setupForm) {
            setupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSetup();
            });
        }

        const masterPasswordInput = document.getElementById('master-password');
        if (masterPasswordInput) {
            masterPasswordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // Login screen
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const biometricBtn = document.getElementById('biometric-btn');
        if (biometricBtn) {
            biometricBtn.addEventListener('click', () => {
                this.simulateBiometric();
            });
        }

        const resetVaultBtn = document.getElementById('reset-vault-btn');
        if (resetVaultBtn) {
            resetVaultBtn.addEventListener('click', () => {
                this.resetVault();
            });
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.showMainScreen(screen);
                this.updateNavigation(screen);
            });
        });

        // Password toggles
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('password-toggle')) {
                this.togglePasswordVisibility(e.target.dataset.target);
            }
        });

        // Dashboard actions
        const addPasswordBtn = document.getElementById('add-password-btn');
        if (addPasswordBtn) {
            addPasswordBtn.addEventListener('click', () => {
                this.showPasswordForm();
            });
        }

        const generatePasswordBtn = document.getElementById('generate-password-btn');
        if (generatePasswordBtn) {
            generatePasswordBtn.addEventListener('click', () => {
                this.showMainScreen('generator-screen');
                this.updateNavigation('generator-screen');
            });
        }

        const securityReportBtn = document.getElementById('security-report-btn');
        if (securityReportBtn) {
            securityReportBtn.addEventListener('click', () => {
                this.showMainScreen('security-report-screen');
                this.updateNavigation('security-report-screen');
            });
        }

        const lockVaultBtn = document.getElementById('lock-vault-btn');
        if (lockVaultBtn) {
            lockVaultBtn.addEventListener('click', () => {
                this.lockVault();
            });
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showMainScreen('settings-screen');
            });
        }

        // Vault screen
        const vaultAddBtn = document.getElementById('vault-add-btn');
        if (vaultAddBtn) {
            vaultAddBtn.addEventListener('click', () => {
                this.showPasswordForm();
            });
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.handleSearch();
            });
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.handleSearch();
            });
        }

        // Password form
        const formBackBtn = document.getElementById('form-back-btn');
        if (formBackBtn) {
            formBackBtn.addEventListener('click', () => {
                this.showMainScreen('vault-screen');
                this.updateNavigation('vault-screen');
            });
        }

        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordSave();
            });
        }

        const inlineGenerateBtn = document.getElementById('inline-generate-btn');
        if (inlineGenerateBtn) {
            inlineGenerateBtn.addEventListener('click', () => {
                const password = this.generatePassword();
                const passwordField = document.getElementById('password-password');
                if (passwordField) {
                    passwordField.value = password;
                }
            });
        }

        const deletePasswordBtn = document.getElementById('delete-password-btn');
        if (deletePasswordBtn) {
            deletePasswordBtn.addEventListener('click', () => {
                this.handlePasswordDelete();
            });
        }

        // Generator screen
        const generatorBackBtn = document.getElementById('generator-back-btn');
        if (generatorBackBtn) {
            generatorBackBtn.addEventListener('click', () => {
                this.showMainScreen('dashboard-screen');
                this.updateNavigation('dashboard-screen');
            });
        }

        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.handleGeneratePassword();
            });
        }

        const copyPasswordBtn = document.getElementById('copy-password-btn');
        if (copyPasswordBtn) {
            copyPasswordBtn.addEventListener('click', () => {
                this.copyGeneratedPassword();
            });
        }

        const refreshPasswordBtn = document.getElementById('refresh-password-btn');
        if (refreshPasswordBtn) {
            refreshPasswordBtn.addEventListener('click', () => {
                this.handleGeneratePassword();
            });
        }

        const usePasswordBtn = document.getElementById('use-password-btn');
        if (usePasswordBtn) {
            usePasswordBtn.addEventListener('click', () => {
                this.useGeneratedPassword();
            });
        }

        const passwordLengthSlider = document.getElementById('password-length');
        if (passwordLengthSlider) {
            passwordLengthSlider.addEventListener('input', (e) => {
                const lengthValue = document.getElementById('length-value');
                if (lengthValue) {
                    lengthValue.textContent = e.target.value;
                }
            });
        }

        // Security report
        const reportBackBtn = document.getElementById('report-back-btn');
        if (reportBackBtn) {
            reportBackBtn.addEventListener('click', () => {
                this.showMainScreen('dashboard-screen');
                this.updateNavigation('dashboard-screen');
            });
        }

        // Settings
        const settingsBackBtn = document.getElementById('settings-back-btn');
        if (settingsBackBtn) {
            settingsBackBtn.addEventListener('click', () => {
                this.showMainScreen('dashboard-screen');
                this.updateNavigation('dashboard-screen');
            });
        }

        const autoLockTimeout = document.getElementById('auto-lock-timeout');
        if (autoLockTimeout) {
            autoLockTimeout.addEventListener('change', (e) => {
                this.autoLockDuration = parseInt(e.target.value) * 1000;
                this.resetAutoLock();
            });
        }

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportVault();
            });
        }

        const importDataBtn = document.getElementById('import-data-btn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                const importFile = document.getElementById('import-file');
                if (importFile) {
                    importFile.click();
                }
            });
        }

        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.importVault(e.target.files[0]);
            });
        }

        const clearAllDataBtn = document.getElementById('clear-all-data-btn');
        if (clearAllDataBtn) {
            clearAllDataBtn.addEventListener('click', () => {
                this.confirmClearData();
            });
        }

        // Modal handlers
        const confirmCancel = document.getElementById('confirm-cancel');
        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => {
                this.hideModal('confirm-modal');
            });
        }

        const alertOk = document.getElementById('alert-ok');
        if (alertOk) {
            alertOk.addEventListener('click', () => {
                this.hideModal('alert-modal');
            });
        }
    }

    // UI Methods
    showScreen(screenId) {
        // Hide all screens first
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the requested screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Update content based on screen
        switch(screenId) {
            case 'dashboard-screen':
                this.updateDashboard();
                break;
            case 'vault-screen':
                this.updateVaultList();
                break;
            case 'security-report-screen':
                this.updateSecurityReport();
                break;
        }
    }

    showMainScreen(screenId) {
        this.showMainApp();
        
        // Hide all main app screens
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            const screens = mainApp.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Show the requested screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                
                // Update content based on screen
                switch(screenId) {
                    case 'dashboard-screen':
                        this.updateDashboard();
                        break;
                    case 'vault-screen':
                        this.updateVaultList();
                        break;
                    case 'security-report-screen':
                        this.updateSecurityReport();
                        break;
                }
            }
        }
    }

    showMainApp() {
        // Hide other main screens
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('setup-screen').classList.remove('active');
        document.getElementById('login-screen').classList.remove('active');
        
        // Show main app
        document.getElementById('main-app').classList.remove('hidden');
    }

    hideMainApp() {
        document.getElementById('main-app').classList.add('hidden');
    }

    updateNavigation(activeScreen) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === activeScreen) {
                item.classList.add('active');
            }
        });
    }

    showPasswordForm(passwordId = null) {
        this.currentEditingId = passwordId;
        const isEditing = !!passwordId;
        
        const formTitle = document.getElementById('form-title');
        const deleteBtn = document.getElementById('delete-password-btn');
        
        if (formTitle) {
            formTitle.textContent = isEditing ? 'Edit Password' : 'Add Password';
        }
        
        if (deleteBtn) {
            deleteBtn.style.display = isEditing ? 'block' : 'none';
        }

        if (isEditing) {
            const password = this.getPassword(passwordId);
            if (password) {
                const fields = {
                    'password-title': password.title,
                    'password-website': password.website,
                    'password-username': password.username,
                    'password-password': password.password,
                    'password-category': password.category,
                    'password-notes': password.notes
                };
                
                Object.entries(fields).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = value || '';
                    }
                });
                
                const favoriteCheckbox = document.getElementById('password-favorite');
                if (favoriteCheckbox) {
                    favoriteCheckbox.checked = password.favorite || false;
                }
            }
        } else {
            const passwordForm = document.getElementById('password-form');
            if (passwordForm) {
                passwordForm.reset();
            }
        }

        this.showMainScreen('password-form-screen');
    }

    updateDashboard() {
        const analysis = this.analyzeVaultSecurity();
        
        // Update security score
        const securityScore = document.getElementById('security-score');
        const securityScoreCircle = document.getElementById('security-score-circle');
        
        if (securityScore) {
            securityScore.textContent = analysis.score;
        }
        
        if (securityScoreCircle) {
            securityScoreCircle.style.setProperty('--score', analysis.score);
        }
        
        // Update stats
        const totalPasswords = document.getElementById('total-passwords');
        const weakPasswords = document.getElementById('weak-passwords');
        const duplicatePasswords = document.getElementById('duplicate-passwords');
        
        if (totalPasswords) totalPasswords.textContent = analysis.totalPasswords;
        if (weakPasswords) weakPasswords.textContent = analysis.weakPasswords;
        if (duplicatePasswords) duplicatePasswords.textContent = analysis.duplicatePasswords;
        
        this.updateActivityDisplay();
    }

    updateVaultList() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        const searchQuery = searchInput ? searchInput.value : '';
        const categoryFilterValue = categoryFilter ? categoryFilter.value : '';
        
        const passwords = this.searchPasswords(searchQuery, categoryFilterValue);
        
        const container = document.getElementById('password-list');
        if (!container) return;
        
        container.innerHTML = '';

        if (passwords.length === 0) {
            container.innerHTML = '<p class="no-activity">No passwords found</p>';
            return;
        }

        passwords.forEach(password => {
            const item = this.createPasswordItem(password);
            container.appendChild(item);
        });
    }

    createPasswordItem(password) {
        const div = document.createElement('div');
        div.className = 'password-item';
        div.onclick = () => this.showPasswordForm(password.id);

        div.innerHTML = `
            <div class="password-header">
                <div>
                    <div class="password-title">${this.escapeHtml(password.title)}</div>
                    ${password.website ? `<a href="${password.website}" class="password-website" target="_blank" onclick="event.stopPropagation()">${this.escapeHtml(password.website)}</a>` : ''}
                </div>
                ${password.favorite ? '<span class="password-favorite">⭐</span>' : ''}
            </div>
            <div class="password-details">
                <span class="password-username">${this.escapeHtml(password.username)}</span>
                <span class="password-category">${this.escapeHtml(password.category)}</span>
            </div>
        `;

        return div;
    }

    updateSecurityReport() {
        const analysis = this.analyzeVaultSecurity();
        
        const overallScore = document.getElementById('overall-score');
        if (overallScore) {
            overallScore.textContent = analysis.score;
        }
        
        const issuesList = document.getElementById('security-issues-list');
        if (!issuesList) return;
        
        issuesList.innerHTML = '';

        if (analysis.issues.length === 0) {
            issuesList.innerHTML = '<p class="no-activity">No security issues found! 🎉</p>';
        } else {
            analysis.issues.forEach(issue => {
                const div = document.createElement('div');
                div.className = 'issue-item';
                div.innerHTML = `
                    <span class="issue-icon">${issue.icon}</span>
                    <span class="issue-text">${issue.message}</span>
                `;
                issuesList.appendChild(div);
            });
        }
    }

    updateActivityDisplay() {
        const activities = this.getActivities();
        const container = document.getElementById('activity-list');
        
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="no-activity">No recent activity</p>';
            return;
        }

        container.innerHTML = '';
        activities.slice(0, 3).forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `
                <div>${this.escapeHtml(activity.message)}</div>
                <small>${new Date(activity.timestamp).toLocaleString()}</small>
            `;
            container.appendChild(div);
        });
    }

    // Event Handlers
    handleSetup() {
        const masterPassword = document.getElementById('master-password');
        const confirmPassword = document.getElementById('confirm-password');
        
        if (!masterPassword || !confirmPassword) return;
        
        const password = masterPassword.value;
        const confirmPasswordValue = confirmPassword.value;

        if (password !== confirmPasswordValue) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        const strength = this.analyzePasswordStrength(password);
        if (strength.score < 60) {
            this.showToast('Please use a stronger password', 'error');
            return;
        }

        // Initialize with sample data
        this.vault = this.sampleData.passwords;
        this.masterKey = password;
        
        if (this.saveVault()) {
            this.isLocked = false;
            this.showMainApp();
            this.showMainScreen('dashboard-screen');
            this.updateNavigation('dashboard-screen');
            this.showToast('Vault created successfully!', 'success');
            this.addActivity('Vault created');
        } else {
            this.showToast('Failed to create vault', 'error');
        }
    }

    handleLogin() {
        const loginPasswordInput = document.getElementById('login-password');
        if (!loginPasswordInput) return;
        
        const password = loginPasswordInput.value;
        
        this.showLoading();
        
        setTimeout(() => {
            if (this.loadVault(password)) {
                this.isLocked = false;
                this.hideLoading();
                this.showMainApp();
                this.showMainScreen('dashboard-screen');
                this.updateNavigation('dashboard-screen');
                this.showToast('Welcome back!', 'success');
                this.addActivity('Vault unlocked');
                this.resetAutoLock();
            } else {
                this.hideLoading();
                this.showToast('Invalid password', 'error');
            }
        }, 1000);
    }

    handlePasswordSave() {
        const formData = {
            title: this.getFormValue('password-title'),
            website: this.getFormValue('password-website'),
            username: this.getFormValue('password-username'),
            password: this.getFormValue('password-password'),
            category: this.getFormValue('password-category'),
            notes: this.getFormValue('password-notes'),
            favorite: this.getFormChecked('password-favorite')
        };

        if (this.currentEditingId) {
            this.updatePassword(this.currentEditingId, formData);
            this.showToast('Password updated successfully', 'success');
        } else {
            this.addPassword(formData);
            this.showToast('Password added successfully', 'success');
        }

        this.showMainScreen('vault-screen');
        this.updateNavigation('vault-screen');
        this.currentEditingId = null;
    }

    handlePasswordDelete() {
        if (!this.currentEditingId) return;

        this.showConfirm('Delete Password', 'Are you sure you want to delete this password?', () => {
            this.deletePassword(this.currentEditingId);
            this.showToast('Password deleted', 'warning');
            this.showMainScreen('vault-screen');
            this.updateNavigation('vault-screen');
            this.currentEditingId = null;
        });
    }

    handleSearch() {
        this.updateVaultList();
    }

    handleGeneratePassword() {
        const options = {
            length: parseInt(this.getFormValue('password-length') || '16'),
            uppercase: this.getFormChecked('include-uppercase'),
            lowercase: this.getFormChecked('include-lowercase'),
            numbers: this.getFormChecked('include-numbers'),
            symbols: this.getFormChecked('include-symbols'),
            excludeAmbiguous: this.getFormChecked('exclude-ambiguous')
        };

        try {
            const password = this.generatePassword(options);
            const generatedPasswordElement = document.getElementById('generated-password');
            const usePasswordBtn = document.getElementById('use-password-btn');
            
            if (generatedPasswordElement) {
                generatedPasswordElement.textContent = password;
            }
            
            if (usePasswordBtn) {
                usePasswordBtn.style.display = 'block';
            }
        } catch (error) {
            this.showToast('Please select at least one character type', 'error');
        }
    }

    // Utility Methods
    getFormValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    getFormChecked(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    copyGeneratedPassword() {
        const generatedPassword = document.getElementById('generated-password');
        if (!generatedPassword) return;
        
        const password = generatedPassword.textContent;
        if (password && password !== 'Click generate to create password') {
            this.copyToClipboard(password);
        }
    }

    useGeneratedPassword() {
        const generatedPassword = document.getElementById('generated-password');
        if (!generatedPassword) return;
        
        const password = generatedPassword.textContent;
        if (password && password !== 'Click generate to create password') {
            this.showPasswordForm();
            const passwordField = document.getElementById('password-password');
            if (passwordField) {
                passwordField.value = password;
            }
            this.showToast('Password copied to form', 'success');
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard', 'success');
                
                // Clear clipboard after 30 seconds for security
                setTimeout(() => {
                    navigator.clipboard.writeText('');
                }, 30000);
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Copied to clipboard', 'success');
        }
    }

    togglePasswordVisibility(targetId) {
        const input = document.getElementById(targetId);
        const button = document.querySelector(`[data-target="${targetId}"]`);
        
        if (!input || !button) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }

    updatePasswordStrength(password) {
        const analysis = this.analyzePasswordStrength(password);
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        
        if (strengthBar) {
            strengthBar.style.width = analysis.score + '%';
            strengthBar.style.backgroundColor = analysis.color;
        }
        
        if (strengthText) {
            strengthText.textContent = analysis.text;
        }
    }

    simulateBiometric() {
        this.showToast('Biometric authentication simulated', 'success');
        
        // Simulate successful biometric login
        setTimeout(() => {
            const savedPassword = localStorage.getItem('masterPassword');
            if (savedPassword) {
                const loginPasswordInput = document.getElementById('login-password');
                if (loginPasswordInput) {
                    loginPasswordInput.value = savedPassword;
                    this.handleLogin();
                }
            } else {
                this.showToast('No biometric data found', 'error');
            }
        }, 1000);
    }

    resetVault() {
        this.showConfirm('Reset Vault', 'This will permanently delete all your data. Are you sure?', () => {
            localStorage.clear();
            this.vault = [];
            this.masterKey = null;
            this.showScreen('welcome-screen');
            this.showToast('Vault reset successfully', 'warning');
        });
    }

    exportVault() {
        if (!this.vault.length) {
            this.showToast('No data to export', 'warning');
            return;
        }

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            passwords: this.vault
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Vault exported successfully', 'success');
    }

    importVault(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.passwords && Array.isArray(importData.passwords)) {
                    this.vault = [...this.vault, ...importData.passwords];
                    this.saveVault();
                    this.showToast(`Imported ${importData.passwords.length} passwords`, 'success');
                    this.updateVaultList();
                } else {
                    this.showToast('Invalid file format', 'error');
                }
            } catch (error) {
                this.showToast('Failed to import file', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    confirmClearData() {
        this.showConfirm('Clear All Data', 'This will permanently delete everything. Are you sure?', () => {
            this.vault = [];
            this.saveVault();
            this.showToast('All data cleared', 'warning');
            this.updateVaultList();
            this.updateDashboard();
        });
    }

    checkExistingVault() {
        if (localStorage.getItem('vaultExists')) {
            this.showScreen('login-screen');
        } else {
            this.showScreen('welcome-screen');
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'auto';
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        localStorage.setItem('theme', theme);
        
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
    }

    setupPWA() {
        // Register service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            const swCode = `
                self.addEventListener('install', () => {
                    self.skipWaiting();
                });
                
                self.addEventListener('activate', () => {
                    self.clients.claim();
                });
            `;
            
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            
            navigator.serviceWorker.register(swUrl);
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('show');
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<p class="toast-message">${this.escapeHtml(message)}</p>`;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    showConfirm(title, message, onConfirm) {
        const titleElement = document.getElementById('confirm-title');
        const messageElement = document.getElementById('confirm-message');
        const modal = document.getElementById('confirm-modal');
        
        if (!titleElement || !messageElement || !modal) return;
        
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        modal.classList.add('show');
        
        const handleConfirm = () => {
            modal.classList.remove('show');
            onConfirm();
            const confirmOk = document.getElementById('confirm-ok');
            if (confirmOk) {
                confirmOk.removeEventListener('click', handleConfirm);
            }
        };
        
        const confirmOk = document.getElementById('confirm-ok');
        if (confirmOk) {
            confirmOk.addEventListener('click', handleConfirm);
        }
    }

    showAlert(title, message) {
        const titleElement = document.getElementById('alert-title');
        const messageElement = document.getElementById('alert-message');
        const modal = document.getElementById('alert-modal');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (modal) modal.classList.add('show');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.secureVault = new SecureVault();
});