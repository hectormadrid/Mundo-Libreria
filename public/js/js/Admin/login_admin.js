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
            const card = document.querySelector('.slide-down');
            setTimeout(() => {
                card.style.animation = 'slideDown 1s ease-out forwards';
            }, 200);
        });

        // Efecto de teclado seguro
        let keySequence = '';
        document.addEventListener('keydown', function(e) {
            keySequence += e.key;
            if (keySequence.includes('admin')) {
                document.body.style.filter = 'hue-rotate(180deg)';
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 1000);
                keySequence = '';
            }
            if (keySequence.length > 10) {
                keySequence = keySequence.slice(-5);
            }
        });

        // Efecto de seguridad en inputs
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', function() {
                this.style.boxShadow = `
                    0 0 0 4px rgba(49, 130, 206, 0.3),
                    0 0 30px rgba(49, 130, 206, 0.2),
                    0 10px 25px rgba(0, 0, 0, 0.1)
                `;
            });
            
            input.addEventListener('blur', function() {
                this.style.boxShadow = '';
            });
            
            // Efecto de escritura
            input.addEventListener('input', function() {
                this.style.borderColor = '#10B981';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 200);
            });
        });

        // Efecto de ripple premium en el botón
        document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.8s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = ripple.style.height = '100px';
            ripple.style.marginLeft = ripple.style.marginTop = '-50px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 800);
        });

        // Animación de ripple mejorada
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(6);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
