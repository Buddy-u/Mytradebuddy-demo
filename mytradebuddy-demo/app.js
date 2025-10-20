// Simple mobile-first demo. No backend — demo accounts stored in localStorage (30 days).

const screens = {
  signup: document.getElementById('screen-signup'),
  start: document.getElementById('screen-start'),
  analyze: document.getElementById('screen-analyze'),
  results: document.getElementById('screen-results'),
};

function show(id){
  Object.values(screens).forEach(s=>s.classList.remove('active'));
  screens[id].classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

// Demo account storage with 30-day expiry (client-only)
function saveDemoAccount(email){
  const now = Date.now();
  const ttl = 30 * 24 * 60 * 60 * 1000; // 30 days
  localStorage.setItem('mtb_demo_user', JSON.stringify({ email, created: now, expire: now + ttl }));
}
function hasValidAccount(){
  try{
    const raw = localStorage.getItem('mtb_demo_user');
    if(!raw) return false;
    const obj = JSON.parse(raw);
    return obj && Date.now() < obj.expire;
  }catch(e){ return false; }
}
function logout(){
  localStorage.removeItem('mtb_demo_user');
  show('signup');
}

// Wire signup
document.getElementById('signup-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pw = document.getElementById('password').value;
  if(!email || pw.length < 6){
    alert('Please enter a valid email and a password of at least 6 characters.');
    return;
  }
  saveDemoAccount(email);
  show('start');
});

document.getElementById('btn-logout').addEventListener('click', logout);

// Start screen buttons
document.getElementById('btn-demo').addEventListener('click', ()=>{
  show('analyze');
});
document.getElementById('btn-add').addEventListener('click', ()=>{
  alert('“Add My Data” is coming in the next step. Try Demo Data for now.');
});

// Analyze flow
const loader = document.getElementById('loader');
document.getElementById('btn-analyze').addEventListener('click', ()=>{
  loader.classList.remove('hidden');
  // 2-second loading pulse
  setTimeout(()=>{
    loader.classList.add('hidden');
    // Use sample demo numbers
    const demo = calculateDemo();
    renderResults(demo);
    show('results');
  }, 2000);
});

document.getElementById('btn-retry').addEventListener('click', ()=>{
  show('analyze');
});
document.getElementById('btn-home').addEventListener('click', ()=>{
  show('start');
});

function calculateDemo(){
  // Sample demo values that feel realistic
  // You can tune these later in a config panel
  const mindset = 74;    // 0-100
  const rules = 68;      // 0-100
  const backtest = 62;   // 0-100

  // Final confidence uses your chosen weights: R20% / B40% / M40%
  const confidence = Math.round(0.2*rules + 0.4*backtest + 0.4*mindset);

  const notes = [
    mindset >= 70 ? 'Mindset stable — keep your pre‑trade routine.' : 'Mindset a bit choppy — simple routine could help.',
    rules >= 70 ? 'You mostly followed your rules.' : 'Rule slips detected — watch your entry filter and stop rules.',
    backtest >= 65 ? 'Live results close to your backtest.' : 'Live vs. backtest is drifting — check slippage and discipline.'
  ];
  return { mindset, rules, backtest, confidence, notes };
}

function renderResults(d){
  document.getElementById('val-mindset').textContent = d.mindset + '%';
  document.getElementById('val-rules').textContent = d.rules + '%';
  document.getElementById('val-backtest').textContent = d.backtest + '%';
  document.getElementById('val-confidence').textContent = d.confidence + '%';

  const notes = document.getElementById('notes');
  notes.innerHTML = '';
  d.notes.forEach(n=>{
    const p = document.createElement('p');
    p.textContent = '• ' + n;
    notes.appendChild(p);
  });
}

// Resume session if account exists
if(hasValidAccount()){
  show('start');
}else{
  show('signup');
}
