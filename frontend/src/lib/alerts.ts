import Swal from 'sweetalert2';
import { errorMessage } from './api';

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export function toastSuccess(title: string) {
  void toast.fire({ icon: 'success', title });
}

export function toastError(error: unknown) {
  void toast.fire({ icon: 'error', title: typeof error === 'string' ? error : errorMessage(error) });
}

export async function confirmAction(title: string, text: string, confirmText = 'Sí, continuar'): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e53e3e',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function alertSuccess(title: string, text: string, confirmText = 'Aceptar') {
  return Swal.fire({ title, text, icon: 'success', confirmButtonColor: '#3182ce', confirmButtonText: confirmText });
}

export function alertError(error: unknown, title = 'No se pudo completar') {
  return Swal.fire({ title, text: errorMessage(error), icon: 'error', confirmButtonColor: '#3182ce' });
}
