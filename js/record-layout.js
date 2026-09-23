(() => {
  const nav = document.querySelector('.record-navigator');
  const fixedTop = document.querySelector('.record-fixed-top');
  const slider = nav.querySelector('input');
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const heading = document.querySelector('.record-heading');
  const identity = document.querySelector('.record-identity');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function measure() {
    document.documentElement.style.setProperty('--navigator-height', `${fixedTop.offsetHeight}px`);
    // Optical overshoot: approximately 5% beyond each text alignment line.
    const textHeight = heading.querySelector('h1').getBoundingClientRect().bottom - heading.getBoundingClientRect().top - 8;
    identity.style.setProperty('--symbol-size', `${textHeight * 1.11}px`);
    identity.style.setProperty('--symbol-top', `${3 - textHeight * .055}px`);
    update();
  }
  function stops() {
    const track = slider.getBoundingClientRect();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const targets = sections.map(section => Math.max(0, Math.min(maxScroll,
      section.getBoundingClientRect().top + scrollY - fixedTop.offsetHeight - 22)));
    const points = [{x:0, y:targets[0]}];
    // Measure labels so alignment survives font changes and narrow-screen wrapping.
    links.forEach((link, i) => {
      const label = link.querySelector('span:last-child').getBoundingClientRect();
      const x = Math.max(1, Math.min(999, ((label.left + label.width / 2) - track.left - 8) / (track.width - 16) * 1000));
      points.push({x, y:targets[i]});
    });
    points.push({x:1000, y:maxScroll});
    return points;
  }
  function interpolate(value, points, from, to) {
    if (value <= points[0][from]) return points[0][to];
    for (let i = 1; i < points.length; i++) {
      if (value <= points[i][from]) {
        const a = points[i - 1], b = points[i];
        const span = b[from] - a[from];
        return span ? a[to] + (b[to] - a[to]) * (value - a[from]) / span : b[to];
      }
    }
    return points.at(-1)[to];
  }
  function update() {
    const value = interpolate(scrollY, stops(), 'y', 'x');
    slider.value = value;
    const current = sections.reduce((found, section, i) => section.getBoundingClientRect().top <= fixedTop.offsetHeight + 48 ? i : found, 0);
    links.forEach((link,i) => i === current ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    slider.setAttribute('aria-valuetext', links[current].textContent.trim());
  }
  slider.addEventListener('input', () => scrollTo({top:interpolate(Number(slider.value), stops(), 'x', 'y'), behavior:'instant'}));
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector(link.hash).scrollIntoView({behavior:reduced.matches ? 'instant' : 'smooth',block:'start'});
    history.replaceState(null, '', link.hash);
  }));
  let queued = false;
  addEventListener('scroll', () => {if (!queued) { queued = true; requestAnimationFrame(() => {update();queued = false;}); }}, {passive:true});
  new ResizeObserver(measure).observe(heading);
  new ResizeObserver(measure).observe(fixedTop);
  addEventListener('resize', measure);
  document.fonts.ready.then(measure);
  const message = document.querySelector('.share-message');
  let timer;
  function announce(text) { message.textContent=text; message.classList.add('is-visible'); clearTimeout(timer);timer=setTimeout(()=>message.classList.remove('is-visible'),3200); }
  document.querySelector('[data-action="share"]').addEventListener('click', async () => {try {await navigator.clipboard.writeText(location.href);announce('Page link copied');} catch {announce('Copy the page address from your browser to share it.');}});
  document.querySelector('[data-action="pdf"]').addEventListener('click', () => window.print());
  document.querySelector('[data-action="json"]').addEventListener('click', () => {
    const record=window.registryRecords.find(r=>r.id==='MCRIi035-B-1');
    const url=URL.createObjectURL(new Blob([JSON.stringify({snapshotDate:'2026-09-23',...record},null,2)], {type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='MCRIi035-B-1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelector('[data-action="pdf"]').title='Download PDF — opens print dialog; choose Save as PDF';
  const menu=document.querySelector('.mobile-menu-button');
  menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));document.querySelector('.desktop-nav').classList.toggle('mobile-open',!expanded);});
  measure();
})();
