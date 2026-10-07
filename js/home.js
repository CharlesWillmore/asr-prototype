(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.slide-dots button')];
  let current = 0, timer, moving = false;
  slides.forEach((slide, i) => {
    slide.hidden = false;
    slide.classList.toggle('is-active', i === current);
    slide.inert = i !== current;
    slide.setAttribute('aria-hidden', String(i !== current));
  });
  function schedule() {
    clearTimeout(timer);
    if (!moving && !document.hidden) timer = setTimeout(() => show(current + 1), 4000);
  }
  async function show(index, direction = 1) {
    if (moving) return;
    clearTimeout(timer);
    const next = (index + slides.length) % slides.length;
    if (next === current) { schedule(); return; }
    moving = true;
    const outgoing = slides[current], incoming = slides[next];
    incoming.classList.add('is-active');
    outgoing.inert = true;
    incoming.inert = false;
    outgoing.setAttribute('aria-hidden', 'true');
    incoming.setAttribute('aria-hidden', 'false');
    current = next;
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
    try {
      const options = { duration: 500, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' };
      await Promise.allSettled([
        outgoing.animate([{transform:'translateX(0)'},{transform:`translateX(${-direction * 100}%)`}], options).finished,
        incoming.animate([{transform:`translateX(${direction * 100}%)`},{transform:'translateX(0)'}], options).finished
      ]);
    } finally {
      outgoing.classList.remove('is-active');
      document.querySelector('#slide-status').textContent = incoming.getAttribute('aria-label');
      moving = false;
      schedule();
    }
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, i < current ? -1 : 1)));
  document.addEventListener('visibilitychange', schedule);
  schedule();
  const dialog = document.querySelector('#pending-dialog');
  document.querySelectorAll('[data-pending]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('#pending-title').textContent = button.dataset.pending;
    dialog.showModal();
  }));
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  const requestedInfo = new URLSearchParams(location.search).get('info');
  if (['FAQs', 'Resources', 'Contact'].includes(requestedInfo)) {
    document.querySelector('#pending-title').textContent = requestedInfo;
    dialog.showModal();
  }
})();
