// Scroll reveal (simple fade-in class toggle)
const revealEls = document.querySelectorAll('.section, .card, .art-box');
const reveal = () => {
  const trigger = window.innerHeight * 0.9;
  revealEls.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < trigger) el.classList.add('reveal');
  });
};
window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);

// You can add small helpers here later:
// - Hover interactions for cards
// - Smooth anchors, etc.
