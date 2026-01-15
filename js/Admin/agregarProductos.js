document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const btnAgregar = document.getElementById("btnAgregarProducto");
  const btnCancelar = document.getElementById("btnCancelar");
  const formProducto = document.getElementById("formAgregarProducto");
  const modal = document.getElementById("modalAgregar");
  const fileInput = document.querySelector('input[name="imagen"]');
  const submitBtn = formProducto.querySelector('button[type="submit"]');

  // --- NUEVO: Elementos para dropdowns dinámicos ---
  const categoriaSelect = formProducto.querySelector('select[name="id_categoria"]');
  const familiaSelect = formProducto.querySelector('select[name="id_familia"]');
  // --- FIN NUEVO ---

  if (!btnAgregar || !btnCancelar || !formProducto || !modal || !fileInput) {
    console.error("Error: Elementos del formulario no encontrados");
    return;
  }

  // --- NUEVO: Lógica para dropdowns dinámicos ---
  categoriaSelect.addEventListener('change', async function() {
    const categoriaId = this.value;
    familiaSelect.innerHTML = '<option value="">Cargando...</option>'; // Placeholder

    if (!categoriaId) {
        familiaSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
        familiaSelect.disabled = true;
        return;
    }

    try {
        const response = await fetch(`obtener_familias_por_categoria.php?categoria_id=${categoriaId}`);
        if (!response.ok) {
            throw new Error('Error al cargar las familias.');
        }
        const familias = await response.json();

        familiaSelect.innerHTML = '<option value="">-- Opcional --</option>'; // Reset
        if (familias.length > 0) {
            familias.forEach(familia => {
                const option = new Option(familia.nombre, familia.id);
                familiaSelect.add(option);
            });
            familiaSelect.disabled = false;
        } else {
            familiaSelect.innerHTML = '<option value="">No hay familias en esta categoría</option>';
            familiaSelect.disabled = true;
        }
    } catch (error) {
        console.error('Error:', error);
        familiaSelect.innerHTML = '<option value="">Error al cargar</option>';
        familiaSelect.disabled = true;
    }
  });
  // --- FIN NUEVO ---

  btnAgregar.addEventListener("click", () => {
      // Resetear el form y los selects al abrir
      formProducto.reset();
      familiaSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
      familiaSelect.disabled = true;
      modal.classList.remove("hidden");
  });

  btnCancelar.addEventListener("click", () => {
    modal.classList.add("hidden");
    formProducto.reset();
    // También resetear el select de familia al cancelar
    familiaSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
    familiaSelect.disabled = true;
  });

  fileInput.addEventListener("change", function () {
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

  formProducto.addEventListener("submit", async function (e) {
    e.preventDefault();

    const requiredFields = [
      formProducto.querySelector('input[name="nombre"]'),
      formProducto.querySelector('input[name="imagen"]'),
      formProducto.querySelector('input[name="precio"]'),
      formProducto.querySelector('textarea[name="descripcion"]'),
      formProducto.querySelector('select[name="id_categoria"]'),
      formProducto.querySelector('input[name="Stock"]'),
      formProducto.querySelector('select[name="estado"]'),
      
    ];  

    for (let field of requiredFields) {
      if (!field.value.trim()) {
        await Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: `Por favor completa el campo: ${field.name}`,
          confirmButtonColor: "#d33",
        });
        field.focus();
        return;
      }
    }

    const estado = document.querySelector('select[name="estado"]').value;
    if (!["Activo", "Inactivo"].includes(estado)) {
      await Swal.fire({
        icon: "warning",
        title: "Estado inválido",
        text: "Selecciona un estado válido",
        confirmButtonColor: "#d33",
      });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      'Enviando... <i class="bx bx-loader-alt animate-spin"></i>';

    try {
      const formData = new FormData(this);

      const response = await fetch("agregar_productos.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error en el servidor");

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Producto agregado correctamente",
          confirmButtonColor: "#3085d6",
        });
        $("#productosTable").DataTable().ajax.reload();
        modal.classList.add("hidden");
        formProducto.reset();
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Complete todos los campos correctamente",
        confirmButtonColor: "#d33",
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Guardar";
    }
  });
});