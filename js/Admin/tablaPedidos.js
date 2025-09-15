$(document).ready(function () {
    $('#pedidosTable').DataTable({
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        dom: 'Bfrtip',
        buttons: [
            { extend: 'copy', text: '📋 Copiar' },
            { extend: 'excel', text: '📊 Excel' },
            { extend: 'pdf', text: '📄 PDF' },
            { extend: 'print', text: '🖨️ Imprimir' }
        ],
        pageLength: 10,
        order: [[5, 'desc']] // Ordenar por fecha descendente
    });
});
$