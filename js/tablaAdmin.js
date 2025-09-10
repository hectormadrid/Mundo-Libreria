class ProductosDataTable {
  constructor(tableId, options = {}) {
    this.table = $(tableId);
    this.options = options;
    this.init();
  }

  init() {
    this.dataTable = this.table.DataTable({
      ajax: {
        url: "obtener_productos.php",
        type: "GET",
        dataSrc: "data",
        error: function (xhr, error, thrown) {
          console.error("Error en AJAX:", xhr.responseText, error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los productos. Ver consola para más detalles.",
          });
        },
      },
      columns: this.getColumns(),
      language: this.getLanguageSettings(),
      dom: "Bfrtip",
      responsive: true,
      autoWidth: false,
      ...this.options.customSettings,
    });
  }

  getColumns() {
    const baseUrl = window.location.origin + "/Mundo-Libreria";

    return [
      { data: "id" },
      { data: "nombre" },
      {
        data: "imagen",
        render: (data) => {
          if (!data) return '<span class="text-gray-400">Sin imagen</span>';
          const path = `${baseUrl}/uploads/productos/${data}`;
          return `
            <img src="${path}" 
                 alt="Imagen producto" 
                 class="h-12 w-12 object-cover rounded cursor-pointer hover:scale-150 transition-all"
                 onclick="ProductosDataTable.showFullImage('${path}')">
          `;
        },
      },
      {
        data: "precio",
        render: $.fn.dataTable.render.number(".", ",", 0, "$"),
      },
      { data: "descripcion" },
      {
        data: "categoria",
        render: function (data) {
          const colores = {
            Libreria: "bg-blue-100 text-blue-800",
            Oficina: "bg-green-100 text-green-800",
            Papeleria: "bg-purple-100 text-purple-800",
          };
          const clase = colores[data] || "bg-gray-100 text-gray-800";
          return `<span class="px-2 py-1 rounded-full text-xs ${clase}">${data}</span>`;
        },
      },
      { data: "stock" },
      {
        data: "estado",
        render: (data) => {
          const color =
            data === "activo"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800";
          return `<span class="px-2 py-1 rounded-full ${color}">${data}</span>`;
        },
      },
      {
        data: "fecha_creacion",
        render: (data) => (data ? new Date(data).toLocaleDateString() : ""),
      },
      {
        data: "id",
        render: function (data, type, row) {
          try {
            const safeData = JSON.stringify(row)
              .replace(/'/g, "\\'")
              .replace(/"/g, "&quot;");

            return `
              <div class="flex gap-2">
                <button onclick="ProductEditModal.open('${safeData}')"
                        class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow">
                    <i class="bx bx-edit"></i> Editar
                </button>

                <button onclick="ProductosDataTable.confirmDelete(${row.id})"
                        class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow">
                    <i class="bx bx-trash"></i> Eliminar
                </button>

                <button onclick="ProductosDataTable.showDetails('${safeData}')"
                        class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded shadow">
                    <i class="bx bx-show"></i> Ver
                </button>
              </div>
            `;
          } catch (error) {
            console.error("Error al generar botones:", error);
            return '<span class="text-red-500">Error</span>';
          }
        },
        orderable: false,
        searchable: false,
      },
    ];
  }

  getLanguageSettings() {
    return {
      decimal: "",
      emptyTable: "No hay productos registrados",
      info: "Mostrando _START_ a _END_ de _TOTAL_ productos",
      infoEmpty: "Mostrando 0 a 0 de 0 productos",
      infoFiltered: "(filtrado de _MAX_ productos totales)",
      lengthMenu: "Mostrar _MENU_ productos",
      loadingRecords: "Cargando...",
      search: "Buscar:",
      zeroRecords: "No se encontraron productos",
      paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior",
      },
    };
  }

  static showFullImage(src) {
    const modal = `
      <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" 
           onclick="this.remove()">
          <div class="max-w-4xl w-full">
              <img src="${src}" class="w-full h-auto max-h-screen object-contain">
          </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modal);
  }

  static confirmDelete(id) {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`eliminar_producto.php?id=${id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
              window.productosTable.reload();
            } else {
              Swal.fire("Error", data.error || "No se pudo eliminar.", "error");
            }
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error", "Error de conexión.", "error");
          });
      }
    });
  }

  static showDetails(productoJson) {
    const producto = JSON.parse(productoJson.replace(/&quot;/g, '"'));
    Swal.fire({
      title: producto.nombre,
      html: `
        <img src="/Mundo-Libreria/uploads/productos/${producto.imagen}" class="mx-auto mb-3 h-40 object-contain">
        <p><b>Precio:</b> $${producto.precio}</p>
        <p><b>Stock:</b> ${producto.stock}</p>
        <p><b>Categoría:</b> ${producto.categoria}</p>
        <p><b>Estado:</b> ${producto.estado}</p>
        <p><b>Descripción:</b> ${producto.descripcion}</p>
      `,
      confirmButtonText: "Cerrar",
    });
  }

  reload() {
    this.dataTable.ajax.reload(null, false);
  }
}

function updateTime() { const el = document.getElementById('currentTime'); el.textContent = new Date().toLocaleString(); }
updateTime(); setInterval(updateTime, 1000);


// Iniciar DataTable al cargar admin.php
document.addEventListener("DOMContentLoaded", () => {
  if ($("#productosTable").length) {
    window.productosTable = new ProductosDataTable("#productosTable");
    console.log("✅ DataTable inicializado:", window.productosTable);
  }
});
