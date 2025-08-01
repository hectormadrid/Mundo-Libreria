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

        this.imagenInput?.addEventListener('change', function () {
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
            if (!this.modal) throw new Error("Modal no inicializado. ¿Llamaste a ProductEditModal.init()?");

            const product = typeof productData === 'string'
                ? JSON.parse(productData.replace(/&quot;/g, '"'))
                : productData;

            document.getElementById("editarId").value = product.id;
            document.getElementById("editarNombre").value = product.nombre;
            document.getElementById("editarPrecio").value = product.precio;
            document.getElementById("editarDescripcion").value = product.descripcion || "";
            document.getElementById("editarCategoria").value = product.categoria || "";
            document.getElementById("editarEstado").value = product.estado || "Activo";

            if (product.imagen) {
                const imgPreview = document.getElementById('imagenActual');
                imgPreview.src = `http://localhost/Mundo-Libreria/uploads/productos/${product.imagen}`;
            } else {
                this.imagenActualContainer.classList.add("hidden");
            }

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
            const fields = [
                { id: "editarNombre", name: "nombre" },
                { id: "editarPrecio", name: "precio" },
                { id: "editarDescripcion", name: "descripción" },
                { id: "editarCategoria", name: "categoría" },
                { id: "editarEstado", name: "estado" }
            ];

            for (const field of fields) {
                const el = document.getElementById(field.id);
                if (!el.value.trim()) {
                    await Swal.fire({
                        icon: "warning",
                        title: "Campo requerido",
                        text: `Por favor completa el campo: ${field.name}`,
                        confirmButtonColor: "#d33",
                    });
                    el.focus();
                    throw new Error("Validación incompleta");
                }
            }

            const formData = new FormData(this.form);
            const response = await fetch("editar_productos.php", {
                method: "POST",
                body: formData
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error("Respuesta inválida del servidor: " + text.slice(0, 300));
            }

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Error en el servidor");

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Producto Editado Correctamente',
                    confirmButtonColor: '#3085d6'
                });
                $("#productosTable").DataTable().ajax.reload();
                this.close();
            } else {
                throw new Error(data.error || "Error desconocido");
            }
        } catch (error) {
            if (error.message !== "Validación incompleta") {
                console.error("Error:", error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    confirmButtonColor: '#d33'
                });
            }
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
