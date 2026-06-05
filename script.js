// script.js — shared utilities (Firebase init is handled inline in each page)
// This file intentionally kept minimal; all page logic is self-contained.

// Global utility: format date nicely
window.fmtDate = function(isoOrSeconds) {
  if (!isoOrSeconds) return 'N/A';
  let d;
  if (typeof isoOrSeconds === 'object' && isoOrSeconds.seconds) {
    d = new Date(isoOrSeconds.seconds * 1000);
  } else {
    d = new Date(isoOrSeconds);
  }
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Global utility: get marks slab label
window.getMarksSlab = function(marks, maxMarks) {
  if (marks === null || marks === undefined) return { label: 'Not Graded', color: 'grey' };
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return { label: '🏆 Excellent', color: '#00e5a0' };
  if (pct >= 75) return { label: '⭐ Distinction', color: '#4f8cff' };
  if (pct >= 60) return { label: '✅ First Class', color: '#a259ff' };
  if (pct >= 50) return { label: '👍 Pass', color: '#ffb347' };
  return { label: '❌ Fail', color: '#ff4f6b' };
}

// Global: draw pie chart on canvas
window.drawPieChart = function(canvasId, data) {
  // data = [{label, value, color}]
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) { ctx.fillStyle = '#1e2d45'; ctx.beginPath(); ctx.arc(80,80,70,0,Math.PI*2); ctx.fill(); return; }
  let startAngle = -Math.PI / 2;
  data.forEach(d => {
    const slice = (d.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.arc(80, 80, 70, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    startAngle += slice;
  });
  // center hole
  ctx.beginPath();
  ctx.arc(80, 80, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#111827';
  ctx.fill();
}
