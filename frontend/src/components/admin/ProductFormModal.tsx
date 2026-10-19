import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminProduct, Family } from '../../lib/types';
import { onImageError, productImage } from '../../lib/assets';
import { toastSuccess } from '../../lib/alerts';
import { useCategories } from '../../hooks/useCatalog';
import { FormError, Modal, Spinner } from '../ui';

const EMPTY = {
  nombre: '',
  codigoBarras: '',
  precio: '',
  stock: '',
  descripcion: '',
  marca: '',
  color: '',
  idCategoria: '',
  idFamilia: '',
  estado: 'activo',
};

function randomBarcode() {
  return 'ML' + String(Math.floor(Math.random() * 1e11)).padStart(11, '0');
}

export function ProductFormModal({ product, open, onClose }: { product: AdminProduct | null; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [form, setForm] = useState(EMPTY);
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      product
        ? {
            nombre: product.nombre,
            codigoBarras: product.codigoBarras ?? '',
            precio: String(product.precio),
            stock: String(product.stock),
            descripcion: product.descripcion,
            marca: product.marca ?? '',
            color: product.color ?? '',
            idCategoria: product.idCategoria ? String(product.idCategoria) : '',
            idFamilia: product.idFamilia ? String(product.idFamilia) : '',
            estado: product.estado,
          }
        : { ...EMPTY, codigoBarras: randomBarcode() },
    );
    setImagen(null);
    setFormError(null);
  }, [open, product]);

  useEffect(() => {
    if (!imagen) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imagen);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imagen]);

  const families = useQuery({
    queryKey: ['families', 'id', form.idCategoria],
    queryFn: () => api<Family[]>(`/families?categoria_id=${form.idCategoria}`),
    enabled: form.idCategoria !== '',
  });

  const save = useMutation({
    mutationFn: () => {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (imagen) data.append('imagen', imagen);
      return api<AdminProduct>(product ? `/admin/products/${product.id}` : '/admin/products', { method: 'POST', body: data });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['product'] });
      toastSuccess(product ? 'Producto actualizado' : 'Producto creado');
      onClose();
    },
    onError: (error) => setFormError(error.message),
  });

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (imagen && imagen.size > 2 * 1024 * 1024) return setFormError('La imagen supera el límite de 2MB.');
    save.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title={product ? `Editar producto #${product.id}` : 'Nuevo producto'} size="xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="p-nombre">Nombre *</label>
            <input id="p-nombre" className="input" required value={form.nombre} onChange={set('nombre')} />
          </div>
          <div>
            <label className="label" htmlFor="p-codigo">Código de barras</label>
            <div className="flex gap-2">
              <input id="p-codigo" className="input font-mono" value={form.codigoBarras} onChange={set('codigoBarras')} placeholder="Se genera si se deja vacío" />
              <button type="button" className="btn-ghost px-3" onClick={() => setForm((f) => ({ ...f, codigoBarras: randomBarcode() }))} title="Generar código" aria-label="Generar código de barras">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="p-precio">Precio (CLP) *</label>
            <input id="p-precio" type="number" min="0" step="1" className="input" required value={form.precio} onChange={set('precio')} />
          </div>
          <div>
            <label className="label" htmlFor="p-stock">Stock *</label>
            <input id="p-stock" type="number" min="0" step="1" className="input" required value={form.stock} onChange={set('stock')} />
          </div>
          <div>
            <label className="label" htmlFor="p-marca">Marca</label>
            <input id="p-marca" className="input" placeholder="Ej: Faber-Castell" value={form.marca} onChange={set('marca')} />
          </div>
          <div>
            <label className="label" htmlFor="p-color">Color</label>
            <input id="p-color" className="input" placeholder="Ej: Azul" value={form.color} onChange={set('color')} />
          </div>
          <div>
            <label className="label" htmlFor="p-categoria">Categoría *</label>
            <select
              id="p-categoria"
              className="input"
              required
              value={form.idCategoria}
              onChange={(e) => setForm((f) => ({ ...f, idCategoria: e.target.value, idFamilia: '' }))}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-familia">Familia</label>
            <select id="p-familia" className="input" value={form.idFamilia} onChange={set('idFamilia')} disabled={!form.idCategoria || families.isPending}>
              <option value="">{form.idCategoria ? 'Sin familia' : 'Selecciona una categoría primero'}</option>
              {families.data?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-estado">Estado</label>
            <select id="p-estado" className="input" value={form.estado} onChange={set('estado')}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-imagen">Imagen</label>
            <input
              id="p-imagen"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-lib-blue hover:file:bg-blue-100"
              onChange={(e) => setImagen(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-gray-500">JPG, PNG o WEBP. Máximo 2MB.</p>
          </div>
        </div>

        {(preview || product?.imagen) && (
          <div className="flex items-center gap-3">
            <img src={preview ?? productImage(product?.imagen)} onError={onImageError} alt="" className="h-24 w-24 rounded-lg border object-contain p-1" />
            <span className="text-sm text-gray-500">{preview ? 'Nueva imagen' : 'Imagen actual'}</span>
          </div>
        )}

        <div>
          <label className="label" htmlFor="p-descripcion">Descripción</label>
          <textarea id="p-descripcion" rows={3} className="input" value={form.descripcion} onChange={set('descripcion')} />
        </div>

        <FormError message={formError} />
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner className="h-4 w-4" />} Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
