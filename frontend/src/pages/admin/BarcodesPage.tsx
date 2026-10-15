import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import JsBarcode from 'jsbarcode';
import { Printer } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminProduct } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { ErrorState, PageLoader } from '../../components/ui';

export function BarcodesPage() {
  const products = useQuery({ queryKey: ['admin', 'products'], queryFn: () => api<AdminProduct[]>('/admin/products') });
  const [selectedId, setSelectedId] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const product = products.data?.find((p) => String(p.id) === selectedId);

  useEffect(() => {
    if (product?.codigoBarras && svgRef.current) {
      JsBarcode(svgRef.current, product.codigoBarras, { format: 'CODE128', displayValue: true, fontSize: 14, width: 2, height: 80 });
    }
  }, [product]);

  if (products.isPending) return <PageLoader />;
  if (products.error) return <ErrorState error={products.error} onRetry={() => void products.refetch()} />;

  const sorted = [...products.data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  return (
    <>
      <AdminPageHeader title="Generador de códigos de barras" />
      <div className="card max-w-2xl p-6">
        <label htmlFor="producto" className="label">Selecciona un producto</label>
        <select id="producto" className="input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">-- Elige un producto --</option>
          {sorted.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.codigoBarras ?? 'sin código'})
            </option>
          ))}
        </select>

        {product && (
          <div className="mt-6 flex flex-col items-center gap-4">
            {product.codigoBarras ? (
              <>
                <div className="print-area w-[350px] border border-gray-300 bg-white p-6 text-center">
                  <p className="mb-2 text-lg font-bold">{product.nombre}</p>
                  <svg ref={svgRef} className="mx-auto" />
                  <p className="mt-2 text-xl font-bold">{formatPrice(product.precio)}</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Imprimir etiqueta
                </button>
              </>
            ) : (
              <p className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                Este producto no tiene código de barras. Edítalo en Productos para asignarle uno.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
