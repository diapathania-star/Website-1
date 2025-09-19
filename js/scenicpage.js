/* Tiny “fireflies” generator — cheap, subtle, and performant */
(function(){
  const container = document.getElementById('fireflies');
  if(!container) return;

  const COUNT = 28;
  const rand = (min, max) => Math.random() * (max - min) + min;

  for(let i=0;i<COUNT;i++){
    const dot = document.createElement('span');
    dot.className = 'firefly';

    const sx = rand(0, window.innerWidth);
    const sy = rand(0, window.innerHeight);
    const dx = rand(-120, 120);
    const dy = rand(-90, 90);

    dot.style.setProperty('--sx', `${sx}px`);
    dot.style.setProperty('--sy', `${sy}px`);
    dot.style.setProperty('--dx', `${dx}px`);
    dot.style.setProperty('--dy', `${dy}px`);

    const driftMs = rand(9000, 16000);
    const blinkMs = rand(2200, 4200);
    dot.style.animationDuration = `${driftMs}ms, ${blinkMs}ms`;
    dot.style.animationDelay = `${rand(0,4000)}ms, ${rand(0,2000)}ms`;

    container.appendChild(dot);
  }
})();
