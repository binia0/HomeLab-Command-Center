import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Home,Search,LayoutDashboard,Server,Cable,Network,MapPin,Zap,Activity,Settings,Bell,Sun,RotateCcw,ImagePlus,ZoomIn,ChevronDown} from 'lucide-react';
import './visual.css';
type Item={id:string;name:string;u:number;kind:string;ports:number;ip?:string};
const samples:Item[]=[
{id:'sw1',name:'TP-Link Core Switch',u:39,kind:'Netzwerk',ports:24},
{id:'sw2',name:'UniFi Network Switch',u:33,kind:'Netzwerk',ports:24},
{id:'pis',name:'4 Raspberry Pi 4 + Display',u:24,kind:'Raspberry Pi',ports:12,ip:'192.168.1.50'},
{id:'server',name:'Dell Rackserver',u:14,kind:'Server',ports:4},
{id:'nas',name:'Synology NAS',u:9,kind:'Storage',ports:2},
{id:'ups',name:'CyberPower USV',u:3,kind:'Strom',ports:2}
];
const menus=[['3D Rack',LayoutDashboard],['Dashboard',Home],['Geräte',Server],['Kabel',Cable],['Netzwerk',Network],['IP-Management',Network],['Standorte',MapPin],['Energie',Zap],['Monitoring',Activity],['Einstellungen',Settings]] as const;
function App(){
 const [selected,setSelected]=useState('pis'),[section,setSection]=useState('3D Rack'),[tab,setTab]=useState('Übersicht'),[zoom,setZoom]=useState(100),[view,setView]=useState('Vorne'),[query,setQuery]=useState(''),[img,setImg]=useState<string|null>(null);
 const upload=useRef<HTMLInputElement>(null);
 const [items,setItems]=useState<Item[]>(samples);
 useEffect(()=>{try{const saved=localStorage.getItem('hcc-visual-image');if(saved)setImg(saved)}catch{}},[]);
 const current=items.find(x=>x.id===selected)||items[0];
 const filtered=items.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));
 const loadImage=(file?:File)=>{if(!file)return;if(!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{const data=String(reader.result);setImg(data);try{localStorage.setItem('hcc-visual-image',data)}catch{}};reader.readAsDataURL(file)};
 const wheel=(event:React.WheelEvent)=>{event.preventDefault();setZoom(z=>Math.max(60,Math.min(240,z+(event.deltaY>0?-8:8))))};
 return <div className="visual-shell">
 <header className="v-header"><div className="v-brand"><Home size={29}/><span>HomeLab Command <b>Center</b></span></div><label className="v-search"><Search size={17}/><input placeholder="Geräte, IPs oder Tags suchen..." value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="v-icon" title="Darstellung"><Sun size={22}/></button><button className="v-icon" title="Benachrichtigungen"><Bell size={20}/></button><button className="v-admin">● admin <ChevronDown size={15}/></button></header>
 <aside className="v-left"><nav>{menus.map(([name,Icon])=><button key={name} className={section===name?'active':''} onClick={()=>setSection(name)}><Icon size={20}/>{name}</button>)}</nav><div className="v-sidebottom"><div>Rack-Ansicht</div><div className="v-viewgrid">{['Vorne','Hinten','Links','Rechts'].map(v=><button key={v} className={view===v?'active':''} onClick={()=>setView(v)}>{v}</button>)}</div><div className="v-zoomtitle"><span>Zoom</span><button title="Zoom zurücksetzen" onClick={()=>setZoom(100)}><RotateCcw size={16}/></button></div><input aria-label="Zoom" type="range" min="60" max="240" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><small>{zoom}%</small><button className="v-old" onClick={()=>location.href='/'}>Bisherigen Editor öffnen</button></div></aside>
 <main className="v-center">{section==='3D Rack'?<div className="v-stage" onWheel={wheel}><div className="v-stage-top"><span>RACK 1 / {view.toUpperCase()}</span><span>VISUAL FIRST · 42 HE</span></div><div className="v-photo" style={{transform:'scale('+zoom/100+')'}}>
 {img?<img src={img} alt="Rack Referenzansicht"/>:<div className="v-noimage"><ImagePlus size={52}/><h2>Dein fotorealistisches Rack</h2><p>Die neue Ansicht übernimmt dein Referenzbild als Grundlage. Lade das Rackbild hoch; dann kannst du Geräte auswählen und die Ansicht zoomen.</p><button onClick={()=>upload.current?.click()}>Rack-Referenzbild laden</button></div>}
 {view==='Vorne'&&img&&<div className="v-hotspots">{filtered.map(x=><button key={x.id} title={x.name} className={selected===x.id?'selected':''} style={{top:(100-(x.u+1)/42*100)+'%'}} onClick={()=>{setSelected(x.id);setTab('Übersicht')}}/>)}</div>}
 </div><div className="v-overlay"><button onClick={()=>upload.current?.click()}><ImagePlus size={16}/> Rackbild ersetzen</button><span>{img?'Fotorealistische Bildansicht – freies 3D folgt':'Bildansicht vorbereiten'}</span></div><input ref={upload} type="file" accept="image/*" hidden onChange={e=>loadImage(e.target.files?.[0])}/></div>:<div className="v-placeholder"><h2>{section}</h2><p>Diese Ansicht wird nach dem visuellen Rack umgesetzt. Der alte Editor und seine Daten bleiben unverändert.</p><button onClick={()=>setSection('3D Rack')}>Zur Rackansicht</button></div>}</main>
 <aside className="v-right"><h3>Gerätedetails</h3><div className="v-device"><div className="v-devicepic"><Server size={34}/></div><div><strong>{current.name}</strong><p><span className="v-online"/> Gerät im Rack</p><small>Position: {current.u} U</small></div></div><div className="v-tabs">{['Übersicht','Netzwerk','Hardware','Kabel'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div><div className="v-panel">{tab==='Übersicht'?<dl>{[['Name',current.name],['Typ',current.kind],['IP-Adresse',current.ip||'Nicht hinterlegt'],['Standort','Rack 1'],['Höheneinheit',current.u+' U'],['Anschlüsse',String(current.ports)]].map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>:<p>{tab} wird mit realen Gerätedaten angebunden. Keine erfundenen Live-Werte.</p>}</div><div className="v-panel"><h3>Geräte im Rack</h3>{filtered.map(x=><button className={'v-device-row '+(selected===x.id?'active':'')} key={x.id} onClick={()=>setSelected(x.id)}><span>{x.name}</span><small>U{x.u}</small></button>)}</div><div className="v-panel v-monitor"><h3>Live-Monitoring</h3><p>Messwerte erst nach Verbindung mit der vorhandenen API.</p><div className="v-gauges">{['CPU','RAM','Temp','Power'].map(t=><span key={t}><i>—</i><small>{t}</small></span>)}</div></div></aside>
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
