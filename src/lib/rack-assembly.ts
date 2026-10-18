import type {Config,Device,Port} from '../scene';
export type AssemblyResult={ok:true;device:Device}|{ok:false;error:string};
export function createLcdPiAssembly(config:Config,nameRaw:string,id:string):AssemblyResult{
 const name=nameRaw.trim()||'LCD + Raspberry Pi';
 const height=2;
 if(config.units<height)return{ok:false,error:'Rack ist zu klein: mindestens 2U erforderlich.'};
 // Rack positions are inclusive, U1 is at the bottom. Integrated hardware occupies one device slot.
 const existing=config.devices.filter(d=>!d.hostDeviceId);
 let u=0;
 for(let candidate=1;candidate<=config.units-height+1;candidate++){
  const blocked=existing.some(d=>candidate<=d.u+d.height-1&&candidate+height-1>=d.u);
  if(!blocked){u=candidate;break}
 }
 if(!u)return{ok:false,error:'Kein freier 2U-Platz vorhanden. Rackhöhe erhöhen oder Platz schaffen.'};
 const ports:Port[]=[
  {id:'eth0',type:'RJ45',x:.20,y:-.12,z:-1},
  {id:'power',type:'USB-C',x:-.20,y:-.12,z:-1}
 ];
 return{ok:true,device:{id,name,u,height,category:'lcd-pi',manufacturer:'Raspberry Pi',model:'LCD + Raspberry Pi (integriert)',mount:'front',widthMm:195,depthMm:95,color:'#183629',ports}};
}
export function validateConnection(config:Config,links:{a:string;b:string}[],from:string,to:string):string|null{
 const find=(key:string)=>{const p=key.lastIndexOf('/');if(p<=0)return null;const d=config.devices.find(d=>d.id===key.slice(0,p));const port=d?.ports.find(pt=>pt.id===key.slice(p+1));return port?{device:d!,port}:null};
 const a=find(from),b=find(to);
 if(!a||!b)return'Anschluss ist nicht mehr vorhanden.';
 if(a.device.id===b.device.id)return'Verbindung mit demselben Gerät nicht erlaubt.';
 if(a.port.type!==b.port.type)return'Anschlusstypen sind nicht kompatibel: '+a.port.type+' / '+b.port.type;
 if(links.some(x=>x.a===from||x.b===from||x.a===to||x.b===to))return'Mindestens ein Anschluss ist schon belegt.';
 return null;
}
