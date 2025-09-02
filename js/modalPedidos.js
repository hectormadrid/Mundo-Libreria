
$(document).ready(function () {

    // Abrir modal con AJAX
    $(".ver-detalle").click(function () {
        let id = $(this).data("id");

        // Mostrar modal y placeholder
        $("#detalleModal").removeClass("hidden");
        $("#detalleContenido").html("<p class='text-gray-500 text-center'>Cargando...</p>");

        // Llamada AJAX al backend
        $.get("pedido_detalle.php", { id: id }, function (data) {
            $("#detalleContenido").html(data);
        }).fail(function () {
            $("#detalleContenido").html("<p class='text-red-500 text-center'>Error al cargar el detalle</p>");
        });
    });

    // Cerrar modal al hacer clic en el botón
    $("#cerrarModal").click(function () {
        $("#detalleModal").addClass("hidden");
    });

    // Cerrar modal si se hace clic afuera del contenido
    $(document).on("click", function (e) {
        if ($(e.target).is("#detalleModal")) {
            $("#detalleModal").addClass("hidden");
        }
    });
});
