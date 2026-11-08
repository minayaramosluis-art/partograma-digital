const $=id=>document.getElementById(id),svg=$('chart');let entries=[];
const groups=[['Identificación no nominal',[['codigo','Código ficticio de caso','text'],['edad','Edad materna (años)','number'],['ingreso','Fecha y hora de ingreso','datetime-local'],['responsable','Nombre del profesional responsable (usar nombre ficticio en pruebas)','text'],['profesion','Profesión / cargo del responsable','text'],['colegiatura','Número de colegiatura (ficticio)','text'],['establecimiento','Establecimiento de salud','text']]],['Antecedentes obstétricos',[['gestas','Gestaciones','number'],['partos','Partos vaginales','number'],['cesareas','Cesáreas','number'],['abortos','Abortos','number'],['vivos','Hijos vivos','number'],['antecedentes','Antecedentes obstétricos relevantes','textarea']]],['Embarazo actual',[['eg','Edad gestacional (semanas)','number'],['fur','Fecha de última regla','date'],['fpp','Fecha probable de parto','date'],['cpn','Controles prenatales','number'],['presentacion','Presentación fetal','select','Cefálica|Podálica|Otra|No evaluada'],['situacion','Situación fetal','select','Longitudinal|Transversa|Oblicua|No evaluada'],['membranas','Membranas','select','Íntegras|Rotas|No evaluadas'],['rotura','Fecha y hora de rotura de membranas','datetime-local'],['riesgos','Factores de riesgo / diagnóstico de ingreso','textarea']]]];
const evals=[['time','Fecha y hora','datetime-local'],['atendio','Profesional que realiza la evaluación (nombre ficticio)','text'],['d','Dilatación cervical (cm)','select','0|1|2|3|4|5|6|7|8|9|10'],['borramiento','Borramiento (%)','number'],['descenso','Estación fetal respecto a espinas ciáticas','select','No evaluado|-3|-2|-1|0|+1|+2|+3'],['fcf','Frecuencia cardiaca fetal (lpm)','number'],['liquido','Líquido amniótico','select','No evaluado|Claro|Meconial|Sanguinolento|Otro'],['contracciones','Contracciones en 10 min','number'],['duracion','Duración promedio (segundos)','number'],['pa','Presión arterial (ej. 120/80)','text'],['pulso','Pulso materno (lpm)','number'],['temperatura','Temperatura (°C)','number'],['oxitocina','Oxitocina (UI/L)','number'],['gotas','Oxitocina (gotas/min)','number'],['liquidos','Líquidos / medicamentos','text'],['proteinas','Proteínas en orina (resultado)','text'],['cetonas','Acetona / cetonas en orina (resultado)','text'],['volumen','Volumen urinario (mL)','number'],['observaciones','Observaciones','textarea']];
function field([id,label,type,opts]){const l=document.createElement('label');l.textContent=label;let e;if(type==='textarea'){e=document.createElement('textarea');e.rows=2}else if(type==='select'){e=document.createElement('select');for(const opt of opts.split('|')){const o=document.createElement('option');o.value=opt;o.textContent=opt;e.append(o)}}else{e=document.createElement('input');e.type=type;if(type==='number'){e.min=0;e.step='any'}}e.id=id;l.append(e);return l}
for(const [name,fields] of groups){const s=document.createElement('section');s.className='subgroup';const h=document.createElement('h3');h.textContent=name;const div=document.createElement('div');div.className='fields';fields.forEach(f=>div.append(field(f)));s.append(h,div);$('profile').append(s)}
const form=document.createElement('div');form.className='fields';evals.forEach(f=>form.append(field(f)));$('evaluation').append(form);$('d').value='4';
function node(tag,attrs={},txt){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(txt!==undefined)e.textContent=txt;svg.append(e);return e}const x=t=>75+t*55,y=d=>355-d*29;
function startTime(){return $('ingreso').value || (entries.length ? entries[0].time : '');}
function initialOffset(){return entries.length ? Math.max(0,Number(entries[0].d)-4) : 0;}
function hourLabel(start,h){if(!start)return '—';const dt=new Date(start);dt.setMinutes(dt.getMinutes()+h*60);return String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');}
function renderFCF(){
 const chart=$('fcf-chart');chart.replaceChildren();
 const make=(tag,attrs={},txt)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(txt!==undefined)el.textContent=txt;chart.append(el);return el};
 const top=20,bottom=280,fy=v=>bottom-(v-80)*(bottom-top)/120;
 make('rect',{x:0,y:0,width:780,height:345,fill:'#fff'});
 for(let h=0;h<=12;h++){
  make('line',{x1:x(h),y1:top,x2:x(h),y2:bottom,stroke:h%2?'#d9e2e6':'#aebec6','stroke-width':h%2?1:1.3});
  make('text',{x:x(h),y:302,'text-anchor':'middle','font-size':12,fill:'#35515d'},String(h-initialOffset()));
  make('text',{x:x(h),y:323,'text-anchor':'middle','font-size':11,fill:'#35515d'},hourLabel(startTime(),h-initialOffset()));
 }
 for(let f=80;f<=200;f+=10){
  make('line',{x1:x(0),y1:fy(f),x2:x(12),y2:fy(f),stroke:f%20===0?'#9db0b8':'#d9e2e6','stroke-width':f%20===0?1.4:1});
  make('text',{x:57,y:fy(f)+4,'text-anchor':'end','font-size':12,fill:'#35515d'},String(f));
 }
 make('text',{x:20,y:151,transform:'rotate(-90 20 151)','text-anchor':'middle','font-size':13,fill:'#147d90'},'FCF (lpm)');
 make('text',{x:400,y:341,'text-anchor':'middle','font-size':12,fill:'#35515d'},'Horas relativas al ingreso · hora real');
 if(!entries.length)return;
 const t0=new Date(startTime()).getTime();
 for(const e of entries){
  if(e.fcf==='')continue;
  const f=Number(e.fcf),t=initialOffset()+(new Date(e.time).getTime()-t0)/3600000;
  if(!Number.isFinite(f)||f<80||f>200||t<0||t>12)continue;
  make('circle',{cx:x(t),cy:fy(f),r:5.2,fill:'#172b3b',stroke:'#fff','stroke-width':1.2});
 }
}

function renderContractions(){
 const chart=$('contractions-chart');chart.replaceChildren();
 const make=(tag,attrs={},txt,parent=chart)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(txt!==undefined)el.textContent=txt;parent.append(el);return el};
 const defs=make('defs');const p1=make('pattern',{id:'patShort',width:8,height:8,patternUnits:'userSpaceOnUse'},undefined,defs);
 make('rect',{width:8,height:8,fill:'#fff'},undefined,p1);make('rect',{x:0,y:0,width:4,height:4,fill:'#263b45'},undefined,p1);make('rect',{x:4,y:4,width:4,height:4,fill:'#263b45'},undefined,p1);
 const p2=make('pattern',{id:'patMedium',width:8,height:8,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},undefined,defs);
 make('rect',{width:8,height:8,fill:'#fff'},undefined,p2);make('rect',{width:0,height:0,width:3,height:8,fill:'#263b45'},undefined,p2);
 make('rect',{x:0,y:0,width:780,height:390,fill:'#fff'});
 const top=24,step=42,bottom=top+5*step;
 for(let n=0;n<=5;n++){const yy=bottom-n*step;make('line',{x1:x(0),y1:yy,x2:x(12),y2:yy,stroke:'#b4c5cb','stroke-width':n===0?1.7:1});if(n)make('text',{x:57,y:yy+5,'text-anchor':'end','font-size':13,fill:'#35515d'},String(n))}
 for(let h=0;h<=12;h++){make('line',{x1:x(h),y1:top,x2:x(h),y2:bottom,stroke:'#b4c5cb'});make('text',{x:x(h),y:254,'text-anchor':'middle','font-size':12,fill:'#35515d'},String(h-initialOffset()));make('text',{x:x(h),y:274,'text-anchor':'middle','font-size':10,fill:'#35515d'},hourLabel(startTime(),h-initialOffset()))}
 make('text',{x:20,y:137,transform:'rotate(-90 20 137)','text-anchor':'middle','font-size':12,fill:'#147d90'},'Contracciones / 10 min');
 make('text',{x:58,y:304,'text-anchor':'end','font-size':12,fill:'#35515d'},'UI/L');make('text',{x:58,y:338,'text-anchor':'end','font-size':12,fill:'#35515d'},'Gotas/min');
 for(let h=0;h<12;h++){make('rect',{x:x(h),y:284,width:55,height:34,fill:'none',stroke:'#b4c5cb'});make('rect',{x:x(h),y:318,width:55,height:34,fill:'none',stroke:'#b4c5cb'})}
 const t0=new Date(startTime()).getTime();
 for(const e of entries){const t=initialOffset()+(new Date(e.time).getTime()-t0)/3600000;if(t<0||t>12)continue;
  if(e.contracciones!==''&&e.duracion!==''){const n=Number(e.contracciones),dur=Number(e.duracion),fill=dur<20?'url(#patShort)':dur<=40?'url(#patMedium)':'#263b45';for(let j=0;j<n;j++)make('rect',{x:x(t)-12,y:bottom-(j+1)*step+2,width:24,height:step-4,fill,stroke:'#263b45','stroke-width':1});}
  if(e.oxitocina!=='')make('text',{x:x(t),y:305,'text-anchor':'middle','font-size':11,'font-weight':700,fill:'#163342'},e.oxitocina);
  if(e.gotas!=='')make('text',{x:x(t),y:339,'text-anchor':'middle','font-size':11,'font-weight':700,fill:'#163342'},e.gotas);
 }
 make('text',{x:400,y:377,'text-anchor':'middle','font-size':12,fill:'#35515d'},'Horas desde ingreso (0 en la primera evaluación) · hora real');
}

function renderMaternal(){
 const chart=$('maternal-chart');chart.replaceChildren();
 const make=(tag,attrs={},txt)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(txt!==undefined)el.textContent=txt;chart.append(el);return el};
 const labels=[['temperatura','Temperatura °C'],['proteinas','Proteínas'],['cetonas','Acetona / cetonas'],['volumen','Volumen (mL)']];
 const left=190,right=756,top=43,rowH=43,colW=(right-left)/12;
 make('rect',{width:780,height:270,fill:'#fff'});
 make('text',{x:10,y:22,'font-size':12,'font-weight':700,fill:'#163342'},'REGISTRO MATERNO');
 labels.forEach(([key,label],i)=>{
   const yy=top+i*rowH;
   make('text',{x:180,y:yy+26,'text-anchor':'end','font-size':12,fill:'#163342'},label);
   for(let h=0;h<12;h++)make('rect',{x:left+h*colW,y:yy,width:colW,height:rowH,fill:'none',stroke:'#9aadb5','stroke-width':1});
 });
 for(let h=0;h<12;h++){
   const xx=left+(h+.5)*colW;
   make('text',{x:xx,y:top+rowH*4+17,'text-anchor':'middle','font-size':10,fill:'#35515d'},String(h-initialOffset()));
   make('text',{x:xx,y:top+rowH*4+34,'text-anchor':'middle','font-size':9,fill:'#35515d'},hourLabel(startTime(),h-initialOffset()));
 }
 make('text',{x:180,y:top+rowH*4+17,'text-anchor':'end','font-size':10,fill:'#35515d'},'Horas');
 make('text',{x:180,y:top+rowH*4+34,'text-anchor':'end','font-size':10,fill:'#35515d'},'Reloj');
 if(!entries.length)return;
 const t0=new Date(startTime()).getTime();
 for(const e of entries){
   const t=initialOffset()+(new Date(e.time).getTime()-t0)/3600000;
   const h=Math.floor(t+1e-8);if(h<0||h>=12)continue;
   labels.forEach(([key],i)=>{
     const val=e[key];if(val===undefined||val==='')return;
     const xx=left+(h+.5)*colW,yy=top+i*rowH+26;
     make('text',{x:xx,y:yy,'text-anchor':'middle','font-size':11,'font-weight':700,fill:'#116b7a'},String(val).slice(0,10));
   });
 }
}

function render(){
 renderFCF();
 renderContractions();
 renderMaternal();
 svg.replaceChildren();
 node('rect',{x:0,y:0,width:780,height:420,fill:'#fff'});
 for(let h=0;h<=12;h++){
  node('line',{x1:x(h),y1:y(0),x2:x(h),y2:y(10),stroke:'#d5e1e5'});
  node('text',{x:x(h),y:375,'text-anchor':'middle','font-size':13,fill:'#35515d'},String(h-initialOffset()));
  node('text',{x:x(h),y:396,'text-anchor':'middle','font-size':11,fill:'#35515d'},hourLabel(startTime(),h-initialOffset()));
 }
 for(let d=0;d<=10;d++){
  node('line',{x1:x(0),y1:y(d),x2:x(12),y2:y(d),stroke:'#d5e1e5'});
  node('text',{x:57,y:y(d)+5,'text-anchor':'end','font-size':13,fill:'#35515d'},String(d));
 }
 node('text',{x:400,y:417,'text-anchor':'middle','font-size':12,fill:'#35515d'},'Horas relativas al ingreso · fila inferior: hora real');
 node('text',{x:20,y:190,transform:'rotate(-90 20 190)','text-anchor':'middle','font-size':14,fill:'#147d90'},'Dilatación (cm)');
 // Segunda escala independiente, estación fetal de -3 a +3; no es escala de dilatación.
 const stationY=v=>y((3-v)*10/6);
 for(let v=-3;v<=3;v++){
  node('line',{x1:x(12),y1:stationY(v),x2:x(12)+6,y2:stationY(v),stroke:'#2563a6'});
  node('text',{x:751,y:stationY(v)+5,'text-anchor':'start','font-size':13,fill:'#2563a6'},v>0?'+'+v:String(v));
 }
 node('text',{x:760,y:190,transform:'rotate(90 760 190)','text-anchor':'middle','font-size':12,fill:'#2563a6'},'Estación fetal');
 // Referencias geométricas fijas del formato clásico, también cuando la dilatación inicial supera 4 cm.
 node('line',{x1:x(0),y1:y(4),x2:x(12),y2:y(4),stroke:'#83969c','stroke-dasharray':'4 5'});
 node('line',{x1:x(0),y1:y(4),x2:x(6),y2:y(10),stroke:'#d97706','stroke-width':3});
 node('line',{x1:x(4),y1:y(4),x2:x(10),y2:y(10),stroke:'#b91c1c','stroke-width':3});
 if(entries.length){
  const t0=new Date(startTime()).getTime();
  const pts=entries.map(e=>({t:initialOffset()+(new Date(e.time).getTime()-t0)/3600000,d:Number(e.d),station:e.descenso}));
  node('polyline',{points:pts.map(p=>`${x(p.t)},${y(p.d)}`).join(' '),fill:'none',stroke:'#147d90','stroke-width':3.5});
  pts.forEach(p=>node('circle',{cx:x(p.t),cy:y(p.d),r:5.5,fill:'#147d90',stroke:'white','stroke-width':1.5}));
  let segment=[];
  const flush=()=>{if(segment.length>1)node('polyline',{points:segment.map(p=>`${x(p.t)},${stationY(p.v)}`).join(' '),fill:'none',stroke:'#2563a6','stroke-width':3.5});segment=[]};
  pts.forEach(p=>{
   if(p.station==='No evaluado'||p.station===''||!Number.isFinite(Number(p.station))){flush();return;}
   const v=Number(p.station);segment.push({t:p.t,v});
   const cx=x(p.t),cy=stationY(v),r=6;
   node('polygon',{points:`${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}`,fill:'#2563a6',stroke:'white','stroke-width':1.5});
  });flush();
 }
 const tbody=$('records');tbody.replaceChildren();entries.forEach((e,i)=>{
  const tr=document.createElement('tr');
  for(const val of [e.time.replace('T',' '),e.atendio||'—',e.d+' cm',e.descenso==='No evaluado'?'—':e.descenso,e.fcf||'—',e.pa||'—',e.contracciones||'—',e.duracion?e.duracion+' s':'—',e.oxitocina||'—',e.gotas||'—',e.temperatura||'—',e.proteinas||'—',e.cetonas||'—',e.volumen||'—']){
   const td=document.createElement('td');td.textContent=val;tr.append(td)
  }
  const td=document.createElement('td'),b=document.createElement('button');b.textContent='Eliminar';b.onclick=()=>{entries.splice(i,1);render()};td.append(b);tr.append(td);tbody.append(tr)
 });
}

$('add').onclick=()=>{const e=Object.fromEntries(evals.map(([id])=>[id,$(id).value.trim()])),msg=$('message');msg.textContent='';if(!e.time){msg.textContent='Indique fecha y hora.';return}if(e.contracciones!==''&&(!Number.isInteger(Number(e.contracciones))||Number(e.contracciones)<0||Number(e.contracciones)>5)){msg.textContent='Registre de 0 a 5 contracciones por 10 minutos.';return}if(e.duracion!==''&&(!Number.isFinite(Number(e.duracion))||Number(e.duracion)<0||Number(e.duracion)>300)){msg.textContent='La duración debe estar entre 0 y 300 segundos.';return}if(e.contracciones!==''&&Number(e.contracciones)>0&&e.duracion===''){msg.textContent='Indique la duración promedio de las contracciones.';return}for(const key of ['oxitocina','gotas']){if(e[key]!==''&&(!Number.isFinite(Number(e[key]))||Number(e[key])<0)){msg.textContent='Los valores de oxitocina no pueden ser negativos.';return}}if(e.fcf!==''&&(!Number.isFinite(Number(e.fcf))||Number(e.fcf)<0||Number(e.fcf)>250)){msg.textContent='La FCF debe estar entre 0 y 250 lpm para registrarse; el gráfico muestra de 80 a 200 lpm.';return}if(e.temperatura!==''&&(!Number.isFinite(Number(e.temperatura))||Number(e.temperatura)<25||Number(e.temperatura)>45)){msg.textContent='Compruebe la temperatura (25 a 45 °C).';return}if(e.volumen!==''&&(!Number.isFinite(Number(e.volumen))||Number(e.volumen)<0)){msg.textContent='El volumen urinario debe ser un número no negativo.';return}if(!Number.isInteger(Number(e.d))||Number(e.d)<0||Number(e.d)>10){msg.textContent='La dilatación debe ser un número entero entre 0 y 10 cm.';return}if(entries.length&&new Date(e.time)<=new Date(entries.at(-1).time)){msg.textContent='La evaluación debe ser posterior a la anterior.';return}if(Math.max(0,Number(entries[0]?.d ?? e.d)-4)+(new Date(e.time)-new Date(startTime()||e.time))/3600000>12){msg.textContent='El gráfico admite 12 horas desde el inicio.';return}if($('ingreso').value && new Date(e.time)<new Date($('ingreso').value)){msg.textContent='La evaluación no puede ser anterior al ingreso.';return}
if(entries.length===0&&!$('ingreso').value){$('ingreso').value=e.time;}
if(entries.length===0 && Number(e.d)>=4 && Number(e.d)-4+(new Date(e.time)-new Date($('ingreso').value))/3600000>12){msg.textContent='La primera evaluación queda fuera de la cuadrícula de 12 horas.';return;}
entries.push(e);render();msg.textContent='Evaluación agregada.'};
$('ingreso').addEventListener('change',()=>{const msg=$('message');if(entries.length&&entries.some(e=>new Date(e.time)<new Date($('ingreso').value)||initialOffset()*3600000+new Date(e.time)-new Date($('ingreso').value)>12*3600000)){msg.textContent='El ingreso debe ser anterior a las evaluaciones y todas deben quedar dentro de las 12 horas del gráfico.';return;}msg.textContent='';render()});
$('atendio').placeholder='Nombre del profesional que atendió';
$('reset').onclick=()=>{if(!confirm('¿Borrar todos los datos de esta demostración?'))return;entries=[];document.querySelectorAll('#profile input,#profile select,#profile textarea,#evaluation input,#evaluation textarea').forEach(el=>el.value='');$('d').value='4';$('descenso').value='No evaluado';$('message').textContent='';render()};$('print').onclick=()=>window.print();render();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
