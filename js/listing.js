(() => {
  'use strict';
  const records = Array.from({ length: 300 }, (_, i) => ({ ...window.registryRecords[i % window.registryRecords.length], rowKey: `sample-${i}` }));
  const workspace = document.querySelector('#listing-workspace');
  const panel = document.querySelector('#filter-panel');
  const resultsPane = document.querySelector('.results-pane');
  // Keep column headings directly below the summary, including when it expands.
  const listingSummary = document.querySelector('#listing-filter-summary');
  new ResizeObserver(() => {
    resultsPane.style.setProperty('--listing-summary-height', `${listingSummary.getBoundingClientRect().height}px`);
  }).observe(listingSummary);
  const body = document.querySelector('#results-body');
  const filterButton = document.querySelector('.filter-button');
  const nameInput = document.querySelector('#filter-name');
  const selections = { disease: new Set(), organisation: new Set(), sex: new Set(), hasDisease: new Set(), variant: new Set() };
  const storageKey = 'asr-filter-state-v1';
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch {}
  // The home-page browse link starts a fresh, unfiltered listing.
  if (new URLSearchParams(location.search).get('view') === 'all') {
    saved = { reviewed: true, page: 1, pageSize: records.length };
    const url = new URL(location.href);
    url.searchParams.delete('view');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  for (const group of Object.keys(selections)) selections[group] = new Set(saved.selections?.[group] || []);
  nameInput.value = saved.query || '';
  let reviewed = Boolean(saved.reviewed), editing = false;
  const summaryExpanded = { filter: false, listing: false };
  const expandedDescriptions = new Set();
  const controls = [];
  let page = saved.page || 1, pageSize = saved.pageSize || 25, matches = records, serial = 0;
  const normalise = value => value.toLowerCase().replace(/[’']/g, "'").replace(/[,]/g, '').replace(/\s+/g, ' ').trim();
  const diseaseKeys = r => r.diseases.map(normalise);
  const orgKey = r => r.organisation.join(' / ');
  const modificationTypes = ['Isogenic modification', 'Gene knock in', 'Transgene expression', 'Gene knock out'];
  const modificationKey = modification => `Modification: ${modification.type}: ${modification.gene}`;
  const variantKeys = r => {
    const keys = [
      ...(r.origins.includes('Donor') ? r.loci.map(gene => `Donor: ${gene}`) : []),
      ...(r.modifications || []).map(modificationKey)
    ];
    return keys.length ? keys : ['none'];
  };
  const keysFor = (r, group) => ({ disease: () => diseaseKeys(r), organisation: () => [orgKey(r)], sex: () => [r.sex], hasDisease: () => [r.diseases.length ? 'yes' : 'no'], variant: () => variantKeys(r) }[group])();
  const intersects = (set, values) => values.some(value => set.has(value));
  const el = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text !== undefined) n.textContent = text; return n; };
  function allKeys(node) {
    return [...new Set([...(node.key ? [node.key] : []), ...(node.children || []).flatMap(allKeys)])];
  }
  function countFor(group, keys) { const set = new Set(keys); return records.filter(r => intersects(set, keysFor(r, group))).length; }
  function checkbox(group, keys, label, className = 'tree-label', count = countFor(group, keys), path = [label]) {
    const labelEl = el('label', className);
    const input = el('input'); input.type = 'checkbox'; input.setAttribute('aria-label', label);
    const text = el('span', '', label + ' ');
    text.append(el('span', 'tree-count', `(${count})`));
    labelEl.append(input, text); controls.push({ input, group, keys, label, path });
    input.addEventListener('change', () => {
      for (const key of keys) input.checked ? selections[group].add(key) : selections[group].delete(key);
      editing = true; summaryExpanded.filter = false; updateChecks(); updateResults(true);
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
  function tree(nodes, group, parents = []) {
    const list = el('ul', 'tree-list');
    for (const node of nodes) {
      const item = el('li', 'tree-item'), row = el('div', 'tree-row');
      const children = node.children || [];
      if (children.length) {
        const button = el('button', 'disclosure'); button.type = 'button';
        button.setAttribute('aria-label', `Expand ${node.label}`); button.setAttribute('aria-expanded', 'false');
        const sub = tree(children, group, [...parents, node.label]); sub.hidden = true; sub.id = `tree-${++serial}`;
        button.setAttribute('aria-controls', sub.id);
        button.addEventListener('click', () => { sub.hidden = !sub.hidden; button.setAttribute('aria-expanded', String(!sub.hidden)); button.setAttribute('aria-label', `${sub.hidden ? 'Expand' : 'Collapse'} ${node.label}`); });
        const topLevelCategory = parents.length === 0 && ['disease', 'hasDisease', 'variant'].includes(group);
        let label;
        if (topLevelCategory) {
          label = el('span', 'tree-label');
          const text = el('span', '', node.label + ' ');
          text.append(el('span', 'tree-count', `(${countFor(group, allKeys(node))})`));
          label.append(text);
        } else {
          label = checkbox(group, allKeys(node), node.label, 'tree-label', undefined, [...parents, node.label]);
        }
        row.append(button, label); item.append(row, sub);
      } else { row.append(el('span', 'tree-spacer'), checkbox(group, allKeys(node), node.label, 'tree-label', undefined, [...parents, node.label])); item.append(row); }
      list.append(item);
    }
    return list;
  }
  const capitalise = label => label.charAt(0).toUpperCase() + label.slice(1);
  function convertDisease(node) {
    return { label: capitalise(node.label), key: node.disease ? normalise(node.disease) : null, children: (node.children || []).map(convertDisease) };
  }
  const diseases = window.registryDiseaseTree.map(convertDisease);
  // Preserve audit classifications. New snapshot diseases absent from the audit remain in Other until reviewed.
  const known = new Set(diseases.flatMap(allKeys));
  let other = diseases.find(n => n.label === 'Other');
  if (!other) { other = { label: 'Other', children: [] }; diseases.push(other); }
  for (const r of records) for (const name of r.diseases) {
    const key = normalise(name);
    if (!known.has(key)) { other.children.push({ label: capitalise(name), key }); known.add(key); }
  }
  const diseaseRoot = { label: 'All diseases', children: diseases };
  const diseaseOptions = document.querySelector('#disease-options');
  const diseaseIntro = el('p', 'disease-help');
  diseaseIntro.textContent = 'Select "All Diseases" to show all cell lines with a reported disease.';
  diseaseOptions.append(
    diseaseIntro,
    checkbox('disease', allKeys(diseaseRoot), 'All Diseases', 'simple-option'),
    el('p', 'disease-help', 'Use the arrows to expand disease categories, then select individual diseases or subcategories. Some diseases appear in more than one category, so selecting a disease selects it wherever it appears.'),
    el('p', 'disease-help', 'A dash means some diseases in that category are selected.'),
    tree(diseases, 'disease'),
    tree([{ label: 'Has Disease', children: [
      { label: 'Has a reported disease', key: 'yes' },
      { label: 'No reported disease', key: 'no' }
    ] }], 'hasDisease')
  );
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
  const organisationKeys = [...new Set(records.map(orgKey))];
  const organisationCount = new Set(records.map(r => normalise(r.institution)).filter(Boolean)).size;
  document.querySelector('#organisation-options').append(
    checkbox('organisation', organisationKeys, 'All Research Organisations', 'simple-option', organisationCount),
    el('p', 'disease-help', 'You can make a more targeted selection by clicking on the arrows to reveal research groups and individual cell line contacts.'),
    tree(organisations, 'organisation')
  );
  for (const sex of [...new Set(records.map(r => r.sex))].sort()) document.querySelector('#sex-options').append(checkbox('sex', [sex], sex, 'simple-option'));
  const variants = document.querySelector('#variant-options');
  const donorGenes = [...new Set(records.filter(r => r.origins.includes('Donor')).flatMap(r => r.loci))].sort();
  const modificationBranches = modificationTypes.map(type => {
    const genes = [...new Set(records.flatMap(r => r.modifications || []).filter(m => m.type === type).map(m => m.gene))].sort();
    return {
      label: type,
      // Keep zero-count categories selectable without inventing example genes.
      key: genes.length ? null : `Modification: ${type}: none-recorded`,
      children: genes.map(gene => ({ label: gene, key: modificationKey({ type, gene }) }))
    };
  });
  variants.append(
    el('p', 'disease-help', 'Use the arrows to expand variant categories, then select modification types or individual genes. A dash means some options in that category are selected. Gene selections apply only within their donor origin or modification type.'),
    tree([
      { label: 'None reported', key: 'none' },
      { label: 'Donor origin', children: donorGenes.map(gene => ({ label: gene, key: `Donor: ${gene}` })) },
      { label: 'Modification', children: modificationBranches }
    ], 'variant')
  );
  function lines(parent, values, className = 'field-line') { for (const value of values.length ? values : ['–']) parent.append(el('span', className, value)); }
  function descriptionCell(record) {
    const cell = el('td', 'description-col'); cell.dataset.label = 'Description';
    const text = record.description || 'No description recorded.';
    const paragraph = el('span', 'description-text'); paragraph.id = `description-${record.rowKey}`;
    cell.append(paragraph);
    if (text.length <= 230) { paragraph.textContent = text; return cell; }
    let shortened = text.slice(0, 230); const lastSpace = shortened.lastIndexOf(' ');
    if (text[230] !== ' ' && lastSpace > 0) shortened = shortened.slice(0, lastSpace);
    const toggle = el('button', 'description-toggle'); toggle.type = 'button'; toggle.setAttribute('aria-controls', paragraph.id);
    const refresh = () => { const expanded = expandedDescriptions.has(record.rowKey); paragraph.textContent = expanded ? text : shortened.trimEnd() + '…'; toggle.textContent = expanded ? 'less' : 'more'; toggle.setAttribute('aria-expanded', String(expanded)); toggle.setAttribute('aria-label', `${expanded ? 'Show less' : 'Read more'} about ${record.id}`); };
    toggle.addEventListener('click', () => { expandedDescriptions.has(record.rowKey) ? expandedDescriptions.delete(record.rowKey) : expandedDescriptions.add(record.rowKey); refresh(); });
    cell.append(toggle); refresh(); return cell;
  }
  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ query: nameInput.value, selections: Object.fromEntries(Object.entries(selections).map(([group, keys]) => [group, [...keys]])), reviewed, page, pageSize })); } catch {}
  }
  function summaryText() {
    const parts = [];
    if (nameInput.value.trim()) parts.push(`Search: “${nameInput.value.trim()}”`);
    const names = { disease: 'Disease', hasDisease: 'Has disease', sex: 'Sex', organisation: 'Research organisation', variant: 'Variant' };
    for (const group of ['disease', 'hasDisease', 'sex', 'organisation', 'variant']) {
      const selected = selections[group];
      if (!selected.size) continue;
      const remaining = new Set(selected), labels = [];
      // Prefer complete categories, then describe partial selections with their full paths.
      const candidates = controls.filter(c => c.group === group && c.keys.length && c.keys.every(k => selected.has(k))).sort((a,b) => b.keys.length - a.keys.length || a.path.length - b.path.length);
      for (const c of candidates) {
        if (!c.keys.some(k => remaining.has(k))) continue;
        labels.push(c.path.join(' > ')); c.keys.forEach(k => remaining.delete(k));
      }
      labels.push(...remaining);
      parts.push(`${names[group]}: ${labels.join('; ')}`);
    }
    return parts.join(' · ') || 'All cell lines; no filters selected.';
  }
  function renderSummaries() {
    const full = summaryText();
    for (const kind of ['filter', 'listing']) {
      const host = document.querySelector(kind === 'filter' ? '#filter-result-count' : '#listing-filter-summary');
      host.hidden = kind === 'filter' && !reviewed;
      host.replaceChildren();
      const prefix = el('span', 'summary-prefix');
      prefix.append(el('strong', '', 'Current search & filter'), document.createTextNode(` — ${matches.length} matching cell lines: `));
      host.append(prefix);
      const expanded = summaryExpanded[kind], countOnly = kind === 'filter' && editing;
      host.classList.toggle('summary-expanded', expanded);
      const text = el('span', 'selection-summary-text', kind === 'listing' || expanded ? full : countOnly ? '' : [...full].slice(0,75).join(''));
      text.id = `summary-text-${kind}`; host.append(text);
      const needsToggle = kind === 'listing'
        ? text.scrollWidth > text.clientWidth || host.scrollWidth > host.clientWidth
        : countOnly || [...full].length > 75;
      if (expanded || needsToggle) {
        const button = el('button', 'summary-toggle', expanded ? 'less…' : 'more…');
        button.type = 'button'; button.setAttribute('aria-expanded', String(expanded)); button.setAttribute('aria-controls', text.id);
        button.addEventListener('click', () => { summaryExpanded[kind] = !expanded; renderSummaries(); document.querySelector(`#${host.id} .summary-toggle`)?.focus(); });
        host.append(document.createTextNode(' '), button);
      }
    }
  }
  let summaryWidth = 0;
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (width > 0 && width !== summaryWidth) {
      summaryWidth = width;
      renderSummaries();
    }
  }).observe(listingSummary);
  document.fonts.ready.then(renderSummaries);
  function renderRows() {
    const fragment = document.createDocumentFragment();
    for (const r of matches.slice((page - 1) * pageSize, page * pageSize)) {
      const row = el('tr'); row.dataset.record = r.rowKey;
      const identifier = el('td', 'identifier-col'); identifier.dataset.label = 'Identifier';
      const localPage = {'ausMCRIi035-B-1':'cell-line-704.html', 'ausMCRIi001-A-3':'cell-line-537.html', 'ausWAe009-A-3H':'cell-line-770.html'}[r.id];
      const link = el('a', 'result-identifier', r.id); link.href = localPage || r.source; if (!localPage) { link.target = '_blank'; link.rel = 'noopener'; } link.setAttribute('aria-label', `${r.id} — ${localPage ? 'open cell line page' : 'open Registry record in a new tab'}`);
      link.addEventListener('click', () => { reviewed = true; persist(); });
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
    renderSummaries(); persist();
    document.querySelector('.page-number').replaceChildren(el('strong', '', String(page)), el('span', '', `of ${Math.max(1, Math.ceil(matches.length / pageSize))}`));
    const maxPage = Math.max(1, Math.ceil(matches.length / pageSize));
    document.querySelectorAll('.page-arrow').forEach(button => {
      button.disabled = button.getAttribute('aria-label') === 'Previous page' ? page === 1 : page >= maxPage;
    });
  }
  function updateResults(resetPage = false) {
    const query = normalise(nameInput.value);
    matches = records.filter(r => (!query || normalise([r.id, ...r.aliases, ...r.diseases, r.contact, ...r.organisation, r.description, ...r.loci].join(' ')).includes(query)) && Object.entries(selections).every(([group, selected]) => !selected.size || intersects(selected, keysFor(r, group))));
    // Keep the working prototype detail link easy to find on each results page.
    // Swap existing matching rows only: preserve the repeated dataset and filters.
    for (let start = 0; start < matches.length; start += pageSize) {
      const second = start + 1;
      if (second >= matches.length) break;
      const end = Math.min(start + pageSize, matches.length);
      const detail = matches.findIndex((r, i) => i >= start && i < end && r.id === 'ausMCRIi035-B-1');
      if (detail >= 0 && detail !== second) [matches[second], matches[detail]] = [matches[detail], matches[second]];
    }
    if (resetPage) { page = 1; resultsPane.scrollTop = 0; }
    page = Math.min(page, Math.max(1, Math.ceil(matches.length / pageSize)));
    renderRows();
  }
  function responsiveState() {
    const open = workspace.classList.contains('filter-open');
    const overlay = window.matchMedia('(max-width:1199px)').matches;
    panel.setAttribute('role', open && overlay ? 'dialog' : 'complementary');
    if (open && overlay) panel.setAttribute('aria-modal', 'true'); else panel.removeAttribute('aria-modal');
    resultsPane.inert = open && overlay;
  }
  function setOpen(open) {
    if (!open) { reviewed = true; editing = false; summaryExpanded.filter = false; summaryExpanded.listing = false; }
    if (open) diseaseOptions.closest('details').open = false;
    workspace.classList.toggle('filter-open', open); panel.inert = !open; filterButton.setAttribute('aria-expanded', String(open));
    responsiveState(); renderSummaries(); persist();
    if (open) nameInput.focus({ preventScroll: true }); else filterButton.focus({ preventScroll: true });
  }
  filterButton.addEventListener('click', () => setOpen(!workspace.classList.contains('filter-open')));
  document.querySelector('.filter-apply-button').addEventListener('click', () => setOpen(false));
  new ResizeObserver(responsiveState).observe(panel);
  document.querySelectorAll('.filter-clear-button').forEach(button => button.addEventListener('click', () => { Object.values(selections).forEach(set => set.clear()); nameInput.value = ''; editing = true; summaryExpanded.filter = false; updateChecks(); updateResults(true); }));
  nameInput.addEventListener('input', () => { editing = true; summaryExpanded.filter = false; updateResults(true); });
  document.querySelectorAll('.display-menu button').forEach(button => button.addEventListener('click', () => {
    pageSize = button.textContent.trim() === 'ALL' ? records.length : Number(button.textContent.trim());
    document.querySelector('#display-value').textContent = button.textContent.trim(); document.querySelector('.display-control').open = false;
    document.querySelectorAll('.display-menu button').forEach(b => b.classList.toggle('selected-option', b === button)); updateResults(true);
  }));
  document.querySelectorAll('.page-arrow').forEach(button => button.addEventListener('click', () => {
    const max = Math.max(1, Math.ceil(matches.length / pageSize));
    page = button.getAttribute('aria-label') === 'Previous page' ? Math.max(1, page - 1) : Math.min(max, page + 1);
    resultsPane.scrollTop = 0; renderRows();
  }));
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
  if (new URLSearchParams(location.search).get('filter') !== 'open') reviewed = true;
  document.querySelector('#display-value').textContent = pageSize === records.length ? 'ALL' : String(pageSize);
  updateChecks(); updateResults(); responsiveState();
  const params = new URLSearchParams(location.search);
  if (params.get('filter') === 'open') setOpen(true);
  const section = { disease: 'disease-options', organisation: 'organisation-options', variant: 'variant-options' }[params.get('section')];
  if (section) {
    const target = document.getElementById(section);
    target.closest('details').open = true;
    target.closest('section').scrollIntoView({ block: 'nearest' });
  }
})();
