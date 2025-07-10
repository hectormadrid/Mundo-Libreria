class ProductEditModal {
    static modal = null;
    static form = null;
    static btnCancelar = null;
    static imagenInput = null;
    static imagenActualContainer = null;
    static imagenActual = null;
    static submitBtn = null;

    static init() {
        // Asignar elementos después de que el DOM esté listo
        this.modal = document.getElementById("modalEditar");
        this.form = document.getElementById("formEditarProducto");
        this.btnCancelar = document.getElementById("btnCancelarEdicion");
        this.imagenInput = document.getElementById("editarImagen");
        this.imagenActualContainer = document.getElementById("imagenActualContainer");
        this.imagenActual = document.getElementById("imagenActual");
        this.submitBtn = this.form?.querySelector('button[type="submit"]');

        // Verificar elementos críticos
        if (!this.modal || !this.form) {
            console.error("Error: Elementos esenciales del modal no encontrados");
            return;
        }

        // Configurar eventos
        this.btnCancelar?.addEventListener('click', () => this.close());
        
        this.imagenInput?.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const validTypes = ["image/jpeg", "image/png", "image/webp"];
                const maxSize = 2 * 1024 * 1024;
                
                if (!validTypes.includes(file.type)) {
                    alert("Formato no válido. Use JPG, PNG o WEBP");
                    this.value = "";
                } else if (file.size > maxSize) {
                    alert("La imagen es demasiado grande (Máx. 2MB)");
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
            if (!this.modal) {
                throw new Error("Modal no inicializado. ¿Llamaste a ProductEditModal.init()?");
            }

            const product = typeof productData === 'string' 
                ? JSON.parse(productData.replace(/&quot;/g, '"')) 
                : productData;

            // Llenar formulario
            document.getElementById("editarId").value = product.id;
            document.getElementById("editarNombre").value = product.nombre;
            document.getElementById("editarPrecio").value = product.precio;
            document.getElementById("editarDescripcion").value = product.descripcion || "";
            document.getElementById("editarCategoria").value = product.categoria || "";
            document.getElementById("editarEstado").value = product.estado || "Activo";

            // Mostrar imagen actual si existe
            if (product.imagen) {
                const imgPreview = document.getElementById('imagenActual');
                imgPreview.src = `http://localhost/Mundo-Libreria/uploads/productos/${product.imagen}`;
            } else {
                this.imagenActualContainer.classList.add("hidden");
            }

            // Mostrar modal
            this.modal.classList.remove("hidden");
            
        } catch (error) {
            console.error("Error al abrir modal:", error);
            alert("Error al cargar los datos del producto");
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
            const formData = new FormData(this.form);
            const response = await fetch("../pages/editar_productos.php", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Error en el servidor");

            if (data.success) {
                alert("Producto actualizado correctamente");
                $("#productosTable").DataTable().ajax.reload();
                this.close();
            } else {
                throw new Error(data.error || "Error desconocido");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = "Guardar Cambios";
        }
    }
}

// Inicialización segura
document.addEventListener("DOMContentLoaded", () => {
    ProductEditModal.init();
    window.ProductEditModal = ProductEditModal;
});