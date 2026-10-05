const $=s=>document.querySelector(s);
const map=L.map('map',{zoomControl:false}).setView([37.225,-121.85],12);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const group={};
const hood=L.layerGroup(NEIGHBORHOODS.map(n=>L.polygon(n.poly,{color:'#495057',weight:1.5,dashArray:'4',fillOpacity:.03}).bindTooltip(n.name,{sticky:true}))).addTo(map);

// Create hazard zones with enhanced labels and source information
for(const [k,h] of Object.entries(HAZARDS)){
  group[k]=L.layerGroup(h.polys.map((p,idx)=>{
    const poly=L.polygon(p,{color:h.color,weight:2,fillOpacity:.25});
    const popupContent=`<div style="font-size:13px"><b>${h.label}</b><br><small><strong>Source:</strong> ${h.src}<br><strong>Attribution:</strong> ${h.attribution}<br><strong>Updated:</strong> ${h.updateDate}</small></div>`;
    poly.bindPopup(popupContent);
    
    // Add center label to polygon (for visibility on map)
    const bounds=L.latLngBounds(p.map(pt=>[pt[0],pt[1]]));
    const center=bounds.getCenter();
    const labelText=h.label.split(' - ')[0]; // Use short name for map label
    const label=L.marker(center,{
      icon:L.divIcon({
        className:'hazard-label',
        html:`<div style="background:${h.color};color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2)">${labelText}</div>`,
        iconSize:[null,null]
      })
    });
    label.bindPopup(popupContent);
    label.addTo(group[k]);
    return poly;
  }));
}

group.routes=L.layerGroup();
ROUTES.forEach(r=>{
  L.polyline(r.pts,{color:'#fff',weight:9,opacity:.9}).addTo(group.routes);
  L.polyline(r.pts,{color:'#2b8a3e',weight:5,className:'route-flow'}).bindPopup(`<b>${r.name}</b><br><small>Illustrative route. Assembly: ${r.assembly}</small>`).addTo(group.routes);
  L.circleMarker(r.pts[r.pts.length-1],{radius:7,color:'#fff',fillColor:'#2b8a3e',fillOpacity:1,weight:2}).bindTooltip('Exit: '+r.assembly).addTo(group.routes);
});

document.querySelectorAll('[data-layer]').forEach(c=>c.onchange=()=>toggle(c.dataset.layer,c.checked));
function toggle(k,on){on?group[k].addTo(map):map.removeLayer(group[k]);const c=document.querySelector(`[data-layer=${k}]`);if(c)c.checked=on}
function inPoly(p,poly){let ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[a,b]=poly[i],[c,d]=poly[j];
  if((b>p[1])!=(d>p[1])&&p[0]<(c-a)*(p[1]-b)/(d-b)+a)ins=!ins}return ins}
const dist=(a,b)=>Math.hypot((a[0]-b[0])*111,(a[1]-b[1])*88);
function routeDist(pt,r){let m=1e9;for(let i=0;i<r.pts.length-1;i++)for(let t=0;t<=10;t++){const q=[r.pts[i][0]+(r.pts[i+1][0]-r.pts[i][0])*t/10,r.pts[i][1]+(r.pts[i+1][1]-r.pts[i][1])*t/10];m=Math.min(m,dist(pt,q));}return m}
let pin;
async function search(e){e.preventDefault();const q=$('#addr').value.trim();if(!q)return;const out=$('#result');out.innerHTML='<p class="muted">Searching...</p>';
  try{const u='https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=-122.05,37.4,-121.7,37.1&q='+encodeURIComponent(q+', San Jose, CA');
    const r=await (await fetch(u)).json();if(!r.length)return out.innerHTML='<p class="warn">Address not found in San Jose. Try adding a street number.</p>';
    show([+r[0].lat,+r[0].lon],r[0].display_name.split(',').slice(0,3).join(','))}catch(x){out.innerHTML='<p class="warn">Lookup failed. Check your internet connection.</p>'}}
function show(pt,label){if(pin)map.removeLayer(pin);pin=L.marker(pt).addTo(map).bindPopup(label).openPopup();map.flyTo(pt,14);
  const nb=NEIGHBORHOODS.find(n=>inPoly(pt,n.poly));
  const hits=Object.entries(HAZARDS).filter(([k,h])=>h.polys.some(p=>inPoly(pt,p)));
  hits.forEach(([k])=>toggle(k,true));toggle('routes',true);
  const near=ROUTES.map(r=>({r,d:routeDist(pt,r)})).sort((a,b)=>a.d-b.d).slice(0,2);
  $('#result').innerHTML=`<div class="card"><b>${label}</b><div class="muted">${nb?nb.name:'Outside D10 prototype coverage'}</div>
  <h4>Risk exposure</h4>${hits.length?hits.map(([k,h])=>`<span class="chip">${h.label}<span class="chip-source">${h.attribution.split(' ')[0]}</span></span>`).join(''):'<p class="muted">Not inside a mapped high-risk zone in this prototype.</p>'}
  <h4>Nearest evacuation routes</h4>${near.map(n=>`<div class="route">${n.r.name}<span>${n.d.toFixed(1)} km</span></div>`).join('')}
  ${nb?`<button class="btn" onclick="goCheck('${nb.name}')">Start my preparedness check</button>`:''}</div>`}
$('#search').onsubmit=search;
// ---- tabs
function tab(n){document.querySelectorAll('.tab').forEach(t=>t.hidden=t.id!=='tab-'+n);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===n));if(n==='map')map.invalidateSize()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
// ---- checklist
let st=JSON.parse(localStorage.getItem('bready')||'{"hood":"Almaden Valley","done":{}}');
const save=()=>localStorage.setItem('bready',JSON.stringify(st));
$('#hood').innerHTML=NEIGHBORHOODS.map(n=>`<option>${n.name}</option>`).join('');
function goCheck(h){st.hood=h;save();render();tab('check')}
function pct(){return Math.round(100*CHECKLIST.filter(c=>st.done[c.id]).length/CHECKLIST.length)}
function render(){$('#hood').value=st.hood;$('#items').innerHTML=CHECKLIST.map(c=>`<label class="item"><input type="checkbox" data-id="${c.id}" ${st.done[c.id]?'checked':''}><div><b>${c.t}</b><br><small>${c.d}</small></div></label>`).join('');
  document.querySelectorAll('#items input').forEach(i=>i.onchange=()=>{st.done[i.dataset.id]=i.checked;save();render()});
  const p=pct();$('#me').style.width=p+'%';$('#mepct').textContent=p+'%';
  const rows=NEIGHBORHOODS.map(n=>{const s=SEED[n.name],me=n.name===st.hood&&p>0;return{n:n.name,v:Math.round((s.sum+(me?p:0))/(s.n+(me?1:0))),you:me}}).sort((a,b)=>b.v-a.v);
  $('#board').innerHTML=rows.map((r,i)=>`<div class="lb"><span>${i+1}. ${r.n}${r.you?' <em>(includes you)</em>':''}</span><div class="bar"><i style="width:${r.v}%"></i></div><b>${r.v}%</b></div>`).join('');
}
$('#hood').onchange=e=>{st.hood=e.target.value;save();render()};
render();
