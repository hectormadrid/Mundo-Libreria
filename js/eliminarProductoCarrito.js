function eliminarDelCarrito(idProducto) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
            return;
        }

        // Crear FormData para enviar el ID del producto
        const formData = new FormData();
        formData.append('id_producto', idProducto);

        // Enviar solicitud al servidor
        fetch('Eliminar_Producto_Carrito.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Eliminar la fila de la tabla
                const itemRow = document.getElementById('item-' + idProducto);
                if (itemRow) {
                    itemRow.remove();
                }
                
                // Mostrar mensaje de éxito
                alert('Producto eliminado del carrito');
                
                // Recargar la página para actualizar el total
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al eliminar el producto');
        });
    }