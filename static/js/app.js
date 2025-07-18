// Gym Management System - Frontend JavaScript
class GymManager {
    constructor() {
        this.members = [];
        this.currentMember = null;
        this.isEditing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMembers();
        this.setDefaultDates();
    }

    setupEventListeners() {
        // Add member button
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            this.openMemberModal();
        });

        // Save member button
        document.getElementById('saveMemberBtn').addEventListener('click', () => {
            this.saveMember();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchMembers(e.target.value);
        });

        // Modal event listeners
        const memberModal = document.getElementById('memberModal');
        memberModal.addEventListener('hidden.bs.modal', () => {
            this.resetForm();
        });

        // Membership type change listener
        document.getElementById('tipo_membresia').addEventListener('change', (e) => {
            this.updateExpirationDate();
        });

        // Start date change listener
        document.getElementById('fecha_inicio').addEventListener('change', (e) => {
            this.updateExpirationDate();
        });

        // Form validation
        document.getElementById('memberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMember();
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha_inicio').value = today;
        this.updateExpirationDate();
    }

    updateExpirationDate() {
        const startDate = document.getElementById('fecha_inicio').value;
        const membershipType = document.getElementById('tipo_membresia').value;
        
        if (startDate && membershipType) {
            const start = new Date(startDate);
            let expiration = new Date(start);
            
            switch (membershipType) {
                case 'mensual':
                    expiration.setMonth(expiration.getMonth() + 1);
                    break;
                case 'trimestral':
                    expiration.setMonth(expiration.getMonth() + 3);
                    break;
                case 'semestral':
                    expiration.setMonth(expiration.getMonth() + 6);
                    break;
                case 'anual':
                    expiration.setFullYear(expiration.getFullYear() + 1);
                    break;
            }
            
            document.getElementById('fecha_vencimiento').value = expiration.toISOString().split('T')[0];
        }
    }

    async loadMembers() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/members');
            const data = await response.json();
            
            if (data.success) {
                this.members = data.members;
                this.renderMembers();
                this.updateMemberCount();
            } else {
                this.showAlert('error', data.error || 'Error al cargar los miembros');
            }
        } catch (error) {
            console.error('Error loading members:', error);
            this.showAlert('error', 'Error de conexión al cargar los miembros');
        } finally {
            this.showLoading(false);
        }
    }

    async searchMembers(query) {
        try {
            this.showLoading(true);
            const url = query ? `/api/members?search=${encodeURIComponent(query)}` : '/api/members';
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.members = data.members;
                this.renderMembers();
                this.updateMemberCount();
            } else {
                this.showAlert('error', data.error || 'Error al buscar miembros');
            }
        } catch (error) {
            console.error('Error searching members:', error);
            this.showAlert('error', 'Error de conexión al buscar miembros');
        } finally {
            this.showLoading(false);
        }
    }

    renderMembers() {
        const tbody = document.getElementById('membersTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (this.members.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        tbody.innerHTML = this.members.map(member => `
            <tr>
                <td>
                    <div class="fw-bold">${member.nombre} ${member.apellido}</div>
                    <small class="text-muted">${member.direccion}</small>
                </td>
                <td>${member.dni}</td>
                <td>
                    <div>${member.email}</div>
                </td>
                <td>${member.telefono}</td>
                <td>
                    <span class="badge bg-info">${this.formatMembershipType(member.tipo_membresia)}</span>
                </td>
                <td>
                    <span class="badge status-${member.estado}">${this.formatStatus(member.estado)}</span>
                </td>
                <td>
                    <div class="${this.getExpirationClass(member.fecha_vencimiento)}">
                        ${this.formatDate(member.fecha_vencimiento)}
                    </div>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="gymManager.editMember(${member.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="gymManager.deleteMember(${member.id}, '${member.nombre} ${member.apellido}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatMembershipType(type) {
        const types = {
            'mensual': 'Mensual',
            'trimestral': 'Trimestral',
            'semestral': 'Semestral',
            'anual': 'Anual'
        };
        return types[type] || type;
    }

    formatStatus(status) {
        const statuses = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'suspendido': 'Suspendido'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getExpirationClass(dateString) {
        const today = new Date();
        const expiration = new Date(dateString);
        const diffTime = expiration - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'text-danger fw-bold';
        } else if (diffDays <= 7) {
            return 'text-warning fw-bold';
        } else {
            return 'text-success';
        }
    }

    updateMemberCount() {
        const count = this.members.length;
        document.getElementById('memberCount').textContent = `Total: ${count} miembro${count !== 1 ? 's' : ''}`;
    }

    openMemberModal(member = null) {
        this.currentMember = member;
        this.isEditing = !!member;
        
        const modal = new bootstrap.Modal(document.getElementById('memberModal'));
        const modalTitle = document.getElementById('memberModalLabel');
        const saveBtn = document.getElementById('saveMemberBtn');
        
        if (this.isEditing) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Miembro';
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Miembro';
            this.fillForm(member);
        } else {
            modalTitle.innerHTML = '<i class="fas fa-user-plus me-2"></i>Agregar Miembro';
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Miembro';
            this.resetForm();
        }
        
        modal.show();
    }

    fillForm(member) {
        const form = document.getElementById('memberForm');
        const formData = new FormData(form);
        
        Object.keys(member).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = member[key];
            }
        });
    }

    resetForm() {
        document.getElementById('memberForm').reset();
        this.currentMember = null;
        this.isEditing = false;
        this.setDefaultDates();
        this.clearValidation();
    }

    clearValidation() {
        const inputs = document.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const feedback = input.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.remove();
            }
        });
    }

    validateForm() {
        const form = document.getElementById('memberForm');
        const formData = new FormData(form);
        let isValid = true;
        
        this.clearValidation();
        
        // Required fields validation
        const requiredFields = ['nombre', 'apellido', 'dni', 'email', 'telefono', 'fecha_nacimiento', 'direccion', 'tipo_membresia', 'fecha_inicio', 'fecha_vencimiento'];
        
        requiredFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            const value = formData.get(field);
            
            if (!value || value.trim() === '') {
                this.showFieldError(input, 'Este campo es requerido');
                isValid = false;
            }
        });
        
        // Email validation
        const email = formData.get('email');
        if (email && !this.isValidEmail(email)) {
            const emailInput = form.querySelector('[name="email"]');
            this.showFieldError(emailInput, 'Por favor ingrese un email válido');
            isValid = false;
        }
        
        // DNI validation (basic)
        const dni = formData.get('dni');
        if (dni && (dni.length < 7 || dni.length > 8)) {
            const dniInput = form.querySelector('[name="dni"]');
            this.showFieldError(dniInput, 'El DNI debe tener entre 7 y 8 dígitos');
            isValid = false;
        }
        
        // Date validation
        const fechaInicio = formData.get('fecha_inicio');
        const fechaVencimiento = formData.get('fecha_vencimiento');
        
        if (fechaInicio && fechaVencimiento) {
            const inicio = new Date(fechaInicio);
            const vencimiento = new Date(fechaVencimiento);
            
            if (vencimiento <= inicio) {
                const vencimientoInput = form.querySelector('[name="fecha_vencimiento"]');
                this.showFieldError(vencimientoInput, 'La fecha de vencimiento debe ser posterior a la fecha de inicio');
                isValid = false;
            }
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(input, message) {
        input.classList.add('is-invalid');
        
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        
        input.parentNode.appendChild(feedback);
    }

    async saveMember() {
        if (!this.validateForm()) {
            return;
        }
        
        const form = document.getElementById('memberForm');
        const formData = new FormData(form);
        
        const memberData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            dni: formData.get('dni'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            fecha_nacimiento: formData.get('fecha_nacimiento'),
            direccion: formData.get('direccion'),
            tipo_membresia: formData.get('tipo_membresia'),
            fecha_inicio: formData.get('fecha_inicio'),
            fecha_vencimiento: formData.get('fecha_vencimiento'),
            estado: formData.get('estado') || 'activo'
        };
        
        try {
            this.showLoading(true);
            const saveBtn = document.getElementById('saveMemberBtn');
            saveBtn.classList.add('btn-loading');
            
            const url = this.isEditing ? `/api/members/${this.currentMember.id}` : '/api/members';
            const method = this.isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showAlert('success', data.message);
                const modal = bootstrap.Modal.getInstance(document.getElementById('memberModal'));
                modal.hide();
                await this.loadMembers();
            } else {
                this.showAlert('error', data.error);
            }
        } catch (error) {
            console.error('Error saving member:', error);
            this.showAlert('error', 'Error de conexión al guardar el miembro');
        } finally {
            this.showLoading(false);
            const saveBtn = document.getElementById('saveMemberBtn');
            saveBtn.classList.remove('btn-loading');
        }
    }

    async editMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (member) {
            this.openMemberModal(member);
        }
    }

    async deleteMember(memberId, memberName) {
        if (!confirm(`¿Estás seguro de que deseas eliminar a ${memberName}?`)) {
            return;
        }
        
        try {
            this.showLoading(true);
            const response = await fetch(`/api/members/${memberId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showAlert('success', data.message);
                await this.loadMembers();
            } else {
                this.showAlert('error', data.error);
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            this.showAlert('error', 'Error de conexión al eliminar el miembro');
        } finally {
            this.showLoading(false);
        }
    }

    showAlert(type, message) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const alertHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" id="${alertId}" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
}

// Initialize the gym manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gymManager = new GymManager();
});
