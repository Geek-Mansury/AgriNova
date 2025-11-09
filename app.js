// AgriNova - app.js (vanilla JS)
// Mock data + navigation + simple chart render
// Save as app.js and keep in same folder as index.html & style.css

// Mock market data
const marketData = [
  { market: 'Kigali', crop: 'Maize', price: 420, change: 2 },
  { market: 'Kigali', crop: 'Beans', price: 550, change: -1 },
  { market: 'Musanze', crop: 'Maize', price: 400, change: 0 },
  { market: 'Musanze', crop: 'Potatoes', price: 260, change: 3 },
  { market: 'Huye', crop: 'Beans', price: 520, change: 1 },
  { market: 'Huye', crop: 'Maize', price: 410, change: -2 }
];

const buyers = [
  { name: 'AgriMart Kigali', dist: '4 km', crops: ['Maize','Beans'], verified: true },
  { name: 'Buyer John', dist: '12 km', crops: ['Potatoes'], verified: false },
  { name: 'Co-op Center Huye', dist: '8 km', crops: ['Beans','Maize'], verified: true }
];

// simple view router
document.addEventListener('DOMContentLoaded', () => {
  // elements
  const navBtns = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');
  const smallCards = document.querySelectorAll('.small-card');
  const backBtns = document.querySelectorAll('[data-back]');
  const openSettingsBtn = document.getElementById('openSettings');
  const smsToggle = document.getElementById('smsToggle');
  const offlineToggle = document.getElementById('offlineToggle');

  // attach small card clicks
  smallCards.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-open');
      if (target) showView(target);
    });
  });

  // nav events
  navBtns.forEach(b => {
    b.addEventListener('click', () => {
      navBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const t = b.getAttribute('data-target');
      showView(t);
    });
  });

  // back buttons
  backBtns.forEach(b => b.addEventListener('click', () => showView('home')));

  // settings open
  openSettingsBtn.addEventListener('click', () => showView('settings'));

  // toggles
  smsToggle.addEventListener('click', () => {
    if (smsToggle.hasAttribute('data-on')) smsToggle.removeAttribute('data-on');
    else smsToggle.setAttribute('data-on','');
    notify('SMS alerts ' + (smsToggle.hasAttribute('data-on') ? 'enabled' : 'disabled'));
  });
  offlineToggle.addEventListener('click', () => {
    if (offlineToggle.hasAttribute('data-on')) offlineToggle.removeAttribute('data-on');
    else offlineToggle.setAttribute('data-on','');
    notify('Offline mode ' + (offlineToggle.hasAttribute('data-on') ? 'on' : 'off'));
  });

  // initial render
  renderMarketList();
  renderBuyers();
  drawTrendChart();
  drawPriceChart();

  // Refresh market
  document.getElementById('refreshMarket').addEventListener('click', () => {
    renderMarketList();
    notify('Market data refreshed');
  });
});

// show view helper
function showView(name){
  const views = document.querySelectorAll('.view');
  const navBtns = document.querySelectorAll('.nav-btn');
  views.forEach(v => {
    if (v.dataset.view === name) {
      v.classList.add('view-active'); v.setAttribute('aria-hidden','false');
    } else { v.classList.remove('view-active'); v.setAttribute('aria-hidden','true'); }
  });
  // set nav active
  navBtns.forEach(b => { b.classList.toggle('active', b.getAttribute('data-target') === name); });
}

// market list render
function renderMarketList(){
  const region = document.getElementById('regionSelect').value;
  const crop = document.getElementById('cropSelect').value;
  const list = document.getElementById('marketList');
  list.innerHTML = '';
  const filtered = marketData.filter(d => (region === 'all' || d.market === region) && (crop === 'all' || d.crop === crop));
  filtered.forEach(d => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<div><div style="font-weight:700">${d.crop}</div><div class="meta">${d.market}</div></div><div style="text-align:right"><div class="value">${d.price} RWF</div><div class="meta" style="color:${d.change>=0? '#138a2f':'#d9534f'}">${d.change>=0? '+':''}${d.change}%</div></div>`;
    list.appendChild(el);
  });
  if(filtered.length === 0){
    const empty = document.createElement('div'); empty.className='item muted'; empty.textContent = 'No data for selected filters';
    list.appendChild(empty);
  }
}

// buyers render
function renderBuyers(){
  const list = document.getElementById('buyersList');
  list.innerHTML = '';
  buyers.forEach(b => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<div><div style="font-weight:700">${b.name} ${b.verified?'<span style="font-size:11px;padding:3px 8px;border-radius:10px;background:#eaf8ea;color:#2E7D32;margin-left:6px">Verified</span>':''}</div><div class="meta">${b.crops.join(', ')} • ${b.dist}</div></div><div style="display:flex;gap:8px"><button class="btn primary" onclick="callBuyer('${b.name}')">Call</button><button class="btn outline" onclick="smsBuyer('${b.name}')">SMS</button></div>`;
    list.appendChild(el);
  });
}

// call/sms mock
function callBuyer(name){ notify('Calling ' + name + ' (mock)'); }
function smsBuyer(name){ notify('SMS to ' + name + ': "I have maize 200kg available."'); }

// small notifications
let toastTimer = null;
function notify(text){
  const t = document.getElementById('toast');
  t.style.display = 'block'; t.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.style.display='none'; }, 2500);
}

// simple charts using canvas (no external libs)
function drawTrendChart(){
  const canvas = document.getElementById('trendChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [350,370,400,430,410,390]; // maize sample
  drawLine(ctx, data, '#2E7D32');
}

function drawPriceChart(){
  const canvas = document.getElementById('priceChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [350,370,400,430,410,390];
  drawLine(ctx, data, '#FFB300');
}

// helper: basic line chart
function drawLine(ctx, values, stroke){
  const w = ctx.canvas.width = ctx.canvas.clientWidth;
  const h = ctx.canvas.height = ctx.canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(...values), min = Math.min(...values);
  const pad = 14;
  ctx.beginPath();
  values.forEach((v,i) => {
    const x = pad + (i*(w-2*pad)/(values.length-1));
    const y = pad + (1 - (v-min)/(max-min || 1))*(h-2*pad);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();

  // area fill
  ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath();
  ctx.fillStyle = stroke + '22'; ctx.fill();
}
