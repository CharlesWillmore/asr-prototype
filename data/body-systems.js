/* Systems follow the supplied diagram; disease membership follows the Registry tree. */
window.registryBodySystems = [
  {id:'nervous',name:'Nervous System',lines:['Nervous','System'],side:'right',y:182, categories:['nervous system disorder']},
  {id:'visual',name:'Visual System',lines:['Visual','System'],side:'left',y:182,categories:['disorder of visual system','disorder of orbital region']},
  {id:'auditory',name:'Auditory System',lines:['Auditory','System'],side:'left',y:292.6,categories:['otorhinolaryngologic disease']},
  {id:'musculoskeletal',name:'Musculoskeletal System',lines:['Musculoskeletal','System'],side:'left',y:402.9,categories:['musculoskeletal system disorder']},
  {id:'connective',name:'Connective Tissue',lines:['Connective','Tissue'],side:'left',y:513.5,categories:['connective tissue disorder']},
  {id:'urinary',name:'Urinary System',lines:['Urinary','System'],side:'left',y:624,categories:['urinary system disorder']},
  {id:'cardiovascular',name:'Cardiovascular System',lines:['Cardiovascular','System'],side:'right',y:338.3,categories:['cardiovascular disorder']},
  {id:'blood-immune',name:'Blood and Immune System',lines:['Blood and','Immune System'],side:'right',y:482.6,categories:['blood disorder','immune system disorder']},
  {id:'digestive',name:'Digestive System',lines:['Digestive','System'],side:'right',y:626.2,categories:['digestive system disorder']}
];
window.bodySystemDiseaseKeys = system => {
  const normalise = value => value.toLowerCase().replace(/[’']/g,"'").replace(/[,]/g,'').replace(/\s+/g,' ').trim();
  const keys = new Set();
  function visit(node) {
    if (node.disease) keys.add(normalise(node.disease));
    (node.children || []).forEach(visit);
  }
  (window.registryDiseaseTree || []).filter(node => system.categories.includes(node.label)).forEach(visit);
  return [...keys];
};
