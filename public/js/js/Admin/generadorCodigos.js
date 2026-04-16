document.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById('product-select');
    const barcodeContainer = document.getElementById('barcode-container');
    const productNameEl = document.getElementById('product-name');
    const productPriceEl = document.getElementById('product-price');
    const barcodeEl = document.getElementById('barcode');
    const btnPrint = document.getElementById('btnPrint');

    if (!productSelect) return;

    productSelect.addEventListener('change', async (e) => {
        const productId = e.target.value;

        if (!productId) {
            barcodeContainer.classList.add('hidden');
            btnPrint.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`obtener_producto_detalle.php?id=${productId}`);
            if (!response.ok) {
                throw new Error('Error al obtener los detalles del producto.');
            }
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'No se pudieron cargar los datos.');
            }

            const product = result.data;

            // Mostrar contenedor y botón de imprimir
            barcodeContainer.classList.remove('hidden');
            btnPrint.classList.remove('hidden');

            // Poblar datos
            productNameEl.textContent = product.nombre;
            productPriceEl.textContent = `$${parseFloat(product.precio).toFixed(0)}`;

            // Generar código de barras
            if (product.codigo_barras) {
                JsBarcode(barcodeEl, product.codigo_barras, {
                    format: 'CODE128',
                    displayValue: true,
                    fontSize: 14,
                    width: 2,
                    height: 80,
                });
            } else {
                // Manejar si no hay código de barras
                barcodeEl.innerHTML = ''; // Limpiar SVG anterior
                productNameEl.textContent = `${product.nombre} (Sin código de barras)`;
                productPriceEl.textContent = '';
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al cargar la información del producto.');
            barcodeContainer.classList.add('hidden');
            btnPrint.classList.add('hidden');
        }
    });

    btnPrint.addEventListener('click', () => {
        window.print();
    });
});
