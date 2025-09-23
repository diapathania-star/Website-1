// If you want to add behavior later (e.g., scroll to form, resize), keep this file.
// For now, we'll add a tiny helper to scroll to the form hash if present.
document.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#form') {
    const el = document.querySelector('.form-embed');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
