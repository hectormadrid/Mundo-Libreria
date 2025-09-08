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

        // Efectos de hover en inputs
        document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateY(0)';
            });
        });
