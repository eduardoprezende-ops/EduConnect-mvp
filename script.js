// EduConnect JavaScript

// Utility functions
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// localStorage helper functions
const Storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },
    set: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },
    add: (key, item) => {
        const items = Storage.get(key);
        items.push(item);
        Storage.set(key, items);
    }
};

// Authentication functions
const Auth = {
    getCurrentUser: () => {
        const email = localStorage.getItem('currentUser');
        if (!email) return null;
        const users = Storage.get('users');
        return users.find(user => user.email === email);
    },
    
    login: (email, password) => {
        const users = Storage.get('users');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', email);
            return { success: true, user };
        }
        return { success: false, message: 'E-mail ou senha incorretos' };
    },
    
    register: (name, email, password) => {
        const users = Storage.get('users');
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'E-mail já cadastrado' };
        }
        
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        Storage.add('users', newUser);
        localStorage.setItem('currentUser', email);
        return { success: true, user: newUser };
    },
    
    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },
    
    requireAuth: () => {
        if (!Auth.getCurrentUser()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Message helper
const showMessage = (elementId, message, type = 'error') => {
    const element = $(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
};

// Modal helper
const Modal = {
    show: (modalId) => {
        $(modalId).style.display = 'block';
    },
    hide: (modalId) => {
        $(modalId).style.display = 'none';
    },
    setupCloseHandlers: () => {
        $$('.close').forEach(closeBtn => {
            closeBtn.onclick = (e) => {
                e.target.closest('.modal').style.display = 'none';
            };
        });
        
        $$('.modal').forEach(modal => {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            };
        });
    }
};

// Initialize login page
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const loginTab = $('loginTab');
        const registerTab = $('registerTab');
        const loginForm = $('loginForm');
        const registerForm = $('registerForm');
        
        // Tab switching
        loginTab.onclick = () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        };
        
        registerTab.onclick = () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        };
        
        // Check if should show register form (after handlers are set)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('register') === 'true') {
            registerTab.click();
        }
        
        // Login form submission
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const email = $('loginEmail').value;
            const password = $('loginPassword').value;
            
            const result = Auth.login(email, password);
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                showMessage('loginMessage', result.message);
            }
        };
        
        // Register form submission
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const name = $('registerName').value;
            const email = $('registerEmail').value;
            const password = $('registerPassword').value;
            const confirmPassword = $('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showMessage('registerMessage', 'As senhas não coincidem');
                return;
            }
            
            if (password.length < 6) {
                showMessage('registerMessage', 'A senha deve ter pelo menos 6 caracteres');
                return;
            }
            
            const result = Auth.register(name, email, password);
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                showMessage('registerMessage', result.message);
            }
        };
    });
}

// Initialize dashboard
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        if (!Auth.requireAuth()) return;
        
        const currentUser = Auth.getCurrentUser();
        $('userName').textContent = currentUser.name;
        
        // Logout handler
        $('logoutBtn').onclick = Auth.logout;
        
        // Modal setup
        Modal.setupCloseHandlers();
        
        // Load initial data
        loadUserData();
        
        // Button handlers
        setupButtonHandlers();
        
        // Form handlers
        setupFormHandlers();
    });
    
    function loadUserData() {
        loadGroups();
        loadMentorings();
        loadMaterials();
    }
    
    function loadGroups() {
        const currentUser = Auth.getCurrentUser();
        const groups = Storage.get('groups');
        const userGroups = groups.filter(group => 
            group.createdBy === currentUser.id || 
            group.members.includes(currentUser.id)
        );
        
        const groupsList = $('groupsList');
        if (userGroups.length === 0) {
            groupsList.innerHTML = '<p>Você ainda não participa de nenhum grupo.</p>';
        } else {
            groupsList.innerHTML = userGroups.map(group => `
                <div class="list-item">
                    <h4>${group.name}</h4>
                    <p><strong>Matéria:</strong> ${group.subject}</p>
                    <p>${group.description}</p>
                    <div class="meta">
                        ${group.members.length} membros • 
                        Criado em ${new Date(group.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            `).join('');
        }
    }
    
    function loadMentorings() {
        const currentUser = Auth.getCurrentUser();
        const mentorings = Storage.get('mentorings');
        const userMentorings = mentorings.filter(mentoring => 
            mentoring.mentorId === currentUser.id || 
            mentoring.studentId === currentUser.id
        );
        
        const mentoringsList = $('mentoringsList');
        if (userMentorings.length === 0) {
            mentoringsList.innerHTML = '<p>Você ainda não tem mentorias ativas.</p>';
        } else {
            mentoringsList.innerHTML = userMentorings.map(mentoring => {
                const users = Storage.get('users');
                const mentor = users.find(u => u.id === mentoring.mentorId);
                const student = users.find(u => u.id === mentoring.studentId);
                const role = mentoring.mentorId === currentUser.id ? 'Mentor' : 'Estudante';
                const otherPerson = mentoring.mentorId === currentUser.id ? student : mentor;
                
                return `
                    <div class="list-item">
                        <h4>${mentoring.subject}</h4>
                        <p><strong>Papel:</strong> ${role}</p>
                        <p><strong>Com:</strong> ${otherPerson ? otherPerson.name : 'Usuário'}</p>
                        <div class="meta">
                            Iniciado em ${new Date(mentoring.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    function loadMaterials() {
        const currentUser = Auth.getCurrentUser();
        const materials = Storage.get('materials');
        const userMaterials = materials.filter(material => material.uploadedBy === currentUser.id);
        
        const materialsList = $('materialsList');
        if (userMaterials.length === 0) {
            materialsList.innerHTML = '<p>Você ainda não compartilhou nenhum material.</p>';
        } else {
            materialsList.innerHTML = userMaterials.map(material => `
                <div class="list-item">
                    <h4>${material.title}</h4>
                    <p><strong>Matéria:</strong> ${material.subject}</p>
                    <p><strong>Tipo:</strong> ${material.type === 'arquivo' ? 'Arquivo' : 'Link'}</p>
                    <p>${material.description}</p>
                    ${material.type === 'link' ? `<p><strong>Link:</strong> <a href="${material.link}" target="_blank">${material.link}</a></p>` : ''}
                    <div class="meta">
                        Compartilhado em ${new Date(material.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            `).join('');
        }
    }
    
    function setupButtonHandlers() {
        $('createGroupBtn').onclick = () => Modal.show('createGroupModal');
        $('joinGroupBtn').onclick = () => {
            loadAvailableGroups();
            Modal.show('joinGroupModal');
        };
        $('findMentorBtn').onclick = () => {
            loadAvailableMentors();
            Modal.show('findMentorModal');
        };
        $('becomeMentorBtn').onclick = () => Modal.show('becomeMentorModal');
        $('uploadMaterialBtn').onclick = () => Modal.show('uploadMaterialModal');
    }
    
    function setupFormHandlers() {
        // Create group form
        $('createGroupForm').onsubmit = (e) => {
            e.preventDefault();
            const currentUser = Auth.getCurrentUser();
            const group = {
                id: Date.now(),
                name: $('groupName').value,
                subject: $('groupSubject').value,
                description: $('groupDescription').value,
                createdBy: currentUser.id,
                members: [currentUser.id],
                createdAt: new Date().toISOString()
            };
            
            Storage.add('groups', group);
            Modal.hide('createGroupModal');
            $('createGroupForm').reset();
            loadGroups();
        };
        
        // Become mentor form
        $('becomeMentorForm').onsubmit = (e) => {
            e.preventDefault();
            const currentUser = Auth.getCurrentUser();
            const mentor = {
                id: Date.now(),
                userId: currentUser.id,
                subject: $('mentorSubject').value,
                experience: $('mentorExperience').value,
                createdAt: new Date().toISOString()
            };
            
            Storage.add('mentors', mentor);
            Modal.hide('becomeMentorModal');
            $('becomeMentorForm').reset();
            alert('Cadastro como mentor realizado com sucesso!');
        };
        
        // Upload material form
        $('uploadMaterialForm').onsubmit = (e) => {
            e.preventDefault();
            const currentUser = Auth.getCurrentUser();
            const type = $('materialType').value;
            
            const material = {
                id: Date.now(),
                title: $('materialTitle').value,
                subject: $('materialSubject').value,
                type: type,
                description: $('materialDescription').value,
                uploadedBy: currentUser.id,
                createdAt: new Date().toISOString()
            };
            
            if (type === 'link') {
                material.link = $('materialLink').value;
            } else {
                const file = $('materialFile').files[0];
                if (file) {
                    material.fileName = file.name;
                    material.fileSize = file.size;
                }
            }
            
            Storage.add('materials', material);
            Modal.hide('uploadMaterialModal');
            $('uploadMaterialForm').reset();
            loadMaterials();
        };
        
        // Material type change handler
        $('materialType').onchange = (e) => {
            const fileGroup = $('fileGroup');
            const linkGroup = $('linkGroup');
            
            if (e.target.value === 'link') {
                fileGroup.style.display = 'none';
                linkGroup.style.display = 'block';
                $('materialFile').required = false;
                $('materialLink').required = true;
            } else {
                fileGroup.style.display = 'block';
                linkGroup.style.display = 'none';
                $('materialFile').required = true;
                $('materialLink').required = false;
            }
        };
    }
    
    function loadAvailableGroups() {
        const currentUser = Auth.getCurrentUser();
        const groups = Storage.get('groups');
        const availableGroups = groups.filter(group => 
            !group.members.includes(currentUser.id)
        );
        
        const container = $('availableGroups');
        if (availableGroups.length === 0) {
            container.innerHTML = '<p>Não há grupos disponíveis no momento.</p>';
        } else {
            container.innerHTML = availableGroups.map(group => {
                const users = Storage.get('users');
                const creator = users.find(u => u.id === group.createdBy);
                
                return `
                    <div class="list-item">
                        <h4>${group.name}</h4>
                        <p><strong>Matéria:</strong> ${group.subject}</p>
                        <p>${group.description}</p>
                        <div class="meta">
                            ${group.members.length} membros • 
                            Criado por ${creator ? creator.name : 'Usuário'} • 
                            ${new Date(group.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <button class="btn btn-primary" onclick="joinGroup(${group.id})">Entrar no Grupo</button>
                    </div>
                `;
            }).join('');
        }
    }
    
    function loadAvailableMentors() {
        const currentUser = Auth.getCurrentUser();
        const mentors = Storage.get('mentors');
        const users = Storage.get('users');
        const availableMentors = mentors.filter(mentor => mentor.userId !== currentUser.id);
        
        const container = $('availableMentors');
        if (availableMentors.length === 0) {
            container.innerHTML = '<p>Não há mentores disponíveis no momento.</p>';
        } else {
            container.innerHTML = availableMentors.map(mentor => {
                const user = users.find(u => u.id === mentor.userId);
                
                return `
                    <div class="list-item">
                        <h4>${user ? user.name : 'Mentor'}</h4>
                        <p><strong>Especialidade:</strong> ${mentor.subject}</p>
                        <p>${mentor.experience}</p>
                        <div class="meta">
                            Mentor desde ${new Date(mentor.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <button class="btn btn-primary" onclick="connectWithMentor(${mentor.userId}, '${mentor.subject}')">Conectar</button>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Global functions for inline handlers
    window.joinGroup = (groupId) => {
        const currentUser = Auth.getCurrentUser();
        const groups = Storage.get('groups');
        const group = groups.find(g => g.id === groupId);
        
        if (group && !group.members.includes(currentUser.id)) {
            group.members.push(currentUser.id);
            Storage.set('groups', groups);
            Modal.hide('joinGroupModal');
            loadGroups();
            alert('Você entrou no grupo com sucesso!');
        }
    };
    
    window.connectWithMentor = (mentorId, subject) => {
        const currentUser = Auth.getCurrentUser();
        const mentoring = {
            id: Date.now(),
            mentorId: mentorId,
            studentId: currentUser.id,
            subject: subject,
            createdAt: new Date().toISOString()
        };
        
        Storage.add('mentorings', mentoring);
        Modal.hide('findMentorModal');
        loadMentorings();
        alert('Conexão com mentor estabelecida com sucesso!');
    };
}