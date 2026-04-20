// ── BANCO DE DADOS (localStorage) ──────────────────────────────────────
const DB_KEY = 'milhas_dash_v2';

function dbLoad() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || { contas: [] }; }
  catch { return { contas: [] }; }
}
function dbSave(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ── FORMATAÇÃO ──────────────────────────────────────────────────────────
function fmt(n) {
  return Math.round(Number(n)).toLocaleString('pt-BR');
}
function fmtR(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}
function fmtData(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// ── TOAST ───────────────────────────────────────────────────────────────
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ── SUMÁRIO ─────────────────────────────────────────────────────────────
function renderSummary() {
  const db = dbLoad();
  const totalPts = db.contas.reduce((a, c) => a + Number(c.pontos), 0);
  const totalPax = db.contas.reduce((a, c) => a + Number(c.pax), 0);
  const totalEm  = db.contas.reduce((a, c) => a + (c.emissoes || []).length, 0);

  document.getElementById('s-contas').textContent = db.contas.length;
  document.getElementById('s-pts').textContent    = fmt(totalPts);
  document.getElementById('s-pax').textContent    = fmt(totalPax);
  document.getElementById('s-em').textContent     = totalEm;
  document.getElementById('header-meta').textContent =
    `${db.contas.length} conta${db.contas.length !== 1 ? 's' : ''} · ${fmt(totalPts)} pts`;
}

// ── CARDS ───────────────────────────────────────────────────────────────
function renderCards() {
  const db    = dbLoad();
  const query = (document.getElementById('search-input')?.value || '').toLowerCase();
  const cont  = document.getElementById('cards-grid');

  let contas = db.contas;
  if (query) {
    contas = contas.filter(c =>
      c.nome.toLowerCase().includes(query) ||
      c.programa.toLowerCase().includes(query)
    );
  }

  if (!contas.length) {
    const isEmpty = db.contas.length === 0;
    cont.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <div class="empty-title">${isEmpty ? 'Nenhuma conta ainda' : 'Nada encontrado'}</div>
        <div class="empty-sub">${isEmpty ? 'Clique em "Nova conta" para começar' : 'Tente outro termo de busca'}</div>
      </div>`;
    return;
  }

  cont.innerHTML = contas.map(c => {
    const pax    = Number(c.pax);
    const pts    = Number(c.pontos);
    const media  = pax > 0 ? Math.round(pts / pax) : 0;
    const nEm    = (c.emissoes || []).length;

    return `
    <div class="card" id="card-${c.id}">
      <div class="card-top">
        <div>
          <div class="card-nome">${c.nome}</div>
          <div class="card-prog">${c.programa}</div>
        </div>
        <span class="badge-prog">${c.programa}</span>
      </div>

      <div class="card-kpis">
        <div class="kpi">
          <div class="kpi-label">Pontos</div>
          <div class="kpi-val">${fmt(pts)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Passageiros</div>
          <div class="kpi-val">${pax}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Milheiro</div>
          <div class="kpi-val">${fmtR(c.milheiro)}</div>
        </div>
      </div>

      <div class="card-media">
        <div class="card-media-label">Média por emissão</div>
        <div class="card-media-val">
          ${fmt(media)}<span class="card-media-unit">pts/pax</span>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-sm btn-green" onclick="abrirModalEmissao('${c.id}')">+ Emitir</button>
        <button class="btn btn-sm" onclick="abrirModalHistorico('${c.id}')">Histórico (${nEm})</button>
        <button class="btn btn-sm" onclick="abrirModalConta('${c.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirConta('${c.id}')">✕</button>
      </div>
    </div>`;
  }).join('');
}

function render() {
  renderSummary();
  renderCards();
}

// ── MODAL CONTA ─────────────────────────────────────────────────────────
function abrirModalConta(id) {
  ['f-nome','f-prog','f-pax','f-pts','f-mil','f-edit-id'].forEach(x => {
    document.getElementById(x).value = '';
  });
  document.getElementById('modal-conta-title').textContent = 'Nova conta';

  if (id) {
    const db = dbLoad();
    const c  = db.contas.find(x => x.id === id);
    if (c) {
      document.getElementById('f-nome').value    = c.nome;
      document.getElementById('f-prog').value    = c.programa;
      document.getElementById('f-pax').value     = c.pax;
      document.getElementById('f-pts').value     = c.pontos;
      document.getElementById('f-mil').value     = c.milheiro;
      document.getElementById('f-edit-id').value = c.id;
      document.getElementById('modal-conta-title').textContent = 'Editar conta';
    }
  }
  document.getElementById('modal-conta').classList.add('open');
  setTimeout(() => document.getElementById('f-nome').focus(), 100);
}

function fecharModalConta(e) {
  if (e && e.target !== document.getElementById('modal-conta')) return;
  document.getElementById('modal-conta').classList.remove('open');
}

function salvarConta() {
  const nome = document.getElementById('f-nome').value.trim();
  const prog = document.getElementById('f-prog').value.trim();
  const pax  = parseInt(document.getElementById('f-pax').value) || 0;
  const pts  = parseInt(document.getElementById('f-pts').value) || 0;
  const mil  = parseFloat(document.getElementById('f-mil').value) || 0;
  const editId = document.getElementById('f-edit-id').value;

  if (!nome) { alert('Informe o nome da conta.'); return; }
  if (!prog) { alert('Informe o programa.'); return; }
  if (pax <= 0) { alert('Passageiros deve ser maior que zero.'); return; }

  const db = dbLoad();
  if (editId) {
    const c = db.contas.find(x => x.id === editId);
    if (c) { c.nome = nome; c.programa = prog; c.pax = pax; c.pontos = pts; c.milheiro = mil; }
    toast('Conta atualizada ✓');
  } else {
    db.contas.unshift({
      id: Date.now().toString(),
      nome, programa: prog, pax, pontos: pts, milheiro: mil,
      emissoes: [],
      criadoEm: new Date().toISOString()
    });
    toast('Conta adicionada ✓');
  }
  dbSave(db);
  document.getElementById('modal-conta').classList.remove('open');
  render();
}

function excluirConta(id) {
  const db = dbLoad();
  const c  = db.contas.find(x => x.id === id);
  if (!c) return;
  if (!confirm(`Excluir a conta "${c.nome}" e todas as emissões? Esta ação não pode ser desfeita.`)) return;
  db.contas = db.contas.filter(x => x.id !== id);
  dbSave(db);
  toast('Conta excluída');
  render();
}

// ── MODAL EMISSÃO ───────────────────────────────────────────────────────
function abrirModalEmissao(id) {
  const db = dbLoad();
  const c  = db.contas.find(x => x.id === id);
  if (!c) return;

  document.getElementById('e-conta-id').value = id;
  document.getElementById('e-loc').value  = '';
  document.getElementById('e-pax').value  = '';
  document.getElementById('e-pts').value  = '';
  document.getElementById('e-data').value = new Date().toISOString().split('T')[0];

  document.getElementById('emissao-conta-info').innerHTML =
    `<strong>${c.nome}</strong> · ${c.programa} &nbsp;|&nbsp; ${fmt(c.pontos)} pts disponíveis · ${c.pax} passageiros`;

  document.getElementById('modal-emissao').classList.add('open');
  setTimeout(() => document.getElementById('e-loc').focus(), 100);
}

function fecharModalEmissao(e) {
  if (e && e.target !== document.getElementById('modal-emissao')) return;
  document.getElementById('modal-emissao').classList.remove('open');
}

function salvarEmissao() {
  const cid  = document.getElementById('e-conta-id').value;
  const loc  = document.getElementById('e-loc').value.trim().toUpperCase();
  const pax  = parseInt(document.getElementById('e-pax').value) || 0;
  const pts  = parseInt(document.getElementById('e-pts').value) || 0;
  const data = document.getElementById('e-data').value;

  if (!loc)     { alert('Informe o localizador.'); return; }
  if (pax <= 0) { alert('Passageiros deve ser maior que zero.'); return; }
  if (pts <= 0) { alert('Pontos deve ser maior que zero.'); return; }
  if (!data)    { alert('Informe a data da emissão.'); return; }

  const db = dbLoad();
  const c  = db.contas.find(x => x.id === cid);
  if (!c) return;

  if (pts > c.pontos) {
    if (!confirm(`Atenção: os pontos utilizados (${fmt(pts)}) são maiores que o saldo atual (${fmt(c.pontos)}). Continuar mesmo assim?`)) return;
  }

  c.emissoes = c.emissoes || [];
  c.emissoes.unshift({ loc, pax, pts, data, registradoEm: new Date().toISOString() });
  c.pontos = Math.max(0, Number(c.pontos) - pts);
  c.pax    = Math.max(0, Number(c.pax) - pax);

  dbSave(db);
  document.getElementById('modal-emissao').classList.remove('open');
  toast(`Emissão ${loc} registrada ✓`);
  render();
}

// ── MODAL HISTÓRICO ─────────────────────────────────────────────────────
function abrirModalHistorico(id) {
  const db = dbLoad();
  const c  = db.contas.find(x => x.id === id);
  if (!c) return;

  document.getElementById('hist-title').textContent = `${c.nome} · Histórico`;

  const emissoes = c.emissoes || [];
  const body = document.getElementById('hist-body');

  if (!emissoes.length) {
    body.innerHTML = '<div class="hist-empty">Nenhuma emissão registrada ainda.</div>';
  } else {
    const rows = emissoes.map(e => `
      <tr>
        <td><span class="hist-loc">${e.loc}</span></td>
        <td>${e.pax} pax</td>
        <td><span class="hist-pts">-${fmt(e.pts)} pts</span></td>
        <td>${fmtData(e.data)}</td>
      </tr>
    `).join('');
    body.innerHTML = `
      <table class="hist-table">
        <thead>
          <tr>
            <th>Localizador</th>
            <th>Passageiros</th>
            <th>Pontos</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  document.getElementById('modal-historico').classList.add('open');
}

function fecharModalHistorico(e) {
  if (e && e.target !== document.getElementById('modal-historico')) return;
  document.getElementById('modal-historico').classList.remove('open');
}

// ── ATALHOS DE TECLADO ──────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modal-conta','modal-emissao','modal-historico'].forEach(id => {
      document.getElementById(id).classList.remove('open');
    });
  }
});

// ── INIT ────────────────────────────────────────────────────────────────
render();
