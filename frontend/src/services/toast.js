export const showToast = (message, type = 'success') => {
  const event = new CustomEvent('toast', { detail: { message, type } });
  window.dispatchEvent(event);
};
