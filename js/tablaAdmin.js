class ProductosDataTable {
    constructor(tableId, options = {}) {
        this.table = $(tableId);
        this.options = options;
        this.init();
    }

    init() {
        
        
        this.dataTable = this.table.DataTable({
            ajax: {
                url: '../pages/obtener_productos.php',
                type: "GET",
                dataSrc: "data",
                error: function(xhr, error, thrown) {
                    console.error('Error en AJAX:', xhr.responseText);
                    alert('Error al cargar los datos. Ver consola para detalles.');
                }
            },
            columns: this.getColumns(),
            language: this.getLanguageSettings(),
            dom: "Bfrtip",
            buttons: this.getButtons(),
            responsive: true,
            autoWidth: false,
            ...this.options.customSettings
        });
    }

    getColumns() {
        const baseUrl = window.location.origin + '/Mundo-Libreria';
        
        return [
            { data: "id" },
            { data: "nombre" },
            {
                data: "precio",
                render: $.fn.dataTable.render.number(",", ".", 2, "$")
            },
            { data: "descripcion" },
            {
                data: "estado",
                render: (data) => {
                    const color = data === "Activo" ? 
                        "bg-red-100 text-red-800" : 
                       "bg-green-100 text-green-800" ;
                    return `<span class="px-2 py-1 rounded-full ${color}">${data}</span>`;
                }
            },
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
                }
            },
            { 
                data: "fecha_creacion",
                render: (data) => data ? new Date(data).toLocaleDateString() : ''
            }
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
                previous: "Anterior"
            }
        };
    }

    getButtons() {
        return [
            {
                extend: "excel",
                text: '<i class="bx bx-file-blank mr-1"></i> Excel',
                className: "bg-green-500 hover:bg-green-600 text-white"
            },
            {
                extend: "pdf",
                text: '<i class="bx bxs-file-pdf mr-1"></i> PDF',
                className: "bg-red-500 hover:bg-red-600 text-white"
            },
            {
                extend: "print",
                text: '<i class="bx bx-printer mr-1"></i> Imprimir',
                className: "bg-blue-500 hover:bg-blue-600 text-white"
            }
        ];
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
document.addEventListener("DOMContentLoaded", () => {
    if ($('#productosTable').length) {
        window.productosTable = new ProductosDataTable("#productosTable", {
            customSettings: {
                order: [[0, 'desc']] // Ordenar por ID descendente
            }
        });
    }
});

console.log('URL solicitada:', window.location.origin + '/Mundo-Libreria/php/obtener_productos.php');