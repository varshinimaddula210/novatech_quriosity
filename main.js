// ─────────────────────────────────────────────────────────────
// Basis Switching — Quriosity 2026
// Mechanic: A qubit encodes a secret in a specific basis.
// Measure in the right basis → secret revealed.
// Measure in the wrong basis → state collapses randomly, life lost.
// ─────────────────────────────────────────────────────────────

// ── Rounds data ───────────────────────────────────────────────
// Each round has:
//   basis      : 'Z' or 'X' — the correct basis to measure in
//   value      : '0' or '1' — the secret encoded in the qubit
//   clue       : hint that guides the player toward the right basis
//   rightMsg   : feedback shown when player picks correctly
//   wrongMsg   : feedback shown when player picks wrong basis

const ROUNDS = [
  {
    basis: 'Z',
    value: '0',
    clue: 'The qubit was prepared by aligning it with Earth\'s gravitational field — straight up and down. Think about which axis that is.',
    rightMsg: 'The qubit was encoded vertically (↕). The Z-basis reads vertical spin, so you got the true value: |0⟩.',
    wrongMsg: 'The qubit was vertical, but you asked a horizontal question. It had no answer — so it picked randomly. The original state collapsed.',
  },
  {
    basis: 'X',
    value: '1',
    clue: 'This qubit was prepared facing the rising sun — pointing along the horizon, left to right. Which basis captures that direction?',
    rightMsg: 'The qubit was encoded horizontally (↔). The X-basis reads horizontal spin. You asked the right question and got |1⟩.',
    wrongMsg: 'The qubit was horizontal, but the Z-basis only knows up or down. It couldn\'t answer honestly — it collapsed into a random state.',
  },
  {
    basis: 'Z',
    value: '1',
    clue: 'The qubit was set by a compass needle pointing straight down into the ground — a vertical measurement.',
    rightMsg: 'Vertical encoding, vertical question. The Z-basis revealed the true state: |1⟩. Perfect alignment.',
    wrongMsg: 'You asked left-or-right, but the qubit only knew up-or-down. Incompatible bases scrambled the result.',
  },
  {
    basis: 'X',
    value: '0',
    clue: 'This qubit was prepared like the hands of a clock at 9 and 3 — perfectly horizontal, east to west.',
    rightMsg: 'The X-basis reads horizontal spin. Your question matched the encoding. The true value |0⟩ is revealed.',
    wrongMsg: 'The qubit knew left-right, but you asked up-down. The bases were incompatible — your measurement destroyed the original state.',
  },
  {
    basis: 'Z',
    value: '0',
    clue: 'The qubit was aligned using a plumb line hanging from the ceiling — perfectly vertical.',
    rightMsg: 'A vertical qubit, measured vertically. The Z-basis gave you the true answer: |0⟩.',
    wrongMsg: 'Asking a horizontal question about a vertical state is like measuring height with a ruler held sideways. The qubit gave up a random answer.',
  },
  {
    basis: 'X',
    value: '1',
    clue: 'This qubit was set using a spirit level — the kind that tells you something is perfectly flat, left to right.',
    rightMsg: 'Horizontal encoding, horizontal question. The X-basis matched and revealed |1⟩.',
    wrongMsg: 'The Z-basis only knows vertical. It couldn\'t read a horizontal qubit — the state was scrambled on contact.',
  },
  {
    basis: 'Z',
    value: '1',
    clue: 'Final round. The qubit was prepared by a laser pointed straight at the sky — no tilt, purely vertical.',
    rightMsg: 'Last one. Z-basis for a vertical qubit — you matched the encoding and revealed the true value |1⟩. Well played.',
    wrongMsg: 'So close. The qubit was vertical and the X-basis is horizontal. One last incompatibility — the state collapsed.',
  },
];

const TOTAL_ROUNDS = ROUNDS.length;
const MAX_LIVES    = 3;

// ── State ─────────────────────────────────────────────────────
let state = {
  round:       0,
  score:       0,
  lives:       MAX_LIVES,
  answered:    false,
};

// ── DOM refs ──────────────────────────────────────────────────
const screens = {
  start:    document.getElementById('screen-start'),
  how:      document.getElementById('screen-how'),
  game:     document.getElementById('screen-game'),
  gameover: document.getElementById('screen-gameover'),
};

const el = {
  btnStart:      document.getElementById('btn-start'),
  btnHow:        document.getElementById('btn-how'),
  btnBack:       document.getElementById('btn-back'),
  btnZ:          document.getElementById('btn-z'),
  btnX:          document.getElementById('btn-x'),
  btnNext:       document.getElementById('btn-next'),
  btnRestart:    document.getElementById('btn-restart'),

  hudRound:      document.getElementById('hud-round'),
  hudScore:      document.getElementById('hud-score'),
  hudLives:      document.getElementById('hud-lives'),

  qubitOrb:      document.getElementById('qubit-orb'),
  qubitInner:    document.querySelector('#qubit-orb .qubit-inner'),
  qubitLabel:    document.getElementById('qubit-label'),
  clueText:      document.getElementById('clue-text'),

  resultBox:     document.getElementById('result-box'),
  resultIcon:    document.getElementById('result-icon'),
  resultTitle:   document.getElementById('result-title'),
  resultExpl:    document.getElementById('result-explanation'),

  gameoverIcon:  document.getElementById('gameover-icon'),
  gameoverTitle: document.getElementById('gameover-title'),
  gameoverMsg:   document.getElementById('gameover-msg'),
  finalScore:    document.getElementById('final-score'),
  physicsNote:   document.getElementById('physics-note'),
};

// ── Screen navigation ─────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Lives display ─────────────────────────────────────────────
function renderLives(lives) {
  return '❤️'.repeat(lives) + '🖤'.repeat(MAX_LIVES - lives);
}

// ── Load a round ──────────────────────────────────────────────
function loadRound() {
  const round = ROUNDS[state.round];
  state.answered = false;

  // HUD
  el.hudRound.textContent = `${state.round + 1} / ${TOTAL_ROUNDS}`;
  el.hudScore.textContent = state.score;
  el.hudLives.textContent = renderLives(state.lives);

  // Qubit orb — reset to superposition
  el.qubitOrb.className   = 'qubit-orb';
  el.qubitInner.textContent = '?';
  el.qubitLabel.textContent = 'Qubit in superposition';

  // Clue
  el.clueText.textContent = round.clue;

  // Basis buttons — re-enable
  el.btnZ.disabled = false;
  el.btnX.disabled = false;

  // Hide result
  el.resultBox.classList.add('hidden');
  el.resultBox.className = 'result-box hidden';
}

// ── Handle measurement ────────────────────────────────────────
function measure(chosenBasis) {
  if (state.answered) return;
  state.answered = true;

  const round   = ROUNDS[state.round];
  const correct = chosenBasis === round.basis;

  // Disable buttons
  el.btnZ.disabled = true;
  el.btnX.disabled = true;

  if (correct) {
    // Right basis — reveal true value
    state.score += 100 + (state.lives * 10); // bonus for lives remaining

    el.qubitOrb.classList.add('correct');
    el.qubitInner.textContent = `|${round.value}⟩`;
    el.qubitLabel.textContent = `Measured in ${round.basis}-basis → |${round.value}⟩`;

    el.resultIcon.textContent  = '✅';
    el.resultTitle.textContent = `Correct! You chose the ${chosenBasis}-basis.`;
    el.resultTitle.style.color = 'var(--success)';
    el.resultExpl.textContent  = round.rightMsg;

  } else {
    // Wrong basis — random collapse
    state.lives -= 1;
    const randomValue = Math.random() < 0.5 ? '0' : '1';

    el.qubitOrb.classList.add('wrong');
    el.qubitInner.textContent = `|${randomValue}⟩`;
    el.qubitLabel.textContent = `Collapsed randomly → |${randomValue}⟩ (not the true state)`;

    el.resultIcon.textContent  = '💥';
    el.resultTitle.textContent = `Wrong basis — state collapsed.`;
    el.resultTitle.style.color = 'var(--danger)';
    el.resultExpl.textContent  = round.wrongMsg;

    // Update lives in HUD immediately
    el.hudLives.textContent = renderLives(state.lives);
  }

  // Show result
  el.resultBox.classList.remove('hidden');

  // Check if game over (no lives left)
  if (state.lives <= 0) {
    el.btnNext.textContent = 'See Results →';
  } else if (state.round >= TOTAL_ROUNDS - 1) {
    el.btnNext.textContent = 'See Final Score →';
  } else {
    el.btnNext.textContent = 'Next Round →';
  }
}

// ── Advance to next round or end ──────────────────────────────
function nextRound() {
  if (state.lives <= 0) {
    endGame(false);
    return;
  }

  state.round += 1;

  if (state.round >= TOTAL_ROUNDS) {
    endGame(true);
    return;
  }

  loadRound();
}

// ── End game ──────────────────────────────────────────────────
function endGame(won) {
  el.finalScore.textContent = state.score;

  if (won) {
    el.gameoverIcon.textContent  = '🎉';
    el.gameoverTitle.textContent = 'You mastered the bases!';
    el.gameoverMsg.textContent   = `You survived all ${TOTAL_ROUNDS} rounds by asking the right questions.`;
    el.physicsNote.innerHTML     =
      '<strong>What you just experienced:</strong> In quantum mechanics, a qubit stores information in a specific basis. ' +
      'Measuring in a different basis is like asking the wrong question — the qubit can\'t answer honestly, so it ' +
      'collapses to a random state. This is <em>measurement scrambling</em>, and it\'s why basis choice matters in ' +
      'quantum cryptography (BB84) and quantum communication.';
  } else {
    el.gameoverIcon.textContent  = '💀';
    el.gameoverTitle.textContent = 'The qubits got you.';
    el.gameoverMsg.textContent   = 'You ran out of lives. Every wrong basis collapsed a state that couldn\'t be recovered.';
    el.physicsNote.innerHTML     =
      '<strong>What went wrong:</strong> Measuring a qubit in the wrong basis destroys the original state permanently — ' +
      'this is <em>state collapse</em>. Once collapsed, the true value is gone forever. ' +
      'That irreversibility is one of the strangest things about quantum measurement. ' +
      'Try again and use the clues to match the basis before you measure.';
  }

  showScreen('gameover');
}

// ── Reset and restart ─────────────────────────────────────────
function resetGame() {
  state.round    = 0;
  state.score    = 0;
  state.lives    = MAX_LIVES;
  state.answered = false;
  loadRound();
  showScreen('game');
}

// ── Event listeners ───────────────────────────────────────────
el.btnStart.addEventListener('click', () => {
  resetGame();
});

el.btnHow.addEventListener('click', () => {
  showScreen('how');
});

el.btnBack.addEventListener('click', () => {
  showScreen('start');
});

el.btnZ.addEventListener('click', () => measure('Z'));
el.btnX.addEventListener('click', () => measure('X'));

el.btnNext.addEventListener('click', () => nextRound());

el.btnRestart.addEventListener('click', () => resetGame());

// ── Init ──────────────────────────────────────────────────────
showScreen('start');
