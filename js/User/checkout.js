 document.querySelectorAll('.payment-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remover selección anterior
                document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
                
                // Agregar selección actual
                this.classList.add('selected');
                
                // Actualizar input hidden
                const method = this.dataset.method;
                document.getElementById('selectedPaymentMethod').value = method;
                
                // Feedback visual
                const icon = this.querySelector('i');
                icon.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 200);
            });
        });

        // Seleccionar método por defecto
        document.querySelector('.payment-card[data-method="transferencia"]').classList.add('selected');

        // Validación de formulario mejorada
        document.getElementById('checkoutForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos requeridos
            const requiredFields = this.querySelectorAll('input[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#EF4444';
                    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                } else {
                    field.style.borderColor = '#10B981';
                    field.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }
            });

            if (!isValid) {
                Swal.fire({
                    icon: 'error',
                    title: 'Campos incompletos',
                    text: 'Por favor completa todos los campos requeridos',
                    confirmButtonColor: '#3182CE'
                });
                return;
            }

            // Validar email
            const email = this.querySelector('input[type="email"]');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Email inválido',
                    text: 'Por favor ingresa un email válido',
                    confirmButtonColor: '#3182CE'
                });
                return;
            }

            // Confirmar pedido
            Swal.fire({
                title: '¿Confirmar pedido?',
                text: 'Vas a procesar el pago por $63.500',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#48BB78',
                cancelButtonColor: '#EF4444',
                confirmButtonText: '<i class="fas fa-check mr-2"></i>Sí, confirmar',
                cancelButtonText: '<i class="fas fa-times mr-2"></i>Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Mostrar loading
                    Swal.fire({
                        title: 'Procesando pago...',
                        html: 'Por favor espera mientras procesamos tu pedido',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Simular procesamiento (aquí submitirías el formulario real)
                    setTimeout(() => {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Pedido confirmado!',
                            text: 'Tu pedido ha sido procesado exitosamente',
                            confirmButtonColor: '#48BB78'
                        }).then(() => {
                            // this.submit(); // Descomentar para enviar el formulario real
                        });
                    }, 3000);
                }
            });
        });

        // Animaciones de entrada
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Aplicar observador a elementos con animación
        document.querySelectorAll('.fade-in-up, .slide-in-right').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = el.classList.contains('slide-in-right') ? 'translateX(30px)' : 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });

        // Aplicar cupón de descuento
      
        // Formatear inputs de teléfono y RUT
        document.querySelector('input[name="telefono"]').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.startsWith('56')) {
                    value = value.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '+$1 $2 $3 $4');
                } else {
                    value = value.replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2 $3');
                }
            }
            e.target.value = value;
        });

        document.querySelector('input[name="rut"]').addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
            if (value.length > 1) {
                value = value.replace(/^(\d{1,8})([0-9K])$/, '$1-$2');
            }
            e.target.value = value;
        });

        // Validación en tiempo real
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim()) {
                    this.style.borderColor = '#10B981';
                    this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                } else {
                    this.style.borderColor = '#EF4444';
                    this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                }
            });

            input.addEventListener('focus', function() {
                this.style.borderColor = '#3182CE';
                this.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)';
            });
        });

        // Autocompletar datos para demo
        function autoFillDemo() {
            document.querySelector('input[name="nombre"]').value = 'Juan Pérez González';
            document.querySelector('input[name="correo"]').value = 'juan.perez@email.com';
            document.querySelector('input[name="telefono"]').value = '+56 9 1234 5678';
            document.querySelector('input[name="rut"]').value = '12345678-9';
            document.querySelector('input[name="direccion"]').value = 'Av. Providencia 1234, Depto. 56';
            document.querySelector('input[name="ciudad"]').value = 'Santiago';
            document.querySelector('input[name="region"]').value = 'Metropolitana';
            document.querySelector('input[name="codigo_postal"]').value = '7500000';
        }

        // Agregar botón de demo (solo para pruebas)
        const demoButton = document.createElement('button');
        demoButton.type = 'button';
        demoButton.className = 'fixed bottom-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors z-50';
        demoButton.innerHTML = '<i class="fas fa-fill-drip mr-2"></i>Demo';
        demoButton.onclick = autoFillDemo;
        document.body.appendChild(demoButton);

        // Efectos de hover para botones
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Lazy loading para imágenes (si las hay)
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        // Notificación de bienvenida
        setTimeout(() => {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });

            Toast.fire({
                icon: 'info',
                title: '¡Bienvenido al checkout!',
                text: 'Completa tus datos para finalizar la compra'
            });
        }, 1000);

        // Función para guardar progreso en localStorage
        function saveProgress() {
            const formData = new FormData(document.getElementById('checkoutForm'));
            const data = Object.fromEntries(formData);
            data.paymentMethod = document.getElementById('selectedPaymentMethod').value;
            localStorage.setItem('checkoutProgress', JSON.stringify(data));
        }

        // Función para cargar progreso guardado
        function loadProgress() {
            const saved = localStorage.getItem('checkoutProgress');
            if (saved) {
                const data = JSON.parse(saved);
                Object.keys(data).forEach(key => {
                    if (key === 'paymentMethod') {
                        document.getElementById('selectedPaymentMethod').value = data[key];
                        document.querySelector(`[data-method="${data[key]}"]`).classList.add('selected');
                    } else {
                        const input = document.querySelector(`[name="${key}"]`);
                        if (input) input.value = data[key];
                    }
                });
            }
        }

        // Guardar progreso cada vez que se modifica un campo
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', saveProgress);
        });

        // Cargar progreso al iniciar
        loadProgress();

        // Limpiar progreso guardado al enviar el formulario exitosamente
        document.getElementById('checkoutForm').addEventListener('submit', function() {
            localStorage.removeItem('checkoutProgress');
        });
