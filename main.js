// ─────────────────────────────────────────────
// Quriosity 2026 — Basis Switching
// ─────────────────────────────────────────────

const app = document.getElementById('app');

// Game state — fill this out once the mechanic is decided
const state = {
  // e.g. currentBasis: 'Z', qubitState: null, score: 0
};

// ─── Entry point ─────────────────────────────
function init() {
  render();
}

// ─── Render ───────────────────────────────────
function render() {
  app.innerHTML = `
    <h1>Basis Switching</h1>
    <p>Game loads here.</p>
  `;
}

// ─── Start ────────────────────────────────────
init();
