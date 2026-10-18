import {newId} from './ids';
import type {Device,Port} from '../scene';
export type Template={id:string;name:string;manufacturer:string;model:string;category:string;color:string;ports:Port[];imageData?:string;widthMm?:number;depthMm?:number;height?:number};
const jack=(name:string,type:string,x:number,y=0):Port=>({id:name,type,x,y,z:-1});
export const starterTemplates:Template[]=[
{id:'rpi3',name:'Raspberry Pi 3 B+',manufacturer:'Raspberry Pi',model:'3 Model B+',category:'sbc',color:'#236044',ports:[jack('eth0','RJ45',.29),jack('usb1','USB-A',.08),jack('usb2','USB-A',-.08),jack('power','POWER',-.3)]},
{id:'rpi5',name:'Raspberry Pi 5',manufacturer:'Raspberry Pi',model:'5',category:'sbc',color:'#277a5b',ports:[jack('eth0','RJ45',.3),jack('usb1','USB-A',.12),jack('usb2','USB-A',-.06),jack('power','USB-C',-.3)]},
{id:'jetson-orin',name:'NVIDIA Jetson Orin Nano',manufacturer:'NVIDIA',model:'Jetson Orin Nano Developer Kit',category:'ai',color:'#384b36',ports:[jack('eth0','RJ45',.25),jack('usb1','USB-A',.05),jack('usb2','USB-A',-.12),jack('power','POWER',-.31)]},
{id:'jetkvm',name:'JetKVM',manufacturer:'JetKVM',model:'JetKVM',category:'kvm',color:'#38404c',ports:[jack('lan','RJ45',.2),jack('hdmi','HDMI',-.1),jack('power','USB-C',-.3)]},
{id:'display',name:'Rack Display',manufacturer:'Custom',model:'LCD / Touchscreen',category:'display',color:'#2c4355',ports:[jack('hdmi','HDMI',-.15),jack('power','USB-C',.23)]},
{id:'rack-server-1u',name:'1U Rackserver',manufacturer:'Custom',model:'19-inch 1U Server',category:'server',color:'#343d4a',widthMm:440,depthMm:650,height:1,ports:[jack('eth0','RJ45',.28),jack('ipmi','RJ45',.12),jack('power','POWER',-.27)]},
{id:'rack-server-2u',name:'2U Rackserver',manufacturer:'Custom',model:'19-inch 2U Server',category:'server',color:'#38414b',widthMm:440,depthMm:750,height:2,ports:[jack('eth0','RJ45',.28),jack('eth1','RJ45',.12),jack('ipmi','RJ45',-.1),jack('power','POWER',-.3)]},
{id:'rack-nas-4u',name:'4U Storage Server',manufacturer:'Custom',model:'19-inch 4U Storage',category:'storage',color:'#394652',widthMm:440,depthMm:650,height:4,ports:[jack('eth0','RJ45',.28),jack('eth1','RJ45',.12),jack('power','POWER',-.29)]},
{id:'ups-2u',name:'2U Rack UPS',manufacturer:'Custom',model:'19-inch UPS',category:'power',color:'#3d4651',widthMm:440,depthMm:500,height:2,ports:[jack('input','POWER',-.3),jack('output','POWER',.3)]},
{id:'switch8',name:'8-Port Ethernet Switch',manufacturer:'Generic',model:'8-Port Switch',category:'switch',color:'#243d4a',ports:Array.from({length:8},(_,i)=>jack('lan'+(i+1),'RJ45',-.40+i*.11))}
 ,
{id:'switch16',name:'16-Port Ethernet Switch',manufacturer:'Generic',model:'16-Port Rack Switch',category:'switch',color:'#253b48',height:1,widthMm:440,depthMm:220,ports:Array.from({length:16},(_,i)=>jack('lan'+(i+1),'RJ45',-.44+i*(.88/15)))},
{id:'switch24',name:'24-Port Ethernet Switch',manufacturer:'Generic',model:'24-Port Rack Switch',category:'switch',color:'#243d49',height:1,widthMm:440,depthMm:270,ports:Array.from({length:24},(_,i)=>jack('lan'+(i+1),'RJ45',-.44+i*(.88/23)))},
{id:'patch12',name:'12-Port Patchpanel',manufacturer:'Generic',model:'12-Port Patch Panel',category:'patch-panel',color:'#344450',height:1,ports:Array.from({length:12},(_,i)=>jack('port'+(i+1),'RJ45',-.44+i*(.88/11)))},
{id:'patch24',name:'24-Port Patchpanel 19 Zoll',manufacturer:'Generic',model:'24-Port Patch Panel',category:'patch-panel',color:'#344450',height:1,widthMm:440,depthMm:90,ports:Array.from({length:24},(_,i)=>jack('port'+(i+1),'RJ45',-.44+i*(.88/23)))},
{id:'pi-tray8',name:'8x Raspberry Pi Tray',manufacturer:'Custom',model:'8-Bay Vertical SBC Holder',category:'holder',color:'#23504c',height:2,depthMm:190,ports:[]},
{id:'jetson-tray2',name:'2x Jetson Tray',manufacturer:'Custom',model:'Dual Jetson Holder',category:'holder',color:'#345765',height:2,depthMm:210,ports:[]},
{id:'jetkvm-tray2',name:'2x JetKVM Tray',manufacturer:'Custom',model:'Dual JetKVM Holder',category:'holder',color:'#3e4c57',height:1,depthMm:150,ports:[]},
{id:'pdu-1u',name:'1U Rack PDU',manufacturer:'Generic',model:'Rack Power Distribution',category:'power',color:'#303840',height:1,widthMm:440,depthMm:110,ports:[jack('input','POWER',-.42),...Array.from({length:8},(_,i)=>jack('out'+(i+1),'POWER',-.29+i*.10))]}
];
export function instantiateTemplate(t:Template,u=1):Device{const slotCount=t.id==='pi-tray8'?8:t.id==='jetson-tray2'||t.id==='jetkvm-tray2'?2:0;const slots=slotCount?Array.from({length:slotCount},(_,i)=>({id:'slot-'+(i+1),name:'Slot '+(i+1),model:'',ip:'',occupied:false})):undefined;return{id:newId('device'),name:t.name,u,height:t.height||1,color:t.color,mount:'front',category:t.category,manufacturer:t.manufacturer,model:t.model,templateId:t.id,imageData:t.imageData,widthMm:t.widthMm,depthMm:t.depthMm,slots,slotColumns:slotCount||undefined,ports:t.ports.map(p=>({...p}))}}
export function loadTemplates():Template[]{try{const raw=localStorage.getItem('hcc-device-templates-v1');const parsed=raw?JSON.parse(raw):[];return [...starterTemplates,...(Array.isArray(parsed)?parsed:[])].filter(v=>v&&typeof v.id==='string'&&typeof v.name==='string')}catch{return [...starterTemplates]}}
export function saveCustomTemplate(template:Template){const custom=loadTemplates().filter(t=>!starterTemplates.some(s=>s.id===t.id));localStorage.setItem('hcc-device-templates-v1',JSON.stringify([...custom,template]))}
