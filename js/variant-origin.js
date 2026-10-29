(() => {
  'use strict';
  // Illustrative counts transcribed from the relative segment/bar sizes in the
  // supplied first-page brief. These are not the 18-record registry snapshot.
  const groups = [
    { name: 'Donor', color: '#032b43', outer: '#00517b', genes: [['ACTA1',10],['TRAPPC4',9],['NF1',9],['ABCA4',6],['RFC1',6],['CYP2U1',4],['PAH',4],['RYR1',4],['CRB1',3],['MYH7',3],['PRPF31',3],['PSEN1',3],['RCBTB1',3],['SCN2A',2],['USH2A',2],['CASK',1],['CASQ2',1],['CDH23',1],['SNRNP200',1],['APOE',1],['CCNF',1],['COL6A1',1],['MYO7A',1],['OTX2',1],['PRKN',1],['RP1',1],['SCN1A',1],['SOD1',1]] },
    { name: 'Alteration', color: '#f79400', outer: '#fbd59c', genes: [['NAXE',4],['COL1A1',4],['NEUROG2',5],['RAB39B',2],['SRCAP',2],['TRPV4',2],['AGK',1],['CLN3',2],['CX3CR1',1],['GCG',1],['INS',1],['KCNT1',1],['NR2F2',1],['SOX9',1],['TAZ',1],['TARDBP',1]] }
  ];
  const root = document.querySelector('#variant-chart');
  if (!root) return;
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}, text) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key,value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const svg = make('svg', { viewBox: '0 0 1200 920', role: 'group', 'aria-label': 'Variant origin sunburst. Donor and alteration loci. Example data.' });
  root.append(svg);
  const cx = 600, cy = 450, total = groups.flatMap(g => g.genes).reduce((n,g) => n+g[1],0);
  const point = (r,a) => [cx+r*Math.cos(a),cy+r*Math.sin(a)];
  const arc = (r1,r2,start,end) => {
    const a=point(r2,start),b=point(r2,end),c=point(r1,end),d=point(r1,start),large=end-start>Math.PI?1:0;
    return `M${a} A${r2},${r2} 0 ${large} 1 ${b} L${c} A${r1},${r1} 0 ${large} 0 ${d} Z`;
  };
  const url = 'index.html?filter=open&section=variant';
  const donorSpan = groups[0].genes.reduce((sum, gene) => sum + gene[1], 0) / total * Math.PI * 2;
  const rotation = Math.PI / 2 + donorSpan / 2;
  let angle = 0;
  const leaves = [];
  groups.forEach(group => {
    const amount = group.genes.reduce((n,g)=>n+g[1],0), span = amount / total * Math.PI*2;
    // Centre Donor below and Alteration above on the vertical axis.
    const start = rotation-span-angle, end = rotation-angle;
    svg.append(make('path',{d:arc(116,225,start,end),fill:group.color,stroke:'#f2f8fd','stroke-width':1}));
    const middle = point(170,(start+end)/2);
    svg.append(make('text',{x:middle[0],y:middle[1],'text-anchor':'middle','dominant-baseline':'central',class:'variant-origin-label',fill:group.name==='Donor'?'#fff':'#282828'},group.name));
    let cursor = end;
    group.genes.forEach(([gene,count]) => {
      const size = count/total*Math.PI*2, a = cursor-size, mid = (a+cursor)/2;
      const link = make('a',{href:url,'aria-label':`${gene}, ${group.name}, ${count} cell ${count===1?'line':'lines'}. Open variant filter.`});
      const wedge = make('path',{d:arc(225,338,a,cursor),fill:group.outer,stroke:'#f2f8fd','stroke-width':.8,class:'variant-wedge'});
      link.append(wedge,make('title',{},`${gene} · ${group.name} · ${count} cell ${count===1?'line':'lines'}`));
      const pos = point(325,mid),left = Math.cos(mid)<0;
      let rotation = mid*180/Math.PI;
      if(left) rotation+=180;
      link.append(make('text',{x:pos[0],y:pos[1],transform:`rotate(${rotation} ${pos[0]} ${pos[1]})`,'text-anchor':left?'start':'end','dominant-baseline':'central',class:'variant-gene-label',fill:group.name==='Donor'?'white':'#332b20'},gene));
      svg.append(link);
      leaves.push({link,mid,gene,count,group});
      cursor=a;
    });
    angle+=span;
  });
  svg.append(make('text',{x:cx,y:cy-7,'text-anchor':'middle',class:'variant-center'},'Variant'));
  svg.append(make('text',{x:cx,y:cy+20,'text-anchor':'middle',class:'variant-center'},'Origin'));
  const callout = make('g',{'aria-hidden':'true',class:'variant-callout'});
  const line = make('path',{fill:'none','stroke-width':1.2});
  const name = make('text',{class:'variant-callout-name'}), number = make('text',{class:'variant-callout-count'});
  callout.append(line,name,number);svg.append(callout);
  function reveal(leaf) {
    leaves.forEach(l=>l.link.classList.toggle('is-selected',l===leaf));
    const {mid,gene,count,group}=leaf, left=Math.cos(mid)<0;
    const begin=point(338,mid), elbow=point(385,mid), x=left?35:1165;
    line.setAttribute('d',`M${begin} L${elbow} H${x}`);
    line.setAttribute('stroke',group.name==='Donor'?'#00517b':'#f79400');
    [name,number].forEach(n=>{n.setAttribute('x',x);n.setAttribute('text-anchor',left?'start':'end');});
    name.setAttribute('y',elbow[1]-10);number.setAttribute('y',elbow[1]+28);
    name.textContent=gene;number.textContent=`${count} Cell ${count===1?'Line':'Lines'}`;
    callout.classList.add('is-visible');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      [line,name,number].forEach(n => n.getAnimations().forEach(animation => animation.cancel()));
      const length = line.getTotalLength();
      line.animate([{strokeDasharray: `${length}`, strokeDashoffset: length}, {strokeDasharray: `${length}`, strokeDashoffset: 0}], {duration: 650, easing: 'ease-out'});
      [name,number].forEach(n => n.animate([{opacity:0},{opacity:1}], {duration:250,delay:400,fill:'backwards'}));
    }
  }
  leaves.forEach(leaf=>{
    leaf.link.addEventListener('pointerenter',()=>reveal(leaf));
    leaf.link.addEventListener('focus',()=>reveal(leaf));
  });
  root.addEventListener('pointerleave',()=>{
    if (!root.contains(document.activeElement)) {callout.classList.remove('is-visible');leaves.forEach(l=>l.link.classList.remove('is-selected'));}
  });
  root.addEventListener('focusout',event=>{
    if(!root.contains(event.relatedTarget)){callout.classList.remove('is-visible');leaves.forEach(l=>l.link.classList.remove('is-selected'));}
  });
  const tree=document.querySelector('#variant-tree');
  groups.forEach(group=>{
    const details=document.createElement('details');details.open=true;
    details.className=group.name==='Donor'?'variant-donor':'variant-alteration';
    const summary=document.createElement('summary');summary.textContent=group.name;
    const list=document.createElement('ul');
    group.genes.forEach(([gene,count])=>{
      const li=document.createElement('li'),a=document.createElement('a'),value=document.createElement('span');
      a.href=url;a.append(document.createTextNode(gene));value.textContent=`${count} cell ${count===1?'line':'lines'}`;
      a.append(value);li.append(a);list.append(li);
    });
    details.append(summary,list);tree.append(details);
  });
})();
