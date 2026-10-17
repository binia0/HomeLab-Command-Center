import type {Device,Port} from '../scene';
export type Template={id:string;name:string;manufacturer:string;model:string;category:string;color:string;ports:Port[];imageData?:string};
const jack=(name:string,type:string,x:number,y=0):Port=>({id:name,type,x,y,z:-1});
export const starterTemplates:Template[]=[
{id:'rpi3',name:'Raspberry Pi 3 B+',manufacturer:'Raspberry Pi',model:'3 Model B+',category:'sbc',color:'#236044',ports:[jack('eth0','RJ45',.29),jack('usb1','USB-A',.08),jack('usb2','USB-A',-.08),jack('power','POWER',-.3)]},
{id:'rpi5',name:'Raspberry Pi 5',manufacturer:'Raspberry Pi',model:'5',category:'sbc',color:'#277a5b',ports:[jack('eth0','RJ45',.3),jack('usb1','USB-A',.12),jack('usb2','USB-A',-.06),jack('power','USB-C',-.3)]},
{id:'jetson-orin',name:'NVIDIA Jetson Orin Nano',manufacturer:'NVIDIA',model:'Jetson Orin Nano Developer Kit',category:'ai',color:'#384b36',ports:[jack('eth0','RJ45',.25),jack('usb1','USB-A',.05),jack('usb2','USB-A',-.12),jack('power','POWER',-.31)]},
{id:'jetkvm',name:'JetKVM',manufacturer:'JetKVM',model:'JetKVM',category:'kvm',color:'#38404c',ports:[jack('lan','RJ45',.2),jack('hdmi','HDMI',-.1),jack('power','USB-C',-.3)]},
{id:'display',name:'Rack Display',manufacturer:'Custom',model:'LCD / Touchscreen',category:'display',color:'#2c4355',ports:[jack('hdmi','HDMI',-.15),jack('power','USB-C',.23)]},
{id:'switch8',name:'8-Port Ethernet Switch',manufacturer:'Generic',model:'8-Port Switch',category:'switch',color:'#243d4a',ports:Array.from({length:8},(_,i)=>jack('lan'+(i+1),'RJ45',-.40+i*.11))}
];
export function instantiateTemplate(t:Template,u=1):Device{return{id:'device-'+crypto.randomUUID(),name:t.name,u,height:1,color:t.color,mount:'front',category:t.category,manufacturer:t.manufacturer,model:t.model,templateId:t.id,imageData:t.imageData,ports:t.ports.map(p=>({...p}))}}
export function loadTemplates():Template[]{try{const raw=localStorage.getItem('hcc-device-templates-v1');const parsed=raw?JSON.parse(raw):[];return [...starterTemplates,...(Array.isArray(parsed)?parsed:[])].filter(v=>v&&typeof v.id==='string'&&typeof v.name==='string')}catch{return [...starterTemplates]}}
export function saveCustomTemplate(template:Template){const custom=loadTemplates().filter(t=>!starterTemplates.some(s=>s.id===t.id));localStorage.setItem('hcc-device-templates-v1',JSON.stringify([...custom,template]))}
