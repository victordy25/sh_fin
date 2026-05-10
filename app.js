function showAppPage(key) {
  document.querySelectorAll('.app-page').forEach(page => {
    page.classList.toggle('active', page.dataset.page === key);
  });
  document.querySelectorAll('.app-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.target === key);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.app-tab').forEach(tab => {
  tab.addEventListener('click', () => showAppPage(tab.dataset.target));
});

/* ===== 부동산 10년 자산전략 시뮬레이터 ===== */


/* ===== 변수 입력 가이드 — 부동산 10년 자산전략 시뮬레이터 ===== */
{
const guidePage = document.querySelector('.page-guide');
  const tocItems = guidePage.querySelectorAll('.toc-item');
  const sections = guidePage.querySelectorAll('.section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if(window.scrollY >= s.offsetTop - 80) current = s.id; });
    tocItems.forEach(t => {
      t.classList.toggle('active', t.getAttribute('href') === '#' + current);
    });
  });
}

/* ===== 단지 비교 분석 템플릿 ===== */
const comparisonPage = document.querySelector('.page-comparison');
const COLORS = ['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)'];
const COLOR_HEX = ['#1a4f9f','#2a6e28','#8b3a0f','#5b3fad','#1a7a6e'];

/* ── TRANSIT TABLE BUILD ── */
const transitRows = [
  { key:'gang', label:'강남역', sub:'2·신분당선' },
  { key:'sich', label:'시청역', sub:'1·2호선' },
  { key:'yeoi', label:'여의도역', sub:'5·9호선' },
  { key:'sam',  label:'삼성역', sub:'2호선·GTX-A' },
];
const tbody = document.getElementById('transit-body');
transitRows.forEach(r => {
  const timeRow = document.createElement('tr');
  timeRow.innerHTML = `<td class="row-label">${r.label} 소요 시간<small>${r.sub}</small></td>` +
    [0,1,2,3,4].map(i=>`<td><div class="cell-input"><input type="number" step="1" placeholder="0" id="tr_${r.key}_t_${i}"><span class="cell-unit">분</span></div></td>`).join('');
  tbody.appendChild(timeRow);
  const xferRow = document.createElement('tr');
  xferRow.innerHTML = `<td class="row-label">${r.label} 환승 횟수<small>직통 0, 1회 환승 1</small></td>` +
    [0,1,2,3,4].map(i=>`<td><div class="cell-input"><input type="number" step="1" min="0" max="5" placeholder="0" id="tr_${r.key}_x_${i}"><span class="cell-unit">회</span></div></td>`).join('');
  tbody.appendChild(xferRow);
});
const starRow = document.createElement('tr');
starRow.innerHTML = `<td class="row-label">교통 종합 평가</td>` +
  [0,1,2,3,4].map(i=>`<td><div class="star-wrap" data-key="star_tr_${i}"></div></td>`).join('');
tbody.appendChild(starRow);

/* ── STAR RATING ── */
const starData = {};
function buildStars(wrap) {
  const key = wrap.dataset.key;
  starData[key] = starData[key] || 0;
  wrap.innerHTML = '';
  for(let i=1;i<=5;i++){
    const s = document.createElement('span');
    s.className = 'star' + (i <= starData[key] ? ' on' : '');
    s.textContent = '★';
    s.onclick = () => { starData[key] = i; buildStars(wrap); };
    wrap.appendChild(s);
  }
}
comparisonPage.querySelectorAll('.star-wrap').forEach(buildStars);

/* ── BADGE SELECT ── */
const badgeData = {};
comparisonPage.querySelectorAll('.badge-select').forEach(bs => {
  const key = bs.dataset.key;
  bs.querySelectorAll('.bs-opt').forEach(opt => {
    opt.onclick = () => {
      badgeData[key] = opt.dataset.val;
      bs.querySelectorAll('.bs-opt').forEach(o => {
        o.className = 'bs-opt';
        if(o === opt){
          const v = o.dataset.val;
          if(['없음','우수','1군','높음'].includes(v)) o.classList.add('sel-y');
          else if(['있음','부족','3군','낮음'].includes(v)) o.classList.add('sel-n');
          else o.classList.add('sel-a');
        }
      });
    };
  });
});

/* ── AUTO AGE ── */
comparisonPage.querySelectorAll('[id^="prod_year_"]').forEach(inp => {
  const idx = inp.id.slice(-1);
  inp.addEventListener('input', () => {
    const y = parseInt(inp.value);
    const ageEl = document.getElementById('prod_age_'+idx);
    if(y && y > 1970) ageEl.textContent = (2025 - y) + '년';
    else ageEl.textContent = '—';
  });
});

/* ── COMPLEX NAME SYNC ── */
function syncNames(){
  for(let i=0;i<5;i++){
    const n = document.getElementById('name'+i).value || `단지 ${String.fromCharCode(65+i)}`;
    comparisonPage.querySelectorAll(`[id$="_${i}"]`).forEach(()=>{});
    document.getElementById('th'+i) && (document.getElementById('th'+i).textContent = n);
  }
}
comparisonPage.querySelectorAll('[id^="name"]').forEach(inp => inp.addEventListener('input', syncNames));

/* ── WEIGHT TOTAL ── */
function updateWeightTotal(){
  const keys = ['land','job','transit','school','env','prod'];
  const total = keys.reduce((s,k)=>s+(parseInt(document.getElementById('w_'+k).value)||0), 0);
  const el = document.getElementById('weight-total-val');
  el.textContent = total;
  el.className = total === 100 ? 'ok' : 'ng';
}

/* ── SCORE CALC ── */
function getStarVal(key){ return (starData[key] || 0) / 5; }

function calcScore(){
  const names = [0,1,2,3,4].map(i => document.getElementById('name'+i).value || `단지 ${String.fromCharCode(65+i)}`);
  const keys = ['land','job','transit','school','env','prod'];
  const labels = ['🗺️ 땅','💼 직장','🚇 교통','🎓 학군','🌿 환경','🏗️ 상품'];
  const weights = keys.map(k=>parseInt(document.getElementById('w_'+k).value)||0);
  const total = weights.reduce((s,v)=>s+v,0);
  if(total !== 100){ alert('가중치 합계가 100이 아닙니다. 현재: '+total); return; }

  const starKeys = ['star_land','star_job','star_tr','star_sch','star_env','star_prod'];
  const scores = [0,1,2,3,4].map(ci => {
    return keys.map((k,ki) => getStarVal(starKeys[ki]+'_'+ci) * weights[ki]);
  });
  const totals = scores.map(s => s.reduce((a,b)=>a+b,0));

  const sorted = [...totals].sort((a,b)=>b-a);
  const ranks = totals.map(t=>sorted.indexOf(t)+1);

  // result cards
  const grid = document.getElementById('result-grid');
  grid.innerHTML = '';
  [0,1,2,3,4].forEach(ci=>{
    const card = document.createElement('div');
    card.className = 'result-card' + (ranks[ci]===1?' rank1':'');
    card.style.cssText += `border-top:3px solid ${COLOR_HEX[ci]}`;
    card.innerHTML = `
      <div class="result-card-name">${names[ci]}</div>
      <div class="result-score" style="color:${COLOR_HEX[ci]}">${totals[ci].toFixed(1)}</div>
      <div class="result-rank">/ 100점</div>
      <div><span class="result-rank-badge rank-${Math.min(ranks[ci],3)}">${ranks[ci] === 1 ? '🏆 1위' : ranks[ci]+'위'}</span></div>
    `;
    grid.appendChild(card);
  });

  // detail table
  const sdBody = document.getElementById('score-tbody');
  sdBody.innerHTML = '';
  for(let i=0;i<5;i++) document.getElementById('sdt'+i).textContent = names[i];

  keys.forEach((k,ki)=>{
    const tr = document.createElement('tr');
    const rowScores = [0,1,2,3,4].map(ci=>scores[ci][ki]);
    const maxScore = Math.max(...rowScores);
    tr.innerHTML = `<td>${labels[ki]}</td><td style="color:var(--ink3)">${weights[ki]}%</td>`+
      [0,1,2,3,4].map(ci=>{
        const s = scores[ci][ki];
        const pct = maxScore > 0 ? (s/maxScore*100) : 0;
        return `<td class="bar-cell">
          <div style="font-size:.75rem;margin-bottom:3px;font-family:'DM Mono',monospace;color:${s===maxScore&&s>0?COLOR_HEX[ci]:'var(--ink3)'};font-weight:${s===maxScore&&s>0?700:400}">${s.toFixed(1)}</div>
          <div class="score-bar-wrap"><div class="score-bar" style="width:${pct}%;background:${COLOR_HEX[ci]}"></div></div>
        </td>`;
      }).join('');
    sdBody.appendChild(tr);
  });
  // total row
  const totalTr = document.createElement('tr');
  totalTr.innerHTML = `<td>합계</td><td style="color:var(--ink3)">100%</td>`+
    [0,1,2,3,4].map(ci=>`<td style="color:${COLOR_HEX[ci]};font-weight:700;font-family:'DM Mono',monospace">${totals[ci].toFixed(1)}</td>`).join('');
  sdBody.appendChild(totalTr);
  document.getElementById('score-detail').style.display = 'block';
  document.getElementById('sec-score').scrollIntoView({behavior:'smooth'});
}

/* ── MEMO BUILD ── */
const memoWrap = document.getElementById('memo-grid');
for(let i=0;i<5;i++){
  const card = document.createElement('div');
  card.className = 'memo-card';
  const name = String.fromCharCode(65+i);
  card.innerHTML = `
    <div class="memo-card-header" style="background:${COLOR_HEX[i]}">
      <span>단지 ${name}</span>
      <span id="memo-name-${i}" style="opacity:.7;font-size:.65rem"></span>
    </div>
    <textarea id="memo_${i}" placeholder="현장 방문 메모&#10;&#10;✓ 일조 / 조망&#10;✓ 소음 수준&#10;✓ 주차 여건&#10;✓ 단지 내 시설&#10;✓ 관리 상태&#10;✓ 중개사 의견&#10;✓ 기타 특이사항"></textarea>
  `;
  memoWrap.appendChild(card);
}
comparisonPage.querySelectorAll('[id^="name"]').forEach(inp=>{
  inp.addEventListener('input', ()=>{
    for(let i=0;i<5;i++){
      const el = document.getElementById('memo-name-'+i);
      if(el) el.textContent = document.getElementById('name'+i).value;
    }
  });
});

/* ── NAV SCROLL ── */
function scrollToCompare(id){
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
}
const navItems = comparisonPage.querySelectorAll('.nav-item');
const sections = ['sec-setup','sec-land','sec-job','sec-transit','sec-school','sec-env','sec-product','sec-score','sec-memo'];
window.addEventListener('scroll', ()=>{
  let cur = sections[0];
  sections.forEach(id=>{
    const el = document.getElementById(id);
    if(el && window.scrollY >= el.offsetTop - 80) cur = id;
  });
  navItems.forEach((btn,i)=>btn.classList.toggle('active', sections[i]===cur));
});

/* ── SAVE / LOAD ── */
function gatherData(){
  const data = { names:[], inputs:{}, stars:{...starData}, badges:{...badgeData}, weights:{}, memos:[] };
  for(let i=0;i<5;i++) data.names.push(document.getElementById('name'+i).value);
  comparisonPage.querySelectorAll('input[id], select[id], textarea[id]').forEach(el=>{
    if(el.id && !el.id.startsWith('name') && !el.id.startsWith('weight-') && !el.id.startsWith('w_'))
      data.inputs[el.id] = el.value;
  });
  ['land','job','transit','school','env','prod'].forEach(k=>{ data.weights[k]=document.getElementById('w_'+k).value; });
  for(let i=0;i<5;i++) data.memos.push(document.getElementById('memo_'+i)?.value||'');
  return data;
}
function applyData(data){
  if(data.names) data.names.forEach((n,i)=>{ document.getElementById('name'+i).value=n; });
  if(data.inputs) Object.entries(data.inputs).forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.value=val; });
  if(data.stars) Object.assign(starData, data.stars);
  if(data.badges) Object.assign(badgeData, data.badges);
  if(data.weights) Object.entries(data.weights).forEach(([k,v])=>{ const el=document.getElementById('w_'+k); if(el) el.value=v; });
  if(data.memos) data.memos.forEach((m,i)=>{ const el=document.getElementById('memo_'+i); if(el) el.value=m; });
  comparisonPage.querySelectorAll('.star-wrap').forEach(buildStars);
  comparisonPage.querySelectorAll('.badge-select').forEach(bs=>{
    const key=bs.dataset.key;
    if(badgeData[key]){
      bs.querySelectorAll('.bs-opt').forEach(opt=>{
        opt.className='bs-opt';
        if(opt.dataset.val===badgeData[key]){
          const v=opt.dataset.val;
          if(['없음','우수','1군','높음'].includes(v)) opt.classList.add('sel-y');
          else if(['있음','부족','3군','낮음'].includes(v)) opt.classList.add('sel-n');
          else opt.classList.add('sel-a');
        }
      });
    }
  });
  syncNames(); updateWeightTotal();
  comparisonPage.querySelectorAll('[id^="prod_year_"]').forEach(inp=>inp.dispatchEvent(new Event('input')));
}
function saveData(){
  const json = JSON.stringify(gatherData());
  const blob = new Blob([json],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '단지분석_저장.json';
  a.click();
}
function loadData(){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => { try { applyData(JSON.parse(ev.target.result)); } catch(e){ alert('파일 형식 오류'); } };
    r.readAsText(f);
  };
  inp.click();
}
function clearAll(){
  if(!confirm('모든 데이터를 초기화할까요?')) return;
  comparisonPage.querySelectorAll('input,select,textarea').forEach(el=>{
    if(el.type==='number'||el.type==='text'||el.tagName==='TEXTAREA') el.value='';
    else if(el.tagName==='SELECT') el.selectedIndex=0;
  });
  Object.keys(starData).forEach(k=>delete starData[k]);
  Object.keys(badgeData).forEach(k=>delete badgeData[k]);
  comparisonPage.querySelectorAll('.star-wrap').forEach(buildStars);
  comparisonPage.querySelectorAll('.bs-opt').forEach(o=>o.className='bs-opt');
  document.getElementById('result-grid').innerHTML='<div style="display:flex;align-items:center;justify-content:center;grid-column:1/-1;color:var(--ink4);font-size:.8rem;padding:2rem">▶ 점수 계산 버튼을 눌러 결과를 확인하세요</div>';
  document.getElementById('score-detail').style.display='none';
  document.getElementById('w_land').value=20;document.getElementById('w_job').value=25;
  document.getElementById('w_transit').value=20;document.getElementById('w_school').value=15;
  document.getElementById('w_env').value=10;document.getElementById('w_prod').value=10;
  updateWeightTotal();
}
updateWeightTotal();
