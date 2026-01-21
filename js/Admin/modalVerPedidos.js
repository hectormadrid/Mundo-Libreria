$(document).ready(function () {
    // Abrir modal con AJAX
    $(".ver-detalle").click(function () {
        let id = $(this).data("id");

        $("#detalleModal").removeClass("hidden");
        $("#detalleContenido").html("<p class='text-gray-500 text-center'>Cargando...</p>");

        $.get("/pages/Admin/pedido_detalle.php", { id: id }, function (data) {
            $("#detalleContenido").html(data);
        }).fail(function () {
            $("#detalleContenido").html("<p class='text-red-500 text-center'>Error al cargar el detalle</p>");
        });
    });

    // Cerrar modal
    $("#cerrarModal").click(function () {
        $("#detalleModal").addClass("hidden");
    });

    // Cerrar modal clickeando fuera
    $(document).on("click", function (e) {
        if ($(e.target).is("#detalleModal")) {
            $("#detalleModal").addClass("hidden");
        }
    });
});

