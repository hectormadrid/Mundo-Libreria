document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const btnAgregar = document.getElementById("btnAgregarProducto");
  const btnCancelar = document.getElementById("btnCancelar");
  const formProducto = document.getElementById("formAgregarProducto");
  const modal = document.getElementById("modalAgregar");
  const fileInput = document.querySelector('input[name="imagen"]');
  const submitBtn = formProducto.querySelector('button[type="submit"]');

  // --- NUEVO: Elementos para dropdowns dinámicos y checkbox "sin familia" ---
  const categoriaSelect = formProducto.querySelector('select[name="id_categoria"]');
  const familiaSelect = formProducto.querySelector('select[name="id_familia"]');
  const sinFamiliaCheckbox = document.getElementById("sinFamiliaCheckbox");
  // --- FIN NUEVO ---

  // --- NUEVO: Elementos para código de barras y botón generar ---
  const agregarCodigoBarrasInput = document.getElementById("agregarCodigoBarras");
  const btnGenerarCodigoBarras = document.getElementById("btnGenerarCodigoBarras");
  // --- FIN NUEVO ---

  if (!btnAgregar || !btnCancelar || !formProducto || !modal || !fileInput || !sinFamiliaCheckbox || !agregarCodigoBarrasInput || !btnGenerarCodigoBarras) {
    console.error("Error: Elementos del formulario no encontrados");
    return;
  }

  // --- NUEVO: Función para generar código de barras ---
  const generateBarcode = () => {
    // Generar 11 dígitos aleatorios
    const randomDigits = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const barcode = 'ML' + randomDigits;
    agregarCodigoBarrasInput.value = barcode;
  };
  // --- FIN NUEVO ---

  // --- Lógica para dropdowns dinámicos y checkbox "sin familia" ---
  const updateFamiliaState = async (categoryId) => {
    if (sinFamiliaCheckbox.checked) {
      familiaSelect.innerHTML = '<option value="">Producto sin familia</option>';
      familiaSelect.disabled = true;
      return;
    }

    familiaSelect.innerHTML = '<option value="">Cargando...</option>'; // Placeholder
    familiaSelect.disabled = true;

    if (!categoryId) {
        familiaSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
        return;
    }

    try {
        const response = await fetch(`obtener_familias_por_categoria.php?categoria_id=${categoryId}`);
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
        }
    } catch (error) {
        console.error('Error:', error);
        familiaSelect.innerHTML = '<option value="">Error al cargar</option>';
    }
  };

  categoriaSelect.addEventListener('change', () => updateFamiliaState(categoriaSelect.value));
  
  sinFamiliaCheckbox.addEventListener('change', () => updateFamiliaState(categoriaSelect.value));
  // --- FIN NUEVO ---

  btnAgregar.addEventListener("click", () => {
      // Resetear el form y los selects al abrir
      formProducto.reset();
      sinFamiliaCheckbox.checked = false; // Asegurarse de que esté desmarcado por defecto
      updateFamiliaState(categoriaSelect.value); // Actualizar estado de familia
      generateBarcode(); // Generar código de barras al abrir el modal
      modal.classList.remove("hidden");
  });

  btnCancelar.addEventListener("click", () => {
    modal.classList.add("hidden");
    formProducto.reset();
    sinFamiliaCheckbox.checked = false; // Resetear el checkbox al cancelar
    updateFamiliaState(categoriaSelect.value); // Resetear estado de familia
    agregarCodigoBarrasInput.value = ''; // Limpiar el código de barras al cancelar
  });

  // --- NUEVO: Event listener para el botón generar código de barras ---
  btnGenerarCodigoBarras.addEventListener('click', generateBarcode);
  // --- FIN NUEVO ---

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
    
    // --- NUEVO: Validar si la categoría está seleccionada cuando no es "sin familia"
    if (!sinFamiliaCheckbox.checked && !categoriaSelect.value) {
        await Swal.fire({
            icon: "warning",
            title: "Campo requerido",
            text: "Por favor selecciona una categoría para el producto.",
            confirmButtonColor: "#d33",
        });
        categoriaSelect.focus();
        return;
    }
    // --- FIN NUEVO ---

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

      // --- NUEVO: Si "sin familia" está marcado, asegúrate de que id_familia no se envíe o sea vacío ---
      if (sinFamiliaCheckbox.checked) {
          formData.set('id_familia', ''); // O .delete('id_familia') si prefieres
      }
      // --- FIN NUEVO ---

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
        sinFamiliaCheckbox.checked = false; // Resetear al cerrar
        updateFamiliaState(categoriaSelect.value); // Restablecer estado del dropdown
        agregarCodigoBarrasInput.value = ''; // Limpiar el código de barras al cerrar
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



