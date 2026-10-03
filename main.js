// ─────────────────────────────────────────────────────────────
// Quantum Cop — Quriosity 2026
//
// Mechanic: A thief hides on a 5×5 grid, encoded in a basis.
// Footprints hint at which basis (Z=vertical, X=horizontal).
// Scan the right line in the right basis → caught.
// Wrong basis → state collapses, thief teleports, scan wasted.
// ─────────────────────────────────────────────────────────────

const GRID_SIZE  = 5;
const MAX_SCANS  = 5;
const MAX_ROUNDS = 5;

// ── Game state ────────────────────────────────────────────────
let state = {};

// ── DOM refs ──────────────────────────────────────────────────
const screens = {
  start:    document.getElementById('screen-start'),
  how:      document.getElementById('screen-how'),
  game:     document.getElementById('screen-game'),
  result:   document.getElementById('screen-result'),
  gameover: document.getElementById('screen-gameover'),
};

const el = {
  btnStart:     document.getElementById('btn-start'),
  btnHow:       document.getElementById('btn-how'),
  btnBack:      document.getElementById('btn-back'),
  btnZ:         document.getElementById('btn-z'),
  btnX:         document.getElementById('btn-x'),
  btnCancel:    document.getElementById('btn-cancel'),
  btnNextRound: document.getElementById('btn-next-round'),
  btnRestart:   document.getElementById('btn-restart'),

  hudRound:     document.getElementById('hud-round'),
  hudScans:     document.getElementById('hud-scans'),
  hudScore:     document.getElementById('hud-score'),

  statusMsg:    document.getElementById('status-msg'),
  grid:         document.getElementById('grid'),
  colLabels:    document.getElementById('col-labels'),
  rowLabels:    document.getElementById('row-labels'),

  basisSection: document.querySelector('.basis-section'),
  scanSelector: document.getElementById('scan-selector'),
  scanPrompt:   document.getElementById('scan-prompt'),
  scanButtons:  document.getElementById('scan-buttons'),

  resIcon:      document.getElementById('res-icon'),
  resTitle:     document.getElementById('res-title'),
  resMsg:       document.getElementById('res-msg'),
  resPhysics:   document.getElementById('res-physics'),

  goIcon:       document.getElementById('go-icon'),
  goTitle:      document.getElementById('go-title'),
  goMsg:        document.getElementById('go-msg'),
  goPhysics:    document.getElementById('go-physics'),
  finalScore:   document.getElementById('final-score'),
};

// ── Screen navigation ─────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Utility ───────────────────────────────────────────────────
function rand(n) { return Math.floor(Math.random() * n); }

function cellIndex(row, col) { return row * GRID_SIZE + col; }

// ── Generate footprints ───────────────────────────────────────
// Places footprint trail hinting at thief's basis.
// Z-basis (vertical):   footprints in thief's column, above/below
// X-basis (horizontal): footprints in thief's row, left/right
function generateFootprints(thief, basis) {
  const prints = new Set();

  if (basis === 'Z') {
    // vertical trail — 2–3 cells in same column, excluding thief cell
    const col = thief.col;
    const rows = [...Array(GRID_SIZE).keys()].filter(r => r !== thief.row);
    shuffle(rows);
    rows.slice(0, 3).forEach(r => prints.add(cellIndex(r, col)));
  } else {
    // horizontal trail — 2–3 cells in same row, excluding thief cell
    const row = thief.row;
    const cols = [...Array(GRID_SIZE).keys()].filter(c => c !== thief.col);
    shuffle(cols);
    cols.slice(0, 3).forEach(c => prints.add(cellIndex(row, c)));
  }

  return prints;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Init round ────────────────────────────────────────────────
function initRound() {
  state.thief      = { row: rand(GRID_SIZE), col: rand(GRID_SIZE) };
  state.basis      = Math.random() < 0.5 ? 'Z' : 'X';
  state.footprints = generateFootprints(state.thief, state.basis);
  state.scansLeft  = MAX_SCANS;
  state.selectedBasis = null;
  state.roundOver  = false;

  renderHUD();
  renderGrid();
  renderLabels();
  showBasisSelector();
  setStatus('Read the footprints. Then choose your measurement basis.');
}

// ── Render HUD ────────────────────────────────────────────────
function renderHUD() {
  el.hudRound.textContent = `${state.round} / ${MAX_ROUNDS}`;
  el.hudScans.textContent = state.scansLeft;
  el.hudScore.textContent = state.score;
}

// ── Render grid ───────────────────────────────────────────────
function renderGrid() {
  el.grid.innerHTML = '';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (state.footprints.has(cellIndex(r, c))) {
        cell.classList.add(state.basis === 'Z' ? 'footprint-v' : 'footprint-h');
      }

      el.grid.appendChild(cell);
    }
  }
}

// ── Render row/col labels ─────────────────────────────────────
function renderLabels() {
  el.colLabels.innerHTML = '';
  el.rowLabels.innerHTML = '';

  for (let i = 0; i < GRID_SIZE; i++) {
    const col = document.createElement('div');
    col.className = 'col-label';
    col.textContent = `C${i + 1}`;
    col.dataset.col = i;
    el.colLabels.appendChild(col);

    const row = document.createElement('div');
    row.className = 'row-label';
    row.textContent = `R${i + 1}`;
    row.dataset.row = i;
    el.rowLabels.appendChild(row);
  }
}

// ── Status message ────────────────────────────────────────────
function setStatus(msg, type = 'default') {
  el.statusMsg.textContent = msg;
  el.statusMsg.style.color = type === 'error' ? 'var(--danger)'
    : type === 'success' ? 'var(--success)'
    : 'var(--accent-light)';
  el.statusMsg.style.borderColor = type === 'error' ? 'rgba(239,68,68,0.3)'
    : type === 'success' ? 'rgba(34,197,94,0.3)'
    : 'rgba(124,58,237,0.2)';
  el.statusMsg.style.background = type === 'error' ? 'rgba(239,68,68,0.07)'
    : type === 'success' ? 'rgba(34,197,94,0.07)'
    : 'rgba(124,58,237,0.08)';
}

// ── Show basis selector ───────────────────────────────────────
function showBasisSelector() {
  el.basisSection.style.display = 'flex';
  el.scanSelector.classList.add('hidden');
  el.btnZ.disabled = false;
  el.btnX.disabled = false;
}

// ── Player picks a basis ──────────────────────────────────────
function pickBasis(basis) {
  if (state.roundOver) return;
  state.selectedBasis = basis;

  // hide basis buttons, show line selector
  el.basisSection.style.display = 'none';
  el.scanSelector.classList.remove('hidden');

  if (basis === 'Z') {
    el.scanPrompt.textContent = 'Z-basis selected — pick a ROW to scan (↕)';
    el.scanPrompt.style.color = 'var(--z-color)';
  } else {
    el.scanPrompt.textContent = 'X-basis selected — pick a COLUMN to scan (↔)';
    el.scanPrompt.style.color = 'var(--x-color)';
  }

  // build scan buttons
  el.scanButtons.innerHTML = '';
  for (let i = 0; i < GRID_SIZE; i++) {
    const btn = document.createElement('button');
    btn.className = `btn-scan ${basis === 'Z' ? 'z-scan' : 'x-scan'}`;
    btn.textContent = basis === 'Z' ? `R${i + 1}` : `C${i + 1}`;
    btn.dataset.index = i;
    btn.addEventListener('click', () => scan(i));
    el.scanButtons.appendChild(btn);
  }

  // highlight the relevant lines on grid
  clearHighlights();
}

// ── Highlight row or column ───────────────────────────────────
function highlightLine(index, basis) {
  clearHighlights();
  const cells = el.grid.querySelectorAll('.cell');
  cells.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    if (basis === 'Z' && r === index) cell.classList.add('scan-highlight');
    if (basis === 'X' && c === index) cell.classList.add('scan-highlight-col');
  });
}

function clearHighlights() {
  el.grid.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('scan-highlight', 'scan-highlight-col');
  });
}

// ── Execute scan ──────────────────────────────────────────────
function scan(index) {
  if (state.roundOver) return;

  const chosen = state.selectedBasis;
  const correct = chosen === state.basis;

  highlightLine(index, chosen);
  state.scansLeft -= 1;
  renderHUD();

  if (correct) {
    // right basis — check if thief is in this line
    const thief = state.thief;
    const inLine = (chosen === 'Z' && thief.row === index)
                || (chosen === 'X' && thief.col === index);

    if (inLine) {
      // CAUGHT
      const thief = state.thief;
      const caughtCell = el.grid.querySelector(
        `.cell[data-row="${thief.row}"][data-col="${thief.col}"]`
      );
      caughtCell.textContent = '🦹';
      caughtCell.classList.add('caught');

      const scoreGain = 100 + state.scansLeft * 20;
      state.score += scoreGain;
      renderHUD();
      setStatus(`🎉 Got them! +${scoreGain} points`, 'success');

      state.roundOver = true;
      el.basisSection.style.display = 'none';
      el.scanSelector.classList.add('hidden');

      setTimeout(() => showRoundResult(true), 1000);

    } else {
      // right basis, wrong line — no teleport, just miss
      setStatus(`Correct basis! But the thief isn't in that line. Keep scanning.`);
      showBasisSelector();
      if (state.scansLeft <= 0) {
        state.roundOver = true;
        setTimeout(() => showRoundResult(false), 600);
      }
    }

  } else {
    // WRONG BASIS — state collapses, thief teleports
    wrongBasisCollapse(index, chosen);
  }
}

// ── Wrong basis collapse ──────────────────────────────────────
function wrongBasisCollapse(index, chosenBasis) {
  // flash the scanned line red
  const cells = el.grid.querySelectorAll('.cell');
  cells.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    if (chosenBasis === 'Z' && r === index) cell.classList.add('wrong-scan');
    if (chosenBasis === 'X' && c === index) cell.classList.add('wrong-scan');
  });

  setStatus('💥 Wrong basis! The quantum state collapsed — thief teleported!', 'error');

  setTimeout(() => {
    clearHighlights();

    // teleport thief to new random location
    let newRow, newCol;
    do {
      newRow = rand(GRID_SIZE);
      newCol = rand(GRID_SIZE);
    } while (newRow === state.thief.row && newCol === state.thief.col);

    state.thief = { row: newRow, col: newCol };

    // flip basis randomly (collapse = new state)
    state.basis = Math.random() < 0.5 ? 'Z' : 'X';

    // regenerate footprints
    state.footprints = generateFootprints(state.thief, state.basis);

    // re-render grid with new footprints
    renderGrid();

    // flash new thief cell briefly
    const newCell = el.grid.querySelector(
      `.cell[data-row="${state.thief.row}"][data-col="${state.thief.col}"]`
    );
    if (newCell) {
      newCell.classList.add('teleport');
      setTimeout(() => newCell.classList.remove('teleport'), 400);
    }

    setStatus('Footprints scrambled. Read them again and choose your basis.', 'error');
    showBasisSelector();

    if (state.scansLeft <= 0) {
      state.roundOver = true;
      setTimeout(() => showRoundResult(false), 800);
    }
  }, 600);
}

// ── Round result screen ───────────────────────────────────────
function showRoundResult(caught) {
  if (caught) {
    el.resIcon.textContent  = '🚔';
    el.resTitle.textContent = 'Thief caught!';
    el.resMsg.textContent   = `You read the footprints correctly and scanned in the right basis. The qubit revealed the true location.`;
    el.resPhysics.innerHTML =
      '<strong>What happened:</strong> The thief was encoded in the ' + state.basis +
      '-basis. Measuring in the same basis is like asking the right question — ' +
      'the quantum state gave you the true answer without collapsing unpredictably.';
  } else {
    el.resIcon.textContent  = '🏃';
    el.resTitle.textContent = 'Thief escaped.';
    el.resMsg.textContent   = `You ran out of scans. The wrong basis collapsed the state too many times.`;
    el.resPhysics.innerHTML =
      '<strong>What happened:</strong> Each time you chose the wrong basis, the qubit\'s state collapsed — ' +
      'like rotating your measuring device 90° and losing the original information. ' +
      'The thief\'s position was destroyed and replaced with a random new state. ' +
      'This is <em>measurement scrambling</em>: the wrong question destroys the answer.';
  }

  if (state.round >= MAX_ROUNDS) {
    el.btnNextRound.textContent = 'See Final Score →';
  } else {
    el.btnNextRound.textContent = 'Next Round →';
  }

  showScreen('result');
}

// ── Game over ─────────────────────────────────────────────────
function endGame() {
  const caught = state.score > 0;
  el.finalScore.textContent = state.score;

  el.goIcon.textContent  = state.score >= 300 ? '🏆' : state.score >= 100 ? '🚔' : '😅';
  el.goTitle.textContent = state.score >= 300 ? 'Master Detective!' : state.score >= 100 ? 'Good work, officer.' : 'The qubits won this time.';
  el.goMsg.textContent   = `You completed ${MAX_ROUNDS} rounds with a score of ${state.score}.`;
  el.goPhysics.innerHTML =
    '<strong>The real physics:</strong> Basis switching is at the heart of quantum cryptography. ' +
    'In the BB84 protocol, Alice sends qubits encoded in random bases. If Eve intercepts and measures ' +
    'in the wrong basis, she collapses the state — and Alice and Bob can <em>detect</em> the eavesdropper ' +
    'by comparing bases afterwards. The wrong question always leaves a trace.';

  showScreen('gameover');
}

// ── Reset ─────────────────────────────────────────────────────
function resetGame() {
  state = { round: 0, score: 0 };
  startNextRound();
}

function startNextRound() {
  state.round += 1;
  initRound();
  showScreen('game');
}

// ── Event listeners ───────────────────────────────────────────
el.btnStart.addEventListener('click', resetGame);
el.btnHow.addEventListener('click',   () => showScreen('how'));
el.btnBack.addEventListener('click',  () => showScreen('start'));
el.btnRestart.addEventListener('click', resetGame);

el.btnZ.addEventListener('click', () => pickBasis('Z'));
el.btnX.addEventListener('click', () => pickBasis('X'));

el.btnCancel.addEventListener('click', () => {
  state.selectedBasis = null;
  clearHighlights();
  showBasisSelector();
  setStatus('Basis reset. Choose again.');
});

el.btnNextRound.addEventListener('click', () => {
  if (state.round >= MAX_ROUNDS) {
    endGame();
  } else {
    startNextRound();
  }
});

// Hover preview on scan buttons — highlight line on hover
el.scanButtons.addEventListener('mouseover', (e) => {
  const btn = e.target.closest('.btn-scan');
  if (btn) highlightLine(parseInt(btn.dataset.index), state.selectedBasis);
});

el.scanButtons.addEventListener('mouseleave', () => clearHighlights());

// ── Boot ──────────────────────────────────────────────────────
showScreen('start');
