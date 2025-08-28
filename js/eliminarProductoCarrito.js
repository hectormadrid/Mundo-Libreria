function eliminarDelCarrito(idProducto) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este producto será eliminado del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('id_producto', idProducto);

            fetch('Eliminar_Producto_Carrito.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const itemRow = document.getElementById('item-' + idProducto);
                    if (itemRow) {
                        itemRow.remove();
                    }

                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'Producto eliminado del carrito',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar el producto',
                    icon: 'error'
                });
            });
        }
    });
}