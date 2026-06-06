import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

const firebaseConfig = {
  apiKey: "AIzaSyBKC5M7gyOeI-rSBIgc5GdA1wOLyUSEA44",
  authDomain: "baka-point.firebaseapp.com",
  databaseURL: "https://baka-point-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "baka-point",
  storageBucket: "baka-point.firebasestorage.app",
  messagingSenderId: "355775729937",
  appId: "1:355775729937:web:1351a699ce64ff068d7cb0"
};

emailjs.init("aq0x6GGbMqGwmBue-");

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pointsRef = ref(db, 'bakaPoints');

const bakaBtn = document.getElementById('baka-btn');
const pointValue = document.getElementById('point-value');
const resetBtn = document.getElementById('reset-btn');
const forgiveBtn = document.getElementById('forgive-btn');
const floatsContainer = document.getElementById('floats-container');

let lastKnownValue = null;
let emailDebounceTimer = null;
let emailFrom = null;

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

function sendEmailNotification(fromPoints, toPoints) {
  const change = toPoints - fromPoints;
  emailjs.send("service_u8xa2ux", "template_3ecrzt9", {
    from_points: fromPoints,
    to_points: toPoints,
    change: change > 0 ? `+${change}` : `${change}`,
  });
}

// リアルタイムでポイントを監視
onValue(pointsRef, (snapshot) => {
  const val = snapshot.val() ?? 0;

  if (lastKnownValue === null) {
    lastKnownValue = val;
    pointValue.textContent = val.toLocaleString();
    return;
  }

  if (val !== lastKnownValue) {
    const prev = lastKnownValue;
    lastKnownValue = val;
    pointValue.textContent = val.toLocaleString();

    if (val > prev) {
      popAnimation();
      if (val % 10 === 0) spawnMilestoneFloat(val);
    }

    // 値が落ち着いてから1通だけ送信（1秒デバウンス）
    if (!emailDebounceTimer) emailFrom = prev;
    clearTimeout(emailDebounceTimer);
    emailDebounceTimer = setTimeout(() => {
      sendEmailNotification(emailFrom, val);
      emailDebounceTimer = null;
      emailFrom = null;
    }, 1000);
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
