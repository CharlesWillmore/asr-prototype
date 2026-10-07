(() => {
  const header = document.querySelector('.site-header');
  const button = header?.querySelector('.mobile-menu-button');
  const nav = header?.querySelector('.desktop-nav');
  if (!button || !nav) return;
  const narrow = matchMedia('(max-width:860px)');
  nav.id = 'site-navigation';
  nav.setAttribute('aria-label', 'Main navigation');
  button.type = 'button';
  button.setAttribute('aria-controls', nav.id);
  function fitMenu() {
    if (!narrow.matches || !header.classList.contains('menu-open')) return;
    const viewport = window.visualViewport;
    const bottom = viewport ? viewport.offsetTop + viewport.height : innerHeight;
    const available = Math.max(0, bottom - header.getBoundingClientRect().bottom - 8);
    nav.style.setProperty('--menu-available-height', `${available}px`);
    for (const [size, padding] of [[20,12],[18,10],[16,8],[14,6]]) {
      nav.style.setProperty('--menu-font-size', `${size}px`);
      nav.style.setProperty('--menu-row-padding', `${padding}px`);
      if (nav.scrollHeight <= nav.clientHeight + 1) break;
    }
  }
  addEventListener('resize', fitMenu);
  addEventListener('scroll', fitMenu, {passive:true});
  window.visualViewport?.addEventListener('resize', fitMenu);
  window.visualViewport?.addEventListener('scroll', fitMenu);
  new ResizeObserver(fitMenu).observe(header);
  document.fonts.ready.then(fitMenu);
  function setOpen(open) {
    header.classList.toggle('menu-open', open && narrow.matches);
    button.setAttribute('aria-expanded', String(open && narrow.matches));
    button.setAttribute('aria-label', open && narrow.matches ? 'Close menu' : 'Open menu');
    fitMenu();
  }
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a,button')) setTimeout(() => setOpen(false), 0); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) { setOpen(false); button.focus(); }
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) setOpen(false); });
  // Some desktop browsers do not focus links on mouse-down. Only close on
  // a confirmed focus move outside the header, so the link can receive its click.
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  narrow.addEventListener('change', () => setOpen(false));
  setOpen(false);
})();
