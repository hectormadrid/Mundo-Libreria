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
          console.error("Error en AJAX:", xhr.responseText,error);
          alert("Error al cargar los datos. Ver consola para detalles.");
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
        render: $.fn.dataTable.render.number(",", "$"),
      },
      { data: "descripcion" },
      {
    data: "categoria",
    render: function(data) {
        const colores = {
            'Libreria': 'bg-blue-100 text-blue-800',
            'Oficina': 'bg-green-100 text-green-800',
            'Papeleria': 'bg-purple-100 text-purple-800'
        };
        const clase = colores[data] || 'bg-gray-100 text-gray-800';
        return `<span class="px-2 py-1 rounded-full text-xs ${clase}">${data}</span>`;
    }
},
      {
        data: "estado",
        render: (data) => {
          const color =
            data === "Activo"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800";
          return `<span class="px-2 py-1 rounded-full ${color}">${data}</span>`;
        },
      },
      {
        data: "fecha_creacion",
        render: (data) => (data ? new Date(data).toLocaleDateString() : ""),
      },
      // --- Nueva columna para botones ---
      {
    data: "id",
    render: function(data, type, row) {
        // Escapar comillas correctamente
        const safeData = JSON.stringify(row)
            .replace(/'/g, "\\'")
            .replace(/"/g, '&quot;');
        
        return `
            <button onclick="ProductEditModal.open('${safeData}')"
                    class="px-3 py-1 bg-blue-500 text-white rounded">
                <i class="bx bx-edit"></i> Editar
            </button>
        `;
    },

        catch(error) {
          console.error("Error al generar botón:", error);
          return "Error";
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

  reload() {
    this.dataTable.ajax.reload(null, false);
  }
}

// Inicialización condicional
// En tu archivo JS principal:
document.addEventListener("DOMContentLoaded", () => {
  if ($("#productosTable").length) {
    window.productosTable = new ProductosDataTable("#productosTable");
    console.log("DataTable inicializado:", window.productosTable); // 👈 Verifica
  }
});
