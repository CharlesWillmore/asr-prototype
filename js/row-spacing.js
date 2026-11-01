(() => {
  const variant = document.querySelector('.variant-chart svg');
  if (!variant) return;
  const rows = [
    { heading: '.body-system-heading', desktop: '.body-system-diagram', mobile: '.body-system-mobile', inset: width => width * 148 / 1366 },
    { heading: '.curation-heading', desktop: '.curation-card', inset: () => 0 },
    { heading: '.location-heading', desktop: '.location-stage', mobile: '.location-mobile-tree', inset: () => {
      const svg = document.querySelector('.location-map-svg');
      const groups = [...svg.querySelectorAll('.location-bubbles,.location-capitals,.location-hit-areas')];
      const top = Math.min(...groups.map(group => group.getBBox().y));
      return Math.max(0, top) * svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    } }
  ];
  function align() {
    // The circle begins at y=112 in the Variant Origin SVG's 1200-unit viewBox.
    const gap = variant.getBoundingClientRect().width ? variant.getBoundingClientRect().width * 112 / 1200 : 24;
    rows.forEach(row => {
      const heading = document.querySelector(row.heading);
      const desktop = document.querySelector(row.desktop);
      const mobile = row.mobile && document.querySelector(row.mobile);
      const diagram = desktop.getClientRects().length ? desktop : mobile;
      if (!diagram) return;
      const inset = diagram === desktop ? row.inset(diagram.getBoundingClientRect().width) : 0;
      diagram.style.marginTop = `${gap - inset}px`;
      heading.style.paddingBottom = '0px';
      heading.style.marginBottom = '0px';
    });
  }
  const observer = new ResizeObserver(align);
  observer.observe(document.querySelector('.variant-inner'));
  document.fonts.ready.then(align);
  align();
})();
