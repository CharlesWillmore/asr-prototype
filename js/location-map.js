(() => {
  const section = document.querySelector('.location-section');
  if (!section) return;
  const institutions = {
    'New South Wales': ['Centenary Institute of Cancer Medicine and Cell Biology', 'Genea', 'Prince of Wales Hospital', 'University of Wollongong', 'Victor Chang Cardiac Research Institute', 'Westmead Institute for Medical Research'],
    Queensland: ['Australian Institute for Bioengineering and Nanotechnology', 'The University of Queensland'],
    Tasmania: ['Menzies Institute for Medical Research'],
    Victoria: ['Cord Blood Advanced Therapies Research Laboratory', 'Monash Institute of Cognitive and Clinical Neurosciences', 'Monash Institute of Pharmaceutical Sciences', 'Monash University', 'Monash University, Central Clinical School', "Murdoch Children's Research Institute", 'The Florey Institute of Neuroscience and Mental Health', 'University of Melbourne'],
    'Western Australia': ['Harry Perkins Institute of Medical Research', 'Lions Eye Institute'],
    'South Australia': [],
    Overseas: ['ES Cell International Pte Ltd.', 'University of Calgary', 'Stem Cell Sciences plc']
  };
  // The supplied PDF defines the artwork, markers and connector routes.
  const panel = section.querySelector('.location-panel');
  const title = section.querySelector('h3');
  const list = section.querySelector('.location-institutions');
  const marker = section.querySelector('.location-marker');
  const line = section.querySelector('.location-line');
  const records = window.registryRecords || [];
  let active = null, animation;
  const normalise = value => value.toLowerCase().replace(/[’']/g, "'").replace(/[,]/g, '').replace(/\s+/g, ' ').trim();
  function close() {
    clearTimeout(animation);
    section.classList.remove('location-active', 'location-reveal');
    panel.hidden = true;
    section.querySelectorAll('[data-region]').forEach(el => el.setAttribute('aria-expanded', 'false'));
    active = null;
  }
  // Compact state hierarchy for tablets and phones, matching the filter disclosures.
  const mobileTree = section.querySelector('.location-mobile-tree');
  const regionNames = ['New South Wales', 'Queensland', 'Tasmania', 'Victoria', 'Western Australia', 'Overseas'];
  regionNames.forEach(region => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = region;
    const organisations = document.createElement('ul');
    institutions[region].forEach(name => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `index.html?institution=${encodeURIComponent(name)}`;
      const label = document.createElement('span'); label.textContent = name;
      const count = records.filter(record => normalise(record.institution) === normalise(name)).length;
      const lines = document.createElement('span'); lines.className = 'location-mobile-count';
      lines.textContent = `${count} Cell ${count === 1 ? 'Line' : 'Lines'} →`;
      link.append(label, lines); item.append(link); organisations.append(item);
    });
    details.append(summary, organisations); mobileTree.append(details);
  });
  const groupedRegion = region => ({'Northern Territory': 'South Australia', 'Australian Capital Territory': 'Victoria'}[region] || region);
  function select(region) {
    region = groupedRegion(region);
    // Keep SA/NT inactive until Suzy supplies their institution information.
    if (region === 'South Australia') return;
    // Keep every region pinned until a cell-line link or the close control is used.
    if (active !== null) return;
    close(); active = region;
    title.textContent = region;
    panel.dataset.region = region;
    list.replaceChildren();
    institutions[region].forEach(name => {
      const count = records.filter(record => normalise(record.institution) === normalise(name)).length;
      const link = document.createElement('a');
      link.href = `index.html?institution=${encodeURIComponent(name)}`;
      const label = document.createElement('span'); label.textContent = name;
      const lines = document.createElement('span'); lines.className = 'location-count';
      lines.textContent = `${count} Cell ${count === 1 ? 'Line' : 'Lines'} →`;
      link.append(label, lines); link.addEventListener('click', close); list.append(link);
    });
    if (!institutions[region].length) {
      const empty = document.createElement('p');
      empty.textContent = 'No institutions in Suzy’s supplied list for this region.';
      list.append(empty);
    }
    section.querySelectorAll('[data-region]').forEach(el => el.setAttribute('aria-expanded', String(groupedRegion(el.dataset.region) === region)));
    const layout = window.locationMapLayout[region];
    section.classList.toggle('location-awaiting-art', !layout);
    if (layout) {
      marker.setAttribute('cx', layout.dot[0]);
      marker.setAttribute('cy', layout.dot[1]);
      line.setAttribute('d', layout.path);
    }
    // Restart the sequence even when moving quickly between adjacent states.
    void section.offsetWidth;
    section.classList.add('location-active');
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    animation = setTimeout(() => { panel.hidden = false; section.classList.add('location-reveal'); }, delay);
  }
  section.querySelectorAll('[data-region]').forEach(target => {
    if (groupedRegion(target.dataset.region) === 'South Australia') {
      target.removeAttribute('tabindex');
      target.setAttribute('aria-disabled', 'true');
      target.style.cursor = 'default';
      return;
    }
    target.setAttribute('aria-controls','location-region-title');
    target.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(target.dataset.region); });
    target.addEventListener('focus', () => select(target.dataset.region));
    target.addEventListener('click', () => select(target.dataset.region));
    if (target.tagName.toLowerCase() !== 'button') target.addEventListener('keydown', event => {
      if (['Enter',' '].includes(event.key)) { event.preventDefault(); select(target.dataset.region); }
    });
  });
  section.querySelector('.location-close').addEventListener('click', () => {
    const region = active;
    close();
    // Focus without re-opening the panel via its focus handler.
    const target = [...section.querySelectorAll('[data-region]')].find(el => groupedRegion(el.dataset.region) === region);
    if (target) { target.focus(); close(); }
  });
  section.addEventListener('keydown', event => { if (event.key === 'Escape') { section.querySelector('.location-close').click(); } });
})();
