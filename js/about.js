document.querySelectorAll('.bio-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    document.getElementById(button.getAttribute('aria-controls')).textContent = expanded ? button.dataset.full : button.dataset.short;
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? 'less' : 'more';
  });
});

const cellMotionToggle = document.querySelector('.cell-motion-toggle');
cellMotionToggle.addEventListener('click', () => {
  const paused = document.querySelector('.about-main').classList.toggle('cell-motion-paused');
  cellMotionToggle.setAttribute('aria-pressed', String(paused));
  cellMotionToggle.querySelector('.motion-label').textContent = paused ? 'Resume cell motion' : 'Pause cell motion';
});

// A bounded, temporary lag opposes the page's movement without moving the
// cells' layout anchors. Individual translate composes with the idle animation.
const floatingCells = Array.from(document.querySelectorAll('.cell'));
const motionArea = document.querySelector('.about-main');
let previousScroll = window.scrollY;
let scrollLag = 0;
let scrollFrame = 0;
let previousFrameTime = 0;
function drawScrollLag(time) {
  scrollFrame = 0;
  if (motionArea.classList.contains('cell-motion-paused')) return;
  const elapsed = previousFrameTime ? Math.min(time - previousFrameTime, 64) : 16;
  previousFrameTime = time;
  scrollLag *= Math.pow(0.88, elapsed / 16.67);
  if (Math.abs(scrollLag) < 0.03) scrollLag = 0;
  floatingCells.forEach((cell, index) => {
    const response = 0.65 + (index % 4) * 0.1;
    cell.style.setProperty('--cell-scroll-lag', `${(scrollLag * response).toFixed(2)}px`);
  });
  if (scrollLag) scrollFrame = requestAnimationFrame(drawScrollLag);
  else previousFrameTime = 0;
}
window.addEventListener('scroll', () => {
  const delta = window.scrollY - previousScroll;
  previousScroll = window.scrollY;
  if (motionArea.classList.contains('cell-motion-paused')) return;
  // Scrolling down carries the page up, so the cells lag slightly downward.
  scrollLag = Math.max(-8, Math.min(8, scrollLag + delta * 0.07));
  if (!scrollFrame) {
    previousFrameTime = 0;
    scrollFrame = requestAnimationFrame(drawScrollLag);
  }
}, { passive: true });
cellMotionToggle.addEventListener('click', () => {
  if (!motionArea.classList.contains('cell-motion-paused') && scrollLag && !scrollFrame) {
    previousFrameTime = 0;
    scrollFrame = requestAnimationFrame(drawScrollLag);
  }
});
