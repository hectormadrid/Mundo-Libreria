// menu_admin.js - Versión corregida
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarBtn = document.querySelector('.sidebar-toggle');
        this.arrowButtons = document.querySelectorAll('.arrow');
        this.isMobile = window.innerWidth < 768;
        
        this.init();
    }

    init() {
        // Botón para toggle del sidebar
        if (this.sidebarBtn) {
            this.sidebarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        // Flechas para submenús
        this.arrowButtons.forEach(arrow => {
            arrow.addEventListener('click', (e) => {
                this.toggleSubmenu(e);
            });
        });

        // Cerrar sidebar al hacer click fuera en móviles
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });

        // Ajustar sidebar en resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Estado inicial
        this.setInitialState();
        
        console.log('Sidebar Manager iniciado correctamente');
        console.log('Modo:', this.isMobile ? 'Móvil' : 'Desktop');
    }

    toggleSidebar() {
        if (this.isMobile) {
            // En móviles
            this.sidebar.classList.toggle('open');
        } else {
            // En desktop - solo toggle de close (contraído/expandido)
            this.sidebar.classList.toggle('close');
        }
        
        this.saveState();
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        // Esta función ahora se maneja con CSS puro
        console.log('Sidebar estado:', this.sidebar.classList.toString());
    }

    toggleSubmenu(e) {
        e.stopPropagation();
        const arrowParent = e.target.closest('.has-submenu');
        if (arrowParent) {
            arrowParent.classList.toggle('showMenu');
        }
    }

    handleClickOutside(e) {
        if (this.isMobile && this.sidebar.classList.contains('open')) {
            if (!this.sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
                this.sidebar.classList.remove('open');
                this.saveState();
            }
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (wasMobile !== this.isMobile) {
            console.log('Cambio de modo:', this.isMobile ? 'Móvil' : 'Desktop');
            this.setInitialState();
        }
    }

    saveState() {
        if (this.isMobile) {
            localStorage.setItem('sidebarMobileOpen', this.sidebar.classList.contains('open'));
        } else {
            localStorage.setItem('sidebarDesktopClosed', this.sidebar.classList.contains('close'));
        }
    }

    setInitialState() {
        if (this.isMobile) {
            // Mobile: siempre empezar cerrado
            this.sidebar.classList.remove('open', 'close');
            const wasOpen = localStorage.getItem('sidebarMobileOpen') === 'true';
            if (wasOpen) {
                this.sidebar.classList.add('open');
            }
        } else {
            // Desktop: estado según preferencia guardada
            this.sidebar.classList.remove('open');
            const wasClosed = localStorage.getItem('sidebarDesktopClosed') === 'true';
            if (wasClosed) {
                this.sidebar.classList.add('close');
            } else {
                this.sidebar.classList.remove('close');
            }
        }
        
        this.updateToggleIcon();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const sidebarManager = new SidebarManager();
    
    // Hacer accesible globalmente si es necesario
    window.sidebarManager = sidebarManager;
    
    // Actualizar hora
    function updateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = now.toLocaleDateString('es-ES', options);
        }
    }
    
    updateTime();
    setInterval(updateTime, 60000);
});