(() => {
  'use strict';
  const records = window.registryRecords;
  const workspace = document.querySelector('#listing-workspace');
  const panel = document.querySelector('#filter-panel');
  const resultsPane = document.querySelector('.results-pane');
  const body = document.querySelector('#results-body');
  const filterButton = document.querySelector('.filter-button');
  const nameInput = document.querySelector('#filter-name');
  const expandButton = document.querySelector('#expand-filter');
  const selections = { disease: new Set(), organisation: new Set(), sex: new Set(), hasDisease: new Set(), variant: new Set() };
  const expandedDescriptions = new Set();
  const controls = [];
  let page = 1, pageSize = 25, matches = records, serial = 0;
  const normalise = value => value.toLowerCase().replace(/[’']/g, "'").replace(/[,]/g, '').replace(/\s+/g, ' ').trim();
  const diseaseKeys = r => r.diseases.map(normalise);
  const orgKey = r => r.organisation.join(' / ');
  const variantKeys = r => r.origins.length ? r.origins.flatMap(origin => [origin, ...r.loci.map(locus => `${origin}: ${locus}`)]) : ['none'];
  const keysFor = (r, group) => ({ disease: () => diseaseKeys(r), organisation: () => [orgKey(r)], sex: () => [r.sex], hasDisease: () => [r.diseases.length ? 'yes' : 'no'], variant: () => variantKeys(r) }[group])();
  const intersects = (set, values) => values.some(value => set.has(value));
  const el = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text !== undefined) n.textContent = text; return n; };
  function allKeys(node) {
    return [...new Set([...(node.key ? [node.key] : []), ...(node.children || []).flatMap(allKeys)])];
  }
  function countFor(group, keys) { const set = new Set(keys); return records.filter(r => intersects(set, keysFor(r, group))).length; }
  function checkbox(group, keys, label, className = 'tree-label') {
    const labelEl = el('label', className);
    const input = el('input'); input.type = 'checkbox'; input.setAttribute('aria-label', label);
    const text = el('span', '', label + ' ');
    text.append(el('span', 'tree-count', `(${countFor(group, keys)})`));
    labelEl.append(input, text); controls.push({ input, group, keys });
    input.addEventListener('change', () => {
      for (const key of keys) input.checked ? selections[group].add(key) : selections[group].delete(key);
      updateChecks(); updateResults(true);
    });
    return labelEl;
  }
  function updateChecks() {
    for (const { input, group, keys } of controls) {
      const selected = keys.filter(key => selections[group].has(key)).length;
      input.checked = keys.length > 0 && selected === keys.length;
      input.indeterminate = selected > 0 && selected < keys.length;
    }
  }
  function tree(nodes, group) {
    const list = el('ul', 'tree-list');
    for (const node of nodes) {
      const item = el('li', 'tree-item'), row = el('div', 'tree-row');
      const children = node.children || [];
      if (children.length) {
        const button = el('button', 'disclosure'); button.type = 'button';
        button.setAttribute('aria-label', `Expand ${node.label}`); button.setAttribute('aria-expanded', 'false');
        const sub = tree(children, group); sub.hidden = true; sub.id = `tree-${++serial}`;
        button.setAttribute('aria-controls', sub.id);
        button.addEventListener('click', () => { sub.hidden = !sub.hidden; button.setAttribute('aria-expanded', String(!sub.hidden)); button.setAttribute('aria-label', `${sub.hidden ? 'Expand' : 'Collapse'} ${node.label}`); });
        row.append(button, checkbox(group, allKeys(node), node.label)); item.append(row, sub);
      } else { row.append(el('span', 'tree-spacer'), checkbox(group, allKeys(node), node.label)); item.append(row); }
      list.append(item);
    }
    return list;
  }
  function convertDisease(node) {
    return { label: node.label, key: node.disease ? normalise(node.disease) : null, children: (node.children || []).map(convertDisease) };
  }
  const diseases = window.registryDiseaseTree.map(convertDisease);
  // Preserve audit classifications. New snapshot diseases absent from the audit remain in Other until reviewed.
  const known = new Set(diseases.flatMap(allKeys));
  let other = diseases.find(n => n.label === 'Other');
  if (!other) { other = { label: 'Other', children: [] }; diseases.push(other); }
  for (const r of records) for (const name of r.diseases) {
    const key = normalise(name);
    if (!known.has(key)) { other.children.push({ label: name, key }); known.add(key); }
  }
  const diseaseRoot = { label: 'All diseases', children: diseases };
  const diseaseOptions = document.querySelector('#disease-options');
  diseaseOptions.append(checkbox('disease', allKeys(diseaseRoot), 'ALL DISEASES', 'simple-option'), tree(diseases, 'disease'));
  const organisations = [];
  for (const r of records) {
    let level = organisations, node;
    for (const label of r.organisation) {
      node = level.find(n => n.label === label);
      if (!node) { node = { label, children: [] }; level.push(node); }
      level = node.children;
    }
    node.key = orgKey(r);
  }
  document.querySelector('#organisation-options').append(tree(organisations, 'organisation'));
  for (const sex of [...new Set(records.map(r => r.sex))].sort()) document.querySelector('#sex-options').append(checkbox('sex', [sex], sex, 'simple-option'));
  for (const [key, label] of [['yes', 'Has a reported disease'], ['no', 'No reported disease']]) document.querySelector('#has-disease-options').append(checkbox('hasDisease', [key], label, 'simple-option'));
  const variants = document.querySelector('#variant-options');
  for (const origin of ['Donor', 'In Vitro']) {
    const loci = [...new Set(records.filter(r => r.origins.includes(origin)).flatMap(r => r.loci))].sort();
    variants.append(el('h3', 'variant-group-title', origin === 'Donor' ? 'DONOR ORIGIN' : 'IN VITRO ORIGIN'));
    variants.append(checkbox('variant', loci.length ? loci.map(l => `${origin}: ${l}`) : [origin], 'All ' + origin.toLowerCase() + ' variants', 'simple-option'));
    for (const locus of loci) variants.append(checkbox('variant', [`${origin}: ${locus}`], locus, 'simple-option'));
  }
  variants.append(checkbox('variant', ['none'], 'No recorded variant', 'simple-option'));
  function lines(parent, values, className = 'field-line') { for (const value of values.length ? values : ['–']) parent.append(el('span', className, value)); }
  function descriptionCell(record) {
    const cell = el('td', 'description-col'); cell.dataset.label = 'Description';
    const text = record.description || 'No description recorded.';
    const paragraph = el('span', 'description-text'); paragraph.id = `description-${record.id}`;
    cell.append(paragraph);
    if (text.length <= 230) { paragraph.textContent = text; return cell; }
    let shortened = text.slice(0, 230); const lastSpace = shortened.lastIndexOf(' ');
    if (text[230] !== ' ' && lastSpace > 0) shortened = shortened.slice(0, lastSpace);
    const toggle = el('button', 'description-toggle'); toggle.type = 'button'; toggle.setAttribute('aria-controls', paragraph.id);
    const refresh = () => { const expanded = expandedDescriptions.has(record.id); paragraph.textContent = expanded ? text : shortened.trimEnd() + '…'; toggle.textContent = expanded ? 'less' : 'more'; toggle.setAttribute('aria-expanded', String(expanded)); toggle.setAttribute('aria-label', `${expanded ? 'Show less' : 'Read more'} about ${record.id}`); };
    toggle.addEventListener('click', () => { expandedDescriptions.has(record.id) ? expandedDescriptions.delete(record.id) : expandedDescriptions.add(record.id); refresh(); });
    cell.append(toggle); refresh(); return cell;
  }
  function renderRows() {
    const fragment = document.createDocumentFragment();
    for (const r of matches.slice((page - 1) * pageSize, page * pageSize)) {
      const row = el('tr'); row.dataset.record = r.id;
      const identifier = el('td', 'identifier-col'); identifier.dataset.label = 'Identifier';
      const link = el('a', 'result-identifier', r.id); link.href = r.id === 'MCRIi035-B-1' ? 'cell-line-704.html' : r.source; if (r.id !== 'MCRIi035-B-1') { link.target = '_blank'; link.rel = 'noopener'; } link.setAttribute('aria-label', `${r.id} — ${r.id === 'MCRIi035-B-1' ? 'open cell line page' : 'open Registry record in a new tab'}`);
      identifier.append(link); lines(identifier, r.aliases, 'alternative-name'); row.append(identifier, descriptionCell(r));
      for (const [className, label, values] of [['disease-col','Disease reported',r.diseases],['loci-col','Loci',r.loci],['variant-col','Variant',r.origins]]) {
        const cell = el('td', className); cell.dataset.label = label; lines(cell, values); row.append(cell);
      }
      const contact = el('td', 'contact-col'); contact.dataset.label = 'Cell line contact';
      contact.append(el('span', 'contact-name', r.contact || 'Not recorded'), el('span', 'institution', r.institution));
      const curation = el('td', 'curation-col', r.curation); curation.dataset.label = 'Curation'; row.append(contact, curation); fragment.append(row);
    }
    body.replaceChildren(fragment);
    document.querySelector('#empty-results').hidden = matches.length > 0;
    document.querySelector('.results-table').hidden = matches.length === 0;
    document.querySelector('.result-count strong').textContent = `${matches.length} Cell ${matches.length === 1 ? 'Line' : 'Lines'}`;
    document.querySelector('#filter-result-count').textContent = `${matches.length} matching cell ${matches.length === 1 ? 'line' : 'lines'}`;
    document.querySelector('.page-number').replaceChildren(el('strong', '', String(page)), el('span', '', `of ${Math.max(1, Math.ceil(matches.length / pageSize))}`));
    const maxPage = Math.max(1, Math.ceil(matches.length / pageSize));
    document.querySelectorAll('.page-arrow').forEach((b, i) => b.disabled = i < 2 ? page === 1 : page >= maxPage);
  }
  function updateResults(resetPage = false) {
    const query = normalise(nameInput.value);
    matches = records.filter(r => (!query || normalise([r.id, ...r.aliases, ...r.diseases, r.contact, ...r.organisation, r.description, ...r.loci].join(' ')).includes(query)) && Object.entries(selections).every(([group, selected]) => !selected.size || intersects(selected, keysFor(r, group))));
    if (resetPage) { page = 1; resultsPane.scrollTop = 0; }
    renderRows();
  }
  function responsiveState() {
    const open = workspace.classList.contains('filter-open');
    const overlay = window.matchMedia('(max-width:1199px)').matches;
    panel.setAttribute('role', open && overlay ? 'dialog' : 'complementary');
    if (open && overlay) panel.setAttribute('aria-modal', 'true'); else panel.removeAttribute('aria-modal');
    const available = workspace.getBoundingClientRect().right - parseFloat(getComputedStyle(workspace).paddingRight) - panel.getBoundingClientRect().right - 24;
    workspace.classList.toggle('preview-identifiers', open && workspace.classList.contains('filter-wide') && available < 480);
    workspace.classList.toggle('preview-hidden', open && workspace.classList.contains('filter-wide') && available < 245);
    resultsPane.inert = open && (overlay || workspace.classList.contains('preview-hidden'));
  }
  function setOpen(open) {
    workspace.classList.toggle('filter-open', open); panel.inert = !open; filterButton.setAttribute('aria-expanded', String(open));
    responsiveState();
    if (open) nameInput.focus({ preventScroll: true }); else filterButton.focus({ preventScroll: true });
  }
  filterButton.addEventListener('click', () => setOpen(!workspace.classList.contains('filter-open')));
  document.querySelector('.filter-apply-button').addEventListener('click', () => setOpen(false));
  document.querySelector('.search-close').addEventListener('click', () => setOpen(false));
  expandButton.addEventListener('click', () => {
    const wide = workspace.classList.toggle('filter-wide'); expandButton.textContent = wide ? 'Reduce filter ↔' : 'Expand filter ↔'; expandButton.setAttribute('aria-pressed', String(wide));
    responsiveState();
  });
  new ResizeObserver(responsiveState).observe(panel);
  document.querySelectorAll('.filter-clear-button').forEach(button => button.addEventListener('click', () => { Object.values(selections).forEach(set => set.clear()); nameInput.value = ''; updateChecks(); updateResults(true); }));
  nameInput.addEventListener('input', () => updateResults(true));
  document.querySelectorAll('.display-menu button').forEach(button => button.addEventListener('click', () => {
    pageSize = button.textContent.trim() === 'ALL' ? records.length : Number(button.textContent.trim());
    document.querySelector('#display-value').textContent = button.textContent.trim(); document.querySelector('.display-control').open = false;
    document.querySelectorAll('.display-menu button').forEach(b => b.classList.toggle('selected-option', b === button)); updateResults(true);
  }));
  document.querySelectorAll('.page-arrow').forEach((button, i) => button.addEventListener('click', () => { const max = Math.max(1, Math.ceil(matches.length / pageSize)); page = [1, Math.max(1, page - 1), Math.min(max, page + 1), max][i]; resultsPane.scrollTop = 0; renderRows(); }));
  document.addEventListener('keydown', event => {
    if (!workspace.classList.contains('filter-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    if (event.key === 'Tab' && panel.getAttribute('aria-modal') === 'true') {
      const focusable = [...panel.querySelectorAll('button,input,summary,[tabindex="0"]')].filter(n => n.getClientRects().length && !n.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });
  updateChecks(); updateResults(); responsiveState();
  if (new URLSearchParams(location.search).get("filter") === "open") setOpen(true);
})();
