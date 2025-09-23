// Smooth-scroll to the form if URL has #form
document.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#form') {
    const el = document.querySelector('.form-embed');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
