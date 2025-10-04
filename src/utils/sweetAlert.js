// SweetAlert2 utility functions for DigiWave
import Swal from 'sweetalert2';

export const showConfirmDialog = async (options) => {
  const {
    title = 'Are you sure?',
    text = '',
    confirmButtonText = 'Yes',
    cancelButtonText = 'Cancel',
    icon = 'warning'
  } = options;

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#6366f1', // DigiWave primary color (indigo)
    cancelButtonColor: '#6b7280', // Gray color
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: 'swal2-popup-digiwave',
      title: 'swal2-title-digiwave',
      content: 'swal2-content-digiwave',
      confirmButton: 'swal2-confirm-digiwave',
      cancelButton: 'swal2-cancel-digiwave'
    },
    buttonsStyling: false,
    reverseButtons: true
  });
  return result.isConfirmed;
};

export const showSuccessAlert = async (options) => {
  const {
    title = 'Success!',
    text = '',
    confirmButtonText = 'OK'
  } = options;

  await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText,
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: 'swal2-popup-digiwave',
      title: 'swal2-title-digiwave',
      content: 'swal2-content-digiwave',
      confirmButton: 'swal2-confirm-digiwave'
    },
    buttonsStyling: false
  });
};

export const showErrorAlert = async (options) => {
  const {
    title = 'Error!',
    text = '',
    confirmButtonText = 'OK'
  } = options;

  await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText,
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: 'swal2-popup-digiwave',
      title: 'swal2-title-digiwave',
      content: 'swal2-content-digiwave',
      confirmButton: 'swal2-confirm-digiwave'
    },
    buttonsStyling: false
  });
};

export const showInfoAlert = async (options) => {
  const {
    title = 'Information',
    text = '',
    confirmButtonText = 'OK'
  } = options;

  await Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText,
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: 'swal2-popup-digiwave',
      title: 'swal2-title-digiwave',
      content: 'swal2-content-digiwave',
      confirmButton: 'swal2-confirm-digiwave'
    },
    buttonsStyling: false
  });
};

export const showDeleteConfirmDialog = async (itemName = 'this item') => {
  return await showConfirmDialog({
    title: 'Delete Confirmation',
    text: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    icon: 'warning'
  });
};

export const showDownloadConfirmDialog = async (itemName = 'this file') => {
  return await showConfirmDialog({
    title: 'Download Confirmation',
    text: `Do you want to download ${itemName}?`,
    confirmButtonText: 'Yes, download',
    cancelButtonText: 'Cancel',
    icon: 'question'
  });
};

export const showLogoutConfirmDialog = async () => {
  return await showConfirmDialog({
    title: 'Logout Confirmation',
    text: 'Are you sure you want to logout?',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel',
    icon: 'question'
  });
};

export const showClockOutConfirmDialog = async () => {
  return await showConfirmDialog({
    title: 'Clock Out Confirmation',
    text: 'Are you sure you want to clock out?',
    confirmButtonText: 'Yes, clock out',
    cancelButtonText: 'Cancel',
    icon: 'question'
  });
};

export const showApprovalConfirmDialog = async (action = 'approve', itemType = 'request') => {
  return await showConfirmDialog({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Confirmation`,
    text: `Are you sure you want to ${action} this ${itemType}?`,
    confirmButtonText: `Yes, ${action}`,
    cancelButtonText: 'Cancel',
    icon: action === 'approve' ? 'success' : 'warning'
  });
};

export const showBreakConfirmDialog = async (action = 'start') => {
  const actionText = action === 'start' ? 'start your break' : 'end your break and resume work';
  const title = action === 'start' ? 'Start Break' : 'End Break';
  
  return await showConfirmDialog({
    title: `${title} Confirmation`,
    text: `Are you sure you want to ${actionText}?`,
    confirmButtonText: `Yes, ${action} break`,
    cancelButtonText: 'Cancel',
    icon: 'question'
  });
};

export const showMobileBlockedDialog = async () => {
  await Swal.fire({
    title: 'Mobile Access Restricted',
    html: `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; color: #ef4444; margin-bottom: 16px;">📱</div>
        <p style="margin-bottom: 16px; color: #374151;">
          Attendance check-in/out is only available on desktop computers for security purposes.
        </p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="color: #dc2626; font-weight: 500; margin: 0;">
            🔒 Security Measure: This prevents unauthorized attendance marking from mobile devices.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Please use a desktop or laptop computer to mark your attendance.
        </p>
      </div>
    `,
    confirmButtonText: 'I Understand',
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: 'swal2-popup-digiwave',
      title: 'swal2-title-digiwave',
      content: 'swal2-content-digiwave',
      confirmButton: 'swal2-confirm-digiwave'
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false
  });
};
