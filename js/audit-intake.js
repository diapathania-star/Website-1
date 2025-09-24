// Smooth-scroll to the form if URL has #form
document.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#form') {
    const el = document.querySelector('.form-embed');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Optional: inline submission handling
const f = document.getElementById('auditForm');
if (f) {
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(f.action, {
      method: 'POST',
      body: new FormData(f),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      window.location.href = f.querySelector('input[name="_redirect"]').value;
    } else {
      alert('Something went wrong. Please try again.');
    }
  });
}
