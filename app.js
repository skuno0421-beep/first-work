import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ===================================================
// ここにFirebaseの設定を貼り付けてください
// Firebase Console > プロジェクト設定 > マイアプリ から取得
// ===================================================
const firebaseConfig = {
  apiKey: "AIzaSyBKC5M7gyOeI-rSBIgc5GdA1wOLyUSEA44",
  authDomain: "baka-point.firebaseapp.com",
  databaseURL: "https://baka-point-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "baka-point",
  storageBucket: "baka-point.firebasestorage.app",
  messagingSenderId: "355775729937",
  appId: "1:355775729937:web:1351a699ce64ff068d7cb0"
};
// ===================================================

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pointsRef = ref(db, 'bakaPoints');

const bakaBtn = document.getElementById('baka-btn');
const pointValue = document.getElementById('point-value');
const resetBtn = document.getElementById('reset-btn');
const forgiveBtn = document.getElementById('forgive-btn');
const floatsContainer = document.getElementById('floats-container');

function popAnimation() {
  pointValue.classList.remove('pop');
  void pointValue.offsetWidth;
  pointValue.classList.add('pop');
  setTimeout(() => pointValue.classList.remove('pop'), 150);
}

function spawnFloat(x, y, text) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = (x - 60) + 'px';
  el.style.top = (y - 20) + 'px';
  floatsContainer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function spawnMilestoneFloat(val) {
  const el = document.createElement('div');
  el.className = 'milestone-text';
  el.innerHTML = `${val.toLocaleString()}ポイント獲得おめでとう！<br>きっと褒美があるよ`;
  el.style.left = '50%';
  el.style.top = '40%';
  floatsContainer.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// リアルタイムでポイントを監視
onValue(pointsRef, (snapshot) => {
  const val = snapshot.val() ?? 0;
  const prev = parseInt(pointValue.textContent.replace(/,/g, '')) || 0;
  pointValue.textContent = val.toLocaleString();
  if (val > prev) {
    popAnimation();
    if (val % 10 === 0) spawnMilestoneFloat(val);
  }
});

bakaBtn.addEventListener('click', (e) => {
  runTransaction(pointsRef, (current) => (current ?? 0) + 1);
  spawnFloat(e.clientX, e.clientY, '+1 ばか！');
});

forgiveBtn.addEventListener('click', async (e) => {
  spawnFloat(e.clientX, e.clientY, '❤️ 許してあげる！');
  const snapshot = await get(pointsRef);
  const cur = snapshot.val() ?? 0;
  if (cur > 0) {
    set(pointsRef, cur - 1);
  }
});

resetBtn.addEventListener('click', () => {
  if (!confirm('ポイントをリセットしますか？')) return;
  set(pointsRef, 0);
});
