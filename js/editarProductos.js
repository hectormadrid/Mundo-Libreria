class ProductEditModal {
    static modal = null;
    static form = null;
    static btnCancelar = null;
    static imagenInput = null;
    static imagenActualContainer = null;
    static imagenActual = null;
    static submitBtn = null;

    static init() {
        this.modal = document.getElementById("modalEditar");
        this.form = document.getElementById("formEditarProducto");
        this.btnCancelar = document.getElementById("btnCancelarEdicion");
        this.imagenInput = document.getElementById("editarImagen");
        this.imagenActualContainer = document.getElementById("imagenActualContainer");
        this.imagenActual = document.getElementById("imagenActual");
        this.submitBtn = this.form?.querySelector('button[type="submit"]');

        if (!this.modal || !this.form) {
            console.error("Error: Elementos esenciales del modal no encontrados");
            return;
        }

        this.btnCancelar?.addEventListener('click', () => this.close());

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

    static open(productData) {
        try {
            if (!this.modal) throw new Error("Modal no inicializado. ¿Llamaste a ProductEditModal.init()?");

            let product;
            if (typeof productData === 'string') {
                try {
                    product = JSON.parse(productData.replace(/&quot;/g, '"'));
                } catch (e) {
                    console.error("Error parsing product data:", e);
                    throw new Error("Datos del producto corruptos");
                }
            } else {
                product = productData;
            }

            if (!product || !product.id || !product.nombre) {
                throw new Error("Datos del producto incompletos");
            }

            // Llenar formulario
            document.getElementById("editarId").value = product.id;
            document.getElementById("editarNombre").value = product.nombre;
            document.getElementById("editarPrecio").value = product.precio;
            document.getElementById("editarStock").value = product.stock || product.Stock || 0;
            document.getElementById("editarDescripcion").value = product.descripcion || "";
            document.getElementById("editarCategoria").value = product.categoria || "";
            document.getElementById("editarEstado").value = product.estado || "Activo";

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
                text: 'No se pudieron cargar los datos del producto',
                confirmButtonColor: '#d33'
            });
        }
    }

    static close() {
        this.modal.classList.add("hidden");
        this.form.reset();
    }

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
            if (typeof window.reloadProductTable === 'function') {
                window.reloadProductTable();
            } else {
                location.reload();
            }

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