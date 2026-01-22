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
                    if (itemRow) itemRow.remove();

                    updateCartTotal();

                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'Producto eliminado del carrito',
                        icon: 'success',
                        timer: 1200,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire('Error', data.message || 'No se pudo eliminar el producto', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', 'Ocurrió un error al eliminar el producto', 'error');
            });
        }
    });
}

function updateCartTotal() {
    const items = document.querySelectorAll('[id^="item-"]');
    let total = 0;
    let count = 0;

    items.forEach(item => {
        const subtotalEl = item.querySelector('.subtotal');
        let val = '0';
        if (subtotalEl) {
            val = subtotalEl.dataset.value || subtotalEl.textContent.replace(/\D/g, '') || '0';
        }
        total += parseInt(val, 10) || 0;

        const qty = parseInt(item.dataset.qty || '1', 10) || 0;
        count += qty;
    });

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = '$' + total.toLocaleString('es-CL');

    const summarySubtotalEl = document.getElementById('summary-subtotal');
    if (summarySubtotalEl) summarySubtotalEl.textContent = '$' + total.toLocaleString('es-CL');

    const summaryCountEl = document.getElementById('summary-count');
    if (summaryCountEl) summaryCountEl.textContent = count;

    const cart = document.getElementById('cart-with-items');
    const emptyCart = document.getElementById('empty-cart');
    if (cart && emptyCart) {
        if (items.length === 0) {
            cart.style.display = 'none';
            emptyCart.classList.remove('hidden');
        } else {
            cart.style.display = '';
            emptyCart.classList.add('hidden');
        }
    }
}


// Limpiar carrito (confirm + llamada a endpoint que debes crear)
document.getElementById('clear-cart-btn')?.addEventListener('click', function() {
    Swal.fire({
        title: 'Limpiar carrito',
        text: '¿Deseas eliminar todos los productos del carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            fetch('Limpiar_Carrito.php', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // remover visualmente todos los items
                        document.querySelectorAll('[id^="item-"]').forEach(n => n.remove());
                        updateCartTotal();
                        Swal.fire('Listo', 'Carrito limpiado', 'success');
                    } else {
                        Swal.fire('Error', data.message || 'No se pudo limpiar el carrito', 'error');
                    }
                }).catch(err => {
                    console.error('Error:', err);
                    Swal.fire('Error', 'Ocurrió un error', 'error');
                });
        }
    });
});

// Inicializar animaciones y total
document.addEventListener('DOMContentLoaded', function() {
    updateCartTotal();

    const items = document.querySelectorAll('[id^="item-"]');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.45s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 80);
    });
});





