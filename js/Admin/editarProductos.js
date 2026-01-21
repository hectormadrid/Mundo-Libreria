class ProductEditModal {
    static modal = null;
    static form = null;
    static btnCancelar = null;
    static imagenInput = null;
    static imagenActualContainer = null;
    static imagenActual = null;
    static submitBtn = null;
    static checkboxSinFamilia = null; // Corrected variable name
    static categoriaSelect = null;
    static familiaSelect = null;
    

    static init() {
        this.modal = document.getElementById("modalEditar");
        this.form = document.getElementById("formEditarProducto");
        this.btnCancelar = document.getElementById("btnCancelarEdicion");
        this.imagenInput = document.getElementById("editarImagen");
        this.imagenActualContainer = document.getElementById("imagenActualContainer");
        this.imagenActual = document.getElementById("imagenActual");
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        this.categoriaSelect = document.getElementById("editarCategoria");
        this.familiaSelect = document.getElementById("editarFamilia");
        // Corrected ID to match the one in admin.php
        this.checkboxSinFamilia = document.getElementById("editarSinFamiliaCheckbox"); 
       

        if (!this.modal || !this.form || !this.checkboxSinFamilia) {
            console.error("Error: Elementos esenciales del modal de edición no encontrados");
            return;
        }

        this.btnCancelar?.addEventListener('click', () => this.close());
        
        // Moved listeners to init to avoid re-binding
        this.categoriaSelect?.addEventListener('change', () => {
            this.updateFamiliaState(this.categoriaSelect.value);
        });

        this.checkboxSinFamilia.addEventListener('change', () => {
            this.updateFamiliaState(this.categoriaSelect.value);
        });
        
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

            const product = window.productosTable?.productDataMap?.get(productId);
            if (!product) {
                throw new Error("Datos del producto no encontrados.");
            }

            // Fill form
            document.getElementById("editarId").value = product.id;
            document.getElementById("editarNombre").value = product.nombre;
            document.getElementById("editarMarca").value = product.marca || "";
            document.getElementById("editarColor").value = product.color || "";
            document.getElementById("editarCodigoBarras").value = product.codigo_barras || "";
            document.getElementById("editarPrecio").value = product.precio;
            document.getElementById("editarStock").value = product.stock || product.Stock || 0;
            document.getElementById("editarDescripcion").value = product.descripcion || "";
            this.categoriaSelect.value = product.id_categoria || "";
            const currentStatus = product.estado || "activo";
            document.getElementById("editarEstado").value = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
            
            // Set checkbox state FIRST
            this.checkboxSinFamilia.checked = !product.id_familia;

            // Update family dropdown state based on checkbox and category
            this.updateFamiliaState(product.id_categoria, product.id_familia);

            if (product.imagen) {
                this.imagenActual.src = `/uploads/productos/${product.imagen}`;
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
        this.familiaSelect.innerHTML = '<option value="">-- Sin Familia --</option>';
    }
    
    // Unified function to manage family dropdown state
    static async updateFamiliaState(categoryId, selectedFamilyId = null) {
        if (this.checkboxSinFamilia.checked) {
            this.familiaSelect.innerHTML = '<option value="">Producto sin familia</option>';
            this.familiaSelect.disabled = true;
            return;
        }

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

    static async submitForm() {
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = 'Guardando... <i class="bx bx-loader-alt animate-spin"></i>';

        try {
            const formData = new FormData(this.form);

            // If "sin familia" is checked, ensure id_familia is not sent or is empty
            if (this.checkboxSinFamilia.checked) {
                formData.set('id_familia', '');
            }

            const response = await fetch("/pages/Admin/editar_productos.php", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
                throw new Error(errorData.error);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Error al actualizar el producto");
            }

            await Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Producto actualizado correctamente',
                confirmButtonColor: '#3085d6'
            });

            this.close();
            window.reloadProductTable();

        } catch (error) {
            console.error("Error al guardar cambios:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#d33'
            });
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = "Guardar Cambios";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    ProductEditModal.init();
    window.ProductEditModal = ProductEditModal;
});


