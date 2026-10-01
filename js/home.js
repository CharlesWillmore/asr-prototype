(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.slide-dots button')];
  let current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; dots[i].setAttribute('aria-pressed', String(i === current)); });
    document.querySelector('#slide-status').textContent = slides[current].getAttribute('aria-label');
  }
  document.querySelector('#slide-prev').addEventListener('click', () => show(current - 1));
  document.querySelector('#slide-next').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  const dialog = document.querySelector('#pending-dialog');
  document.querySelectorAll('[data-pending]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('#pending-title').textContent = button.dataset.pending;
    dialog.showModal();
  }));
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  const menu = document.querySelector('.mobile-menu-button');
  menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => {
    const open = document.querySelector('.desktop-nav').classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
})();
