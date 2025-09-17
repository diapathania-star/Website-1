(function(){
  const NIGHT_START = 19; // 7pm
  const NIGHT_END   = 6;  // 6am
  const root = document.documentElement;

  function isNight(){
    const h = new Date().getHours();
    return (h >= NIGHT_START || h < NIGHT_END);
  }

  function apply(){
    root.classList.toggle('night', isNight());
    schedule(); // schedule next boundary
  }

  let timer;
  function schedule(){
    clearTimeout(timer);
    const now = new Date();
    const h = now.getHours();
    const nextHour = (h >= NIGHT_START || h < NIGHT_END) ? NIGHT_END : NIGHT_START;
    const next = new Date(now);
    next.setHours(nextHour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    timer = setTimeout(apply, next - now);
  }

  apply();
})();
