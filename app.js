const bakaBtn = document.getElementById('baka-btn');
const pointValue = document.getElementById('point-value');
const resetBtn = document.getElementById('reset-btn');
const floatsContainer = document.getElementById('floats-container');

let points = parseInt(localStorage.getItem('baka-points') || '0');

function updateDisplay() {
  pointValue.textContent = points.toLocaleString();
}

function popAnimation() {
  pointValue.classList.remove('pop');
  void pointValue.offsetWidth;
  pointValue.classList.add('pop');
  setTimeout(() => pointValue.classList.remove('pop'), 150);
}

function spawnFloat(x, y) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = '+1 ばか！';
  el.style.left = (x - 40) + 'px';
  el.style.top = (y - 20) + 'px';
  floatsContainer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

bakaBtn.addEventListener('click', (e) => {
  points++;
  localStorage.setItem('baka-points', points);
  updateDisplay();
  popAnimation();
  spawnFloat(e.clientX, e.clientY);
});

resetBtn.addEventListener('click', () => {
  if (!confirm('ポイントをリセットしますか？')) return;
  points = 0;
  localStorage.setItem('baka-points', 0);
  updateDisplay();
});

updateDisplay();
