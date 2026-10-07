(() => {
  try { const state = JSON.parse(sessionStorage.getItem('asr-filter-state-v1') || '{}'); state.reviewed = true; sessionStorage.setItem('asr-filter-state-v1', JSON.stringify(state)); } catch {}

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
    const context = document.createElement('canvas').getContext('2d');
    function metrics(element, glyph) {
      const style = getComputedStyle(element);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const text = context.measureText(glyph);
      const ascent = text.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * .8;
      const descent = text.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * .2;
      return { cap: text.actualBoundingBoxAscent, baseline: (parseFloat(style.lineHeight) - ascent - descent) / 2 + ascent };
    }
    const label = heading.querySelector('.record-eyebrow');
    const title = heading.querySelector('h1');
    const labelMetrics = metrics(label, 'H'), titleMetrics = metrics(title, 'x');
    // A 32px ink-to-baseline block centred in the 48px symbol: top 8, baseline 40.
    label.style.top = `${8 + labelMetrics.cap - labelMetrics.baseline}px`;
    title.style.top = `${40 - titleMetrics.baseline}px`;
    const aliases = document.querySelector('.record-hero-inner > .alternative-names');
    if (aliases) {
      const caption = aliases.querySelector('strong'), values = aliases.querySelector('span');
      const captionMetrics = metrics(caption, 'H'), valueMetrics = metrics(values, 'H');
      caption.style.top = `${8 + captionMetrics.cap - captionMetrics.baseline}px`;
      values.style.top = `${40 - titleMetrics.cap + valueMetrics.cap - valueMetrics.baseline}px`;
    }
    update();
  }
  function stops() {
    const track = slider.getBoundingClientRect();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const targets = sections.map(section => Math.max(0, Math.min(maxScroll,
      section.getBoundingClientRect().top + scrollY - fixedTop.offsetHeight - 22)));
    const points = [{x:0, y:targets[0]}];
    // Anchor each stop to the symbol’s left edge, allowing for the thumb radius.
    links.forEach((link, i) => {
      const symbol = link.querySelector('.navigation-dot').getBoundingClientRect();
      const x = Math.max(1, Math.min(999, (symbol.left + symbol.width / 2 - track.left - 8) / (track.width - 16) * 1000));
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
    const points = stops();
    const value = interpolate(scrollY, points, 'y', 'x');
    slider.value = value;
    const current = links.reduce((found, link, i) => value >= points[i + 1].x - 0.5 ? i : found, 0);
    links.forEach((link,i) => {
      i === current ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current');
      link.classList.toggle('is-reached', value >= points[i + 1].x - 0.5);
    });
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
    const identifier = heading.querySelector('h1').textContent.trim();
    const record=window.registryRecords.find(r=>r.id===identifier);
    const url=URL.createObjectURL(new Blob([JSON.stringify({snapshotDate:'2026-09-23',...record},null,2)], {type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=`${identifier}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelector('[data-action="pdf"]').title='Download PDF — opens print dialog; choose Save as PDF';
  measure();
})();
