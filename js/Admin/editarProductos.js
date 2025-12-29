class ProductEditModal {
    static modal = null;
    static form = null;
    static btnCancelar = null;
    static imagenInput = null;
    static imagenActualContainer = null;
    static imagenActual = null;
    static submitBtn = null;
    // --- NUEVO ---
    static categoriaSelect = null;
    static familiaSelect = null;
    // --- FIN NUEVO ---

    static init() {
        this.modal = document.getElementById("modalEditar");
        this.form = document.getElementById("formEditarProducto");
        this.btnCancelar = document.getElementById("btnCancelarEdicion");
        this.imagenInput = document.getElementById("editarImagen");
        this.imagenActualContainer = document.getElementById("imagenActualContainer");
        this.imagenActual = document.getElementById("imagenActual");
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        // --- NUEVO ---
        this.categoriaSelect = document.getElementById("editarCategoria");
        this.familiaSelect = document.getElementById("editarFamilia");
        // --- FIN NUEVO ---

        if (!this.modal || !this.form) {
            console.error("Error: Elementos esenciales del modal no encontrados");
            return;
        }

        this.btnCancelar?.addEventListener('click', () => this.close());

        // --- NUEVO ---
        this.categoriaSelect?.addEventListener('change', () => {
            // Al cambiar la categoría, actualizamos las familias, pero sin una familia preseleccionada.
            this.updateFamiliaDropdown(this.categoriaSelect.value);
        });
        // --- FIN NUEVO ---

        this.imagenInput?.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const validTypes = ["image/jpeg", "image/png", "image/webp"];
                const maxSize = 2 * 1024 * 1024;

                if (!validTypes.includes(file.type)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Formato no válido',
                        text: 'Use JPG, PNG o WEBP',
                        confirmButtonColor: '#d33'
                    });
                    this.value = "";
                } else if (file.size > maxSize) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Imagen demasiado grande',
                        text: 'Máximo 2MB permitido',
                        confirmButtonColor: '#d33'
                    });
                    this.value = "";
                }
            }
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitForm();
        });
    }

    static open(productId) {
        try {
            if (!this.modal) throw new Error("Modal no inicializado.");

            // Obtener datos del producto desde el Map global
            const product = window.productosTable?.productDataMap?.get(productId);
            console.log('Datos de producto al abrir modal:', product); // <-- DEBUG
            if (!product) {
                throw new Error("Datos del producto no encontrados. El mapa de datos puede no estar sincronizado.");
            }

            // Llenar formulario
            document.getElementById("editarId").value = product.id;
            document.getElementById("editarNombre").value = product.nombre;
            document.getElementById("editarMarca").value = product.marca || "";
            document.getElementById("editarColor").value = product.color || "";
            document.getElementById("editarCodigoBarras").value = product.codigo_barras || "";
            document.getElementById("editarPrecio").value = product.precio;
            document.getElementById("editarStock").value = product.stock || product.Stock || 0;
            document.getElementById("editarDescripcion").value = product.descripcion || "";
            this.categoriaSelect.value = product.id_categoria || "";
            const currentStatus = product.estado || "activo"; // Default to 'activo'
            document.getElementById("editarEstado").value = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);

            // Cargar familias dinámicamente y preseleccionar la correcta
            this.updateFamiliaDropdown(product.id_categoria, product.id_familia);

            // Manejar imagen
            if (product.imagen) {
                this.imagenActual.src = `http://localhost/Mundo-Libreria/uploads/productos/${product.imagen}`;
                this.imagenActualContainer.classList.remove("hidden");
            } else {
                this.imagenActualContainer.classList.add("hidden");
            }

            this.modal.classList.remove("hidden");

        } catch (error) {
            console.error("Error al abrir modal:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos del producto: ' + error.message,
                confirmButtonColor: '#d33'
            });
        }
    }

    static close() {
        this.modal.classList.add("hidden");
        this.form.reset();
        // --- NUEVO ---
        this.familiaSelect.innerHTML = '<option value="">-- Sin Familia --</option>'; // Limpiar al cerrar
        // --- FIN NUEVO ---
    }
    
    // --- NUEVO MÉTODO ---
    static async updateFamiliaDropdown(categoryId, selectedFamilyId = null) {
        this.familiaSelect.innerHTML = '<option value="">Cargando...</option>';
        this.familiaSelect.disabled = true;

        if (!categoryId) {
            this.familiaSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
            return;
        }

        try {
            const response = await fetch(`obtener_familias_por_categoria.php?categoria_id=${categoryId}`);
            if (!response.ok) throw new Error('Error al cargar familias');
            
            const familias = await response.json();
            this.familiaSelect.innerHTML = '<option value="">-- Opcional --</option>';

            if (familias.length > 0) {
                familias.forEach(familia => {
                    const option = new Option(familia.nombre, familia.id);
                    this.familiaSelect.add(option);
                });
                this.familiaSelect.disabled = false;
            } else {
                this.familiaSelect.innerHTML = '<option value="">No hay familias en esta categoría</option>';
            }

            if (selectedFamilyId) {
                this.familiaSelect.value = selectedFamilyId;
            }
        } catch (error) {
            console.error("Error al actualizar familias:", error);
            this.familiaSelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    }
    // --- FIN NUEVO MÉTODO ---

    static async submitForm() {
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = 'Guardando... <i class="bx bx-loader-alt animate-spin"></i>';

        try {
            // Validar campos requeridos
            const requiredFields = [
                { id: "editarNombre", name: "Nombre" },
                { id: "editarPrecio", name: "Precio" },
                { id: "editarStock", name: "Stock" },
                { id: "editarCategoria", name: "Categoría" }
            ];

            for (const field of requiredFields) {
                const element = document.getElementById(field.id);
                if (!element.value.trim()) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Campo requerido',
                        text: `Por favor complete el campo ${field.name}`,
                        confirmButtonColor: '#d33'
                    });
                    element.focus();
                    return;
                }
            }

            // Validar tipos de datos
            const precio = parseFloat(document.getElementById("editarPrecio").value);
            const stock = parseInt(document.getElementById("editarStock").value);

            if (isNaN(precio) || precio <= 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Precio inválido',
                    text: 'El precio debe ser un número positivo',
                    confirmButtonColor: '#d33'
                });
                document.getElementById("editarPrecio").focus();
                return;
            }

            if (isNaN(stock) || stock < 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Stock inválido',
                    text: 'El stock debe ser un número entero no negativo',
                    confirmButtonColor: '#d33'
                });
                document.getElementById("editarStock").focus();
                return;
            }

            // Preparar datos del formulario
            const formData = new FormData(this.form);

            // Enviar datos al servidor
            const response = await fetch("editar_productos.php", {
                method: "POST",
                body: formData
            });

            // Procesar respuesta
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error en el servidor");
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Error al actualizar el producto");
            }

            // Mostrar éxito y recargar datos
            await Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Producto actualizado correctamente',
                confirmButtonColor: '#3085d6'
            });

            // Cerrar modal y recargar tabla
            this.close();
            // Recargar la tabla de productos usando el método expuesto globalmente
            window.reloadProductTable();

        } catch (error) {
            console.error("Error al guardar cambios:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `<small>${error.message}</small>`,
                confirmButtonColor: '#d33'
            });
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = "Guardar Cambios";
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    ProductEditModal.init();
    window.ProductEditModal = ProductEditModal;
});