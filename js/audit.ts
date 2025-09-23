// Simple accordion for FAQs
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-accordion]');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;

    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all
    container.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
