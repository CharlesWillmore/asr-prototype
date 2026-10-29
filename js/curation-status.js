(() => {
  'use strict';
  const host = document.querySelector('#curation-chart');
  if (!host) return;
  const statuses = ['Not yet reviewed', 'Reviewed', 'Flagged for further review'];
  // Approximate counts read from the bar lengths in Suzy's supplied diagram.
  // The PDF does not label exact values; keep these independent of demo results.
  const counts = [221, 167, 84];
  const maximum = Math.max(50, Math.ceil(Math.max(...counts) / 50) * 50);
  const plot = document.createElement('div'); plot.className = 'curation-plot';
  statuses.forEach((status, index) => {
    const link = document.createElement('a');
    link.className = `curation-row curation-row-${index}`;
    link.href = `index.html?filter=open&section=curation&curation=${encodeURIComponent(status)}`;
    link.setAttribute('aria-label', `${status} by the Registry: ${counts[index]} cell lines. Open curation filter.`);
    const label = document.createElement('span'); label.className = 'curation-label';
    const title = document.createElement('strong'); title.textContent = status;
    const subtitle = document.createElement('span'); subtitle.textContent = 'by the Registry';
    label.append(title, subtitle);
    const track = document.createElement('span'); track.className = 'curation-track';
    const bar = document.createElement('span'); bar.className = 'curation-bar';
    bar.style.width = `${counts[index] / maximum * 100}%`;
    const callout = document.createElement('span'); callout.className = 'curation-callout';
    const number = document.createElement('strong'); number.textContent = counts[index];
    const cellWord = document.createElement('span'); cellWord.className = 'curation-cell-word'; cellWord.textContent = 'Cell ';
    callout.append(number, ' ', cellWord, 'Lines'); bar.append(callout); track.append(bar); link.append(label, track); plot.append(link);
  });
  const axis = document.createElement('div'); axis.className = 'curation-axis'; axis.setAttribute('aria-hidden', 'true');
  for (let value = 0; value <= maximum; value += 50) {
    const tick = document.createElement('span'); tick.textContent = value; tick.style.left = `${value / maximum * 100}%`; axis.append(tick);
  }
  plot.style.setProperty('--grid-step', `${50 / maximum * 100}%`);
  plot.append(axis); host.append(plot);
})();
