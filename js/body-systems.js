(() => {
  const host = document.querySelector('#body-system-diagram');
  if (!host) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 1366 860');
  svg.setAttribute('aria-label','Explore cell lines by body system');
  const mobile = document.querySelector('.body-system-mobile');
  const normalise = value => value.toLowerCase().replace(/[’']/g,"'").replace(/[,]/g,'').replace(/\s+/g,' ').trim();
  const images = new Map(), links = [];
  const defaultImage = document.createElement('img');
  defaultImage.src = 'assets/home/body-systems/default.webp'; defaultImage.alt = '';
  defaultImage.width = 1366; defaultImage.height = 860;
  defaultImage.className = 'body-system-art body-system-base is-active'; host.append(defaultImage);
  function activate(id) {
    defaultImage.classList.toggle('is-muted', Boolean(id));
    images.forEach((image,key) => image.classList.toggle('is-active',key===id));
    links.forEach(link => link.classList.toggle('is-active',link.dataset.system===id));
  }
  window.registryBodySystems.forEach(system => {
    const keys = new Set(window.bodySystemDiseaseKeys(system));
    const count = (window.registryRecords || []).filter(record => record.diseases.some(disease => keys.has(normalise(disease)))).length;
    const href = `index.html?body-system=${encodeURIComponent(system.id)}`;
    const image = document.createElement('img');
    image.src = `assets/home/body-systems/${system.id}-overlay.png`; image.alt = ''; image.width=1366; image.height=860;
    image.className='body-system-art'; images.set(system.id,image); host.append(image);
    const link = document.createElementNS(ns,'a');
    link.setAttribute('href',href); link.setAttribute('aria-label',`${system.name}: ${count} cell lines. Show matching lines.`);
    link.dataset.system=system.id;
    const right = system.side==='right', x=right?980:385;
    const rect=document.createElementNS(ns,'rect');
    rect.setAttribute('x',right?970:115); rect.setAttribute('y',system.y-26); rect.setAttribute('width','285');rect.setAttribute('height','92');rect.setAttribute('rx','4');rect.setAttribute('class','body-system-target');link.append(rect);
    system.lines.forEach((label,index)=>{
      const text=document.createElementNS(ns,'text');text.setAttribute('x',x);text.setAttribute('y',system.y+index*28.8);text.setAttribute('text-anchor',right?'start':'end');text.setAttribute('class','body-system-label');text.textContent=label;link.append(text);
    });
    const value=document.createElementNS(ns,'text');value.setAttribute('x',x);value.setAttribute('y',system.y+57.6);value.setAttribute('text-anchor',right?'start':'end');value.setAttribute('class','body-system-count');value.textContent=`${count} Cell ${count===1?'Line':'Lines'} →`;link.append(value);
    link.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')activate(system.id);});
    link.addEventListener('focus',()=>activate(system.id));links.push(link);svg.append(link);
    const row=document.createElement('a');row.href=href;
    const name=document.createElement('span');name.textContent=system.name;
    const number=document.createElement('span');number.textContent=`${count} Cell ${count===1?'Line':'Lines'} →`;
    row.append(name,number);mobile.append(row);
  });
  host.append(svg);
  host.addEventListener('pointerleave',()=>{
    const focused=links.find(link=>link===document.activeElement);
    activate(focused?.dataset.system);
  });
  host.addEventListener('focusout',event=>{if(!host.contains(event.relatedTarget))activate(null);});
})();
