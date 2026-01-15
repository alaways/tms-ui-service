import Swal from 'sweetalert2';
export const showNotification = (message: string, type: 'success' | 'error') => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });

    toast.fire({
        icon: type,
        title: message,
        padding: '10px 20px',
    });
};
