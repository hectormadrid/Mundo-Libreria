        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eye-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
                eyeIcon.style.color = '#3182CE';
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
                eyeIcon.style.color = '';
            }
        }

        // Validador de fortaleza de contraseña
        document.getElementById('password').addEventListener('input', function(e) {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrength(strength);
        });

        function calculatePasswordStrength(password) {
            let score = 0;
            if (password.length >= 6) score++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
            if (password.match(/\d/)) score++;
            if (password.match(/[^a-zA-Z\d]/)) score++;
            return score;
        }

        function updatePasswordStrength(strength) {
            const indicators = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
            const colors = ['#E53E3E', '#F6E05E', '#3182CE', '#10B981'];
            const texts = ['Muy débil', 'Débil', 'Media', 'Fuerte'];
            
            indicators.forEach((id, index) => {
                const element = document.getElementById(id);
                if (index < strength) {
                    element.style.backgroundColor = colors[strength - 1];
                } else {
                    element.style.backgroundColor = '#E5E7EB';
                }
            });
            
            const textElement = document.getElementById('strength-text');
            if (strength > 0) {
                textElement.textContent = `Contraseña: ${texts[strength - 1]}`;
                textElement.style.color = colors[strength - 1];
            } else {
                textElement.textContent = 'Ingresa una contraseña';
                textElement.style.color = '#6B7280';
            }
        }

        // Formateo automático del RUT
        document.getElementById('rut').addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9kK]/g, '');
            if (value.length > 1) {
                value = value.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + value.slice(-1);
            }
            e.target.value = value.toUpperCase();
        });

        // Efectos de entrada
        window.addEventListener('load', function() {
            const elements = document.querySelectorAll('.slide-up');
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.animationDelay = `${index * 0.1}s`;
                    el.classList.add('slide-up');
                }, 100);
            });
        });

        // Efecto de partículas en el botón
        document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
            if (!this.querySelector('.ripple')) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple absolute inset-0 rounded-2xl';
                ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s linear';
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });

        // Animación de ripple
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Validación en tiempo real
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.parentElement.style.animation = 'errorShake 0.5s ease-out';
                    this.style.borderColor = '#E53E3E';
                } else {
                    this.style.borderColor = '#10B981';
                }
                
                setTimeout(() => {
                    this.parentElement.style.animation = '';
                }, 500);
            });
        });
  