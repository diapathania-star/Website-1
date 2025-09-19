/* ===== Config ===== */
const FORM_URL = "https://formspree.io/f/xblabyyn";

/* ===== DOM ===== */
const svg = document.getElementById("map");
const gLinks = document.getElementById("links");
const gNodes = document.getElementById("nodes");
const joinBtn = document.getElementById("joinBtn");
const hoverCard = document.getElementById("hoverCard");

/* ===== Fit the map to the viewport so the button is visible ===== */
function setMapHeight(){
  const header = document.querySelector('.page-head');
  const topPad = 8;                 // matches .layout top padding
  const bottomPad = 12 + 56;        // bottom padding + room for pill
  const available = window.innerHeight
                  - (header ? header.offsetHeight : 0)
                  - topPad - bottomPad;

  const h = Math.max(440, available);  // guard minimum
  document.documentElement.style.setProperty('--mapH', h + 'px');
}
window.addEventListener('resize', setMapHeight);
setMapHeight();

/* ===== Data (base positions) ===== */
const nodes = [
  { id:"TPS Core", x:600, y:380, size:40, status:"collab",
    before:"", did:"Narrative-led systems across projects.",
    result:"Proof-of-work as a living map." },

  { id:"Chander", x:200, y:400, size:30, status:"collab",
    before:"Fragmented story, limited recall.",
    did:"Role clarity + perception audit + LinkedIn system.",
    result:"Stronger pull; clearer asks." },

  { id:"Diya", x:720, y:240, size:30, status:"collab", noHover:true },

  { id:"Vivek", x:520, y:240, size:30, status:"collab", noHover:true },

  { id:"Kalpak", x:960, y:400, size:30, status:"collab", noHover:true }
];

const CORE_ID = "TPS Core";
function starLinks(){ return nodes.filter(n=>n.id!==CORE_ID).map(n=>[CORE_ID,n.id]); }
let links = starLinks();

function relaxCollisions(){
  const pad = 12; // space between nodes
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a = nodes[i], b = nodes[j];
      const dx = b.baseX - a.baseX;
      const dy = b.baseY - a.baseY;
      const distance = Math.hypot(dx, dy);
      const minDistance = (a.size || 12) + (b.size || 12) + pad;

      if(distance < minDistance){
        const overlap = (minDistance - distance) / 2;
        const angle = Math.atan2(dy, dx);
        a.baseX -= Math.cos(angle) * overlap;
        a.baseY -= Math.sin(angle) * overlap;
        b.baseX += Math.cos(angle) * overlap;
        b.baseY += Math.sin(angle) * overlap;
      }
    }
  }
}


/* ===== Motion: Micro-Nudge (no physics) ===== */
const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const viewW = 1200, viewH = 700;

nodes.forEach(n=>{
  // remember base position; we render around this
  n.baseX = n.x; n.baseY = n.y;

  // tiny drift parameters per node (random so they’re out of sync)
  n.ampX = 4 + Math.random()*2;     // 4–6 px
  n.ampY = 4 + Math.random()*2;     // 4–6 px
  n.spX  = 0.0007 + Math.random()*0.0005;  // slow
  n.spY  = 0.0008 + Math.random()*0.0005;  // slow
  n.phX  = Math.random()*Math.PI*2;
  n.phY  = Math.random()*Math.PI*2;

  // smooth hover scale handled in JS
  n.isHovered = false;
  n.hoverScale = 1;

  // current rendered position (start at base)
  n.x = n.baseX; n.y = n.baseY;
});

/* ===== Helpers ===== */
const NS = tag => document.createElementNS("http://www.w3.org/2000/svg", tag);

/* ===== Render ===== */
function draw(){
  // links
  gLinks.innerHTML = "";
  links.forEach(([aId,bId])=>{
    const a = nodes.find(n=>n.id===aId), b = nodes.find(n=>n.id===bId);
    if(!a || !b) return;
    const L = NS("line");
    L.setAttribute("x1",a.x); L.setAttribute("y1",a.y);
    L.setAttribute("x2",b.x); L.setAttribute("y2",b.y);
    L.setAttribute("class","link");
    L.dataset.a = aId; L.dataset.b = bId;
    gLinks.appendChild(L);
  });

  // nodes
  gNodes.innerHTML = "";
  nodes.forEach(n=>{
    const G = NS("g");
    G.setAttribute("transform",`translate(${n.x},${n.y})`);
    G.classList.add("node", n.status || "collab");
    G.dataset.id = n.id;

    const V = NS("g"); V.setAttribute("class","viz");
    V.setAttribute("transform","scale(1)");        // JS will animate this
    const halo = NS("circle"); halo.setAttribute("class","halo");
    halo.setAttribute("r", (n.size||12) + 10);
    const dot = NS("circle"); dot.setAttribute("class","dot");
    dot.setAttribute("r", n.size||12);
    const label = NS("text");
     label.setAttribute("class","label");
      // push text down based on node size (so it never overlaps)
     const offset = (n.size || 12) + 14; // 14px below circle
     label.setAttribute("transform", `translate(0, ${offset})`);
     label.textContent = n.id;


    V.append(halo, dot, label); G.appendChild(V); gNodes.appendChild(G);

    // interactions
    G.addEventListener("mouseenter", e=>{ n.isHovered = true; onHover(n, e); });
    G.addEventListener("mousemove", e=> positionCard(e));
    G.addEventListener("mouseleave", ()=>{ n.isHovered = false; offHover(); });
    G.addEventListener("click", ()=> { playPop(); sweepEdges(n.id); });

    // drag = move base position (no physics)
    G.addEventListener("pointerdown", e=> startDrag(e, n.id));
  });
}

/* ===== Hover Card (visual only) ===== */
function onHover(n, evt){
  svg.classList.add("dim");
  [...gNodes.children].forEach(g=> g.classList.toggle("active", g.dataset.id===n.id));
  [...gLinks.children].forEach(L=>{
    const match = L.dataset.a===n.id || L.dataset.b===n.id;
    L.classList.toggle("lit", match);
  });
  hoverCard.innerHTML = `
    <h3>${n.id}</h3>
    ${n.before ? `<p><strong>Before:</strong> ${n.before}</p>` : ""}
    ${n.did    ? `<p><strong>We did:</strong> ${n.did}</p>` : ""}
    ${n.result ? `<p><strong>Result:</strong> ${n.result}</p>` : ""}
  `;
  hoverCard.classList.add("show");
  positionCard(evt);
}
function positionCard(evt){
  const pad = 14;
  const box = svg.getBoundingClientRect();
  const x = Math.min(evt.clientX - box.left + 16, box.width - 320 - pad);
  const y = Math.min(evt.clientY - box.top  + 16, box.height - 120 - pad);
  hoverCard.style.left = x + "px";
  hoverCard.style.top  = y + "px";
  hoverCard.setAttribute("aria-hidden","false");
}
function offHover(){
  svg.classList.remove("dim");
  [...gLinks.children].forEach(L=> L.classList.remove("lit"));
  hoverCard.classList.remove("show");
  hoverCard.setAttribute("aria-hidden","true");
}

/* Sweep line animation */
function sweepEdges(id){
  [...gLinks.children].forEach(L=>{
    const match = L.dataset.a===id || L.dataset.b===id;
    if(match){ L.classList.remove("sweep"); void L.offsetWidth; L.classList.add("sweep"); }
  });
}

/* ===== Dragging (moves base position) ===== */
function startDrag(evt, id){
  const n = nodes.find(nn=>nn.id===id);
  const move = e=> doDrag(e, n);
  const up = e=> endDrag(e, move, up);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}
function doDrag(e,n){
  const box = svg.getBoundingClientRect();
  const px = ((e.clientX - box.left)/box.width)*viewW;
  const py = ((e.clientY - box.top)/box.height)*viewH;
  n.baseX = Math.max(30, Math.min(px, viewW-30));
  n.baseY = Math.max(30, Math.min(py, viewH-30));
  n.x = n.baseX; n.y = n.baseY;                 // follow cursor
  updatePositions();
}
function endDrag(e,move,up){
  window.removeEventListener("pointermove", move);
  window.removeEventListener("pointerup", up);
}

/* ===== Micro-Nudge Tick with Smooth Hover Scale ===== */
function tickNudge(time){
  if(prefersReduced){
    nodes.forEach(n=>{ n.x = n.baseX; n.y = n.baseY; n.hoverScale = 1; });
  }else{
    nodes.forEach(n=>{
      // tiny nudge around base
      const ox = Math.sin(time*n.spX + n.phX) * n.ampX;
      const oy = Math.cos(time*n.spY + n.phY) * n.ampY;
      n.x = n.baseX + ox;
      n.y = n.baseY + oy;

      // smooth hover scale (no CSS hover transform)
      const target = n.isHovered ? 1.05 : 1.0;
      n.hoverScale += (target - n.hoverScale) * 0.12;  // ease
    });
  }

  updatePositions();
  // apply scales in the same frame as position for perfect smoothness
  nodes.forEach(n=>{
    const viz = gNodes.querySelector(`[data-id="${n.id}"] .viz`);
    if(viz) viz.setAttribute("transform", `scale(${n.hoverScale})`);
  });

  requestAnimationFrame(tickNudge);
}

/* ===== Update Positions ===== */
function updatePositions(){
  [...gLinks.children].forEach(L=>{
    const a = nodes.find(n=>n.id===L.dataset.a);
    const b = nodes.find(n=>n.id===L.dataset.b);
    if(a && b){
      L.setAttribute("x1",a.x); L.setAttribute("y1",a.y);
      L.setAttribute("x2",b.x); L.setAttribute("y2",b.y);
    }
  });
  [...gNodes.children].forEach(G=>{
    const n = nodes.find(nn=>nn.id===G.dataset.id);
    if(n){ G.setAttribute("transform", `translate(${n.x},${n.y})`); }
  });
}

/* ===== Click Pop ===== */
let AC;
function playPop(){
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = "sine"; o.frequency.value = 880;
    o.connect(g); g.connect(AC.destination);
    const now = AC.currentTime;
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    o.start(now); o.stop(now + 0.09);
  }catch(e){}
}

/* ===== Aura (star particles) ===== */
const aura = document.getElementById("aura");
const ctx = aura.getContext("2d");
function resizeCanvas(){ aura.width = aura.clientWidth; aura.height = aura.clientHeight; }
window.addEventListener("resize", resizeCanvas); resizeCanvas();
const particles = Array.from({length: (prefersReduced ? 0 : 22)}).map(()=>({
  x: Math.random()*aura.width,
  y: Math.random()*aura.height,
  r: 1 + Math.random()*1.6,
  a: .12 + Math.random()*.22,
  vx: (-.15 + Math.random()*.30),
  vy: (-.15 + Math.random()*.30),
}));
(function tick(){
  ctx.clearRect(0,0,aura.width,aura.height);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>aura.width) p.vx*=-1;
    if(p.y<0||p.y>aura.height) p.vy*=-1;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(125,224,255,${p.a})`;
    ctx.fill();
  });
  requestAnimationFrame(tick);
})();

/* ===== Init ===== */
draw();
requestAnimationFrame(tickNudge);

/* ===== Join button (simple add; optional) ===== */
joinBtn?.addEventListener("click", ()=>{
  const prev = sessionStorage.getItem("tps_you_name") || "";
  const name = (prompt("Add your name to the map (temporary):", prev) || "").trim();
  if(!name) return;
  sessionStorage.setItem("tps_you_name", name);

  const core = nodes.find(n=>n.id===CORE_ID);
  const you = {
    id: name, x: core.x + 120, y: core.y - 20, baseX: core.x + 120, baseY: core.y - 20,
    size: 10, status:"visitor",
    before:"Exploring TPS.", did:"Joined the network.", result:"We’ll follow up.",
    ampX: 4, ampY: 4, spX: 0.001, spY: 0.0012, phX: Math.random()*6.28, phY: Math.random()*6.28,
    isHovered:false, hoverScale:1
  };
  const idx = nodes.findIndex(n=>n.id===name);
  if(idx>-1) nodes.splice(idx,1);
  nodes.push(you);
  links = starLinks();
  draw();
  setTimeout(()=>{ location.href = `${FORM_URL}?name=${encodeURIComponent(name)}&source=Mycelium`; }, 500);
});
