import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Home,Search,LayoutDashboard,Server,Cable,Network,MapPin,Zap,Activity,Settings,Bell,Sun,RotateCcw,ChevronDown} from 'lucide-react';
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
const menus=[['Building',Server],['3D Rack',LayoutDashboard],['Dashboard',Home],['Geräte',Server],['Kabel',Cable],['Netzwerk',Network],['IP-Management',Network],['Standorte',MapPin],['Energie',Zap],['Monitoring',Activity],['Einstellungen',Settings]] as const;
function App(){
 const [selected,setSelected]=useState('pis'),[section,setSection]=useState('3D Rack'),[tab,setTab]=useState('Übersicht'),[zoom,setZoom]=useState(100),[view,setView]=useState('Vorne'),[query,setQuery]=useState(''),[angle,setAngle]=useState(0),[cableStart,setCableStart]=useState<string|null>(null),[connections,setConnections]=useState<[string,string][]>([]);
 const [items]=useState<Item[]>([]);
 const current=items.find(x=>x.id===selected);
 const filtered=items.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));
 const wheel=(event:React.WheelEvent)=>{event.preventDefault();setZoom(z=>Math.max(60,Math.min(240,z+(event.deltaY>0?-8:8))))};
 return <div className="visual-shell">
 <header className="v-header"><div className="v-brand"><Home size={29}/><span>HomeLab Command <b>Center</b></span></div><label className="v-search"><Search size={17}/><input placeholder="Geräte, IPs oder Tags suchen..." value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="v-icon" title="Darstellung"><Sun size={22}/></button><button className="v-icon" title="Benachrichtigungen"><Bell size={20}/></button><button className="v-admin">● admin <ChevronDown size={15}/></button></header>
 <aside className="v-left"><nav>{menus.map(([name,Icon])=><button key={name} className={section===name?'active':''} onClick={()=>setSection(name)}><Icon size={20}/>{name}</button>)}</nav><div className="v-sidebottom"><div>Rack-Ansicht</div><div className="v-viewgrid">{['Vorne','Hinten','Links','Rechts'].map(v=><button key={v} className={view===v?'active':''} onClick={()=>setView(v)}>{v}</button>)}</div><div className="v-zoomtitle"><span>Zoom</span><button title="Zoom zurücksetzen" onClick={()=>setZoom(100)}><RotateCcw size={16}/></button></div><input aria-label="Zoom" type="range" min="60" max="240" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><small>{zoom}%</small><button className="v-old" onClick={()=>{setSection(section==='Building'?'3D Rack':'Building');setView('Vorne')}}>{section==='Building'?'Hauptansicht':'Building öffnen'}</button></div></aside>
 <main className="v-center">{(section==='3D Rack'||section==='Building')?<div className="v-stage" onWheel={wheel}>
 <div className="v-stage-top"><span>RACK 1 / {section==='Building'?'BUILDING':'HAUPTANSICHT'} / {view.toUpperCase()}</span><span>42 HE · {section==='Building'?'VERKABELUNG & MONTAGE':'RACK ÜBERSICHT'}</span></div>
 <div className="v-rack-viewport"><div className="v-rack-scale" style={{transform:'scale('+zoom/100+') rotateY('+(section==='Building'?angle:0)+'deg)'}}>
 <div className={'v-rack '+(view==='Hinten'?'rear':'')}>
 <div className="v-rack-cap"><span>HOMELAB</span><span>42 U</span></div>
 <div className="v-rack-interior">
 <div className="v-rack-rail left">{Array.from({length:42},(_,i)=><span key={i}/>)}</div>
 <div className="v-rack-units">{Array.from({length:42},(_,i)=><span key={i}>{42-i}</span>)}</div>
 <div className="v-rack-bays">
 {Array.from({length:42},(_,i)=><div key={i} className="v-unit-guide"/>)}
 <div className="v-empty-rack-back"><div className="v-rear-top-beam"/><div className="v-rear-braces"><span/><span/></div><div className="v-rear-floor"/><div className="v-empty-rack-label">42U · 19″ · LEERES RACK</div></div>
 </div><div className="v-rack-rail right">{Array.from({length:42},(_,i)=><span key={i}/>)}</div>
 </div><div className="v-rack-base"><span/><span/></div>
 </div></div></div>
 <div className="v-overlay">{section==='Building'?<><button onClick={()=>setAngle(a=>a===0?-24:0)}>Drehen / Front</button><button onClick={()=>setView(v=>v==='Vorne'?'Hinten':'Vorne')}>Front / Rückseite</button><button onClick={()=>{if(!cableStart)setCableStart(selected);else if(cableStart!==selected){setConnections(c=>[...c,[cableStart,selected]]);setCableStart(null)}else setCableStart(null)}}>{cableStart?'Zielgerät auswählen, dann verbinden':'Kabel von ausgewähltem Gerät'}</button><span>Building-Vorschau · Anschlusspunkte folgen</span></>:<><button onClick={()=>setSection('Building')}>Building öffnen · Rückseite & Kabel</button><span>Interaktive Rack-Frontansicht</span></>}</div>
 </div>:<div className="v-placeholder"><h2>{section}</h2><p>Geräte- und Netzwerkfunktionen werden später mit den echten Rackdaten verbunden.</p><button onClick={()=>setSection('3D Rack')}>Zur Rackansicht</button></div>}</main>
 <aside className="v-right"><h3>Gerätedetails</h3><div className="v-device"><div className="v-devicepic"><Server size={34}/></div><div><strong>{current?.name||'Kein Gerät eingebaut'}</strong><p>Rack bereit zur Bestückung</p><small>Position: {current?.u||'—'} U</small></div></div><div className="v-tabs">{['Übersicht','Netzwerk','Hardware','Kabel'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div><div className="v-panel">{tab==='Übersicht'?<dl>{[['Name',current.name],['Typ',current.kind],['IP-Adresse',current.ip||'Nicht hinterlegt'],['Standort','Rack 1'],['Höheneinheit',current.u+' U'],['Anschlüsse',String(current.ports)]].map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>:<p>{tab} wird mit realen Gerätedaten angebunden. Keine erfundenen Live-Werte.</p>}</div><div className="v-panel"><h3>Geräte im Rack · 0</h3><p>Das Rack ist leer. Geräte und Kabel werden später im Building eingesetzt.</p>{filtered.map(x=><button className={'v-device-row '+(selected===x.id?'active':'')} key={x.id} onClick={()=>setSelected(x.id)}><span>{x.name}</span><small>U{x.u}</small></button>)}</div><div className="v-panel v-monitor"><h3>Live-Monitoring</h3><p>Messwerte erst nach Verbindung mit der vorhandenen API.</p><div className="v-gauges">{['CPU','RAM','Temp','Power'].map(t=><span key={t}><i>—</i><small>{t}</small></span>)}</div></div></aside>
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
