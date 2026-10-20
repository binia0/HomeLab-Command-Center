import {addRackPresentation} from './3d/RackPresentation';
import {buildRackInterior} from './3d/RackInterior';
import {renderLcdPi} from './3d/LcdPiAssembly';
import {routeRackCable,softenCablePath} from './3d/CableRouter';
import {builtInNas} from './3d/built-in-nas';
import {loadModelAsset,saveModelAsset,deleteModelAsset} from './lib/model-assets';
import {renderSingleBoardComputer} from './3d/SingleBoardComputer';
import {renderPiCluster} from './3d/PiCluster';
import {drawEquipmentDetail} from './3d/DeviceDetails';
import {addPrecisionRackFixtures} from './3d/RackDetails';
import {CameraController} from './3d/CameraController';
import{Engine,Scene,ArcRotateCamera,Vector3,Color3,Color4,HemisphericLight,DirectionalLight,MeshBuilder,PBRMaterial,TransformNode,PointerEventTypes,SceneLoader,StandardMaterial,Mesh,Texture,GlowLayer,ShadowGenerator,Matrix}from'@babylonjs/core';import'@babylonjs/loaders/glTF';
export type Width=10|19;export type Face='front'|'back'|'orbit';export type Port={id:string;type:string;x:number;y:number;z:number};export type Slot={id:string;name:string;model:string;ip:string;occupied:boolean;deviceIds?:string[];offsetXmm?:number;offsetYmm?:number;rotationDeg?:number;scale?:number};export type DeviceDisplay={id:string;name:string;kind:'lcd'|'oled'|'touch'|'monitor';widthMm:number;heightMm:number;offsetXmm:number;offsetYmm:number;connection:'HDMI'|'USB'|'DSI'|'SPI'|'I2C'|'OTHER'};export type Device={id:string;name:string;u:number;height:number;color:string;mount?:'front'|'rear';category?:string;manufacturer?:string;model?:string;ip?:string;slots?:Slot[];slotColumns?:number;displays?:DeviceDisplay[];imageData?:string;rearImageData?:string;leftImageData?:string;rightImageData?:string;templateId?:string;widthMm?:number;depthMm?:number;rotationX?:number;rotationY?:number;rotationZ?:number;modelFileName?:string;hostDeviceId?:string;panelId?:string;slotId?:string;ports:Port[]};export type Config={width:Width;units:number;depthMm?:number;devices:Device[]};
export const U=.04445;
/** One coordinate mapping for visible sockets and cable attachments. */
function connectorPosition(port:Port,width:number,height:number,depth:number):Vector3{
 const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
 const x=clamp(port.x,-1,1)*width*.435;
 const y=clamp(port.y,-1,1)*height*.37;
 // Negative Z is the visible face; positive Z places a socket on the back of the chassis.
 const normalizedZ=clamp(port.z??-1,-1,1);
 const z=-.105+((normalizedZ+1)/2)*(depth+.080);
 return new Vector3(x,y,z);
}
export const spacing=(w:Width)=>w===10?.254:.4826;const group=(n:number):Port[]=>Array.from({length:n},(_,i)=>({id:String(i+1),type:'RJ45',x:-.43+i*(.86/Math.max(n-1,1)),y:0,z:-1}));
export const demo:Config={width:10,units:20,devices:[{id:'router',name:'NETWORK GATEWAY',u:19,height:1,color:'#365969',ports:group(4)},{id:'switch1',name:'MANAGED SWITCH 01',u:17,height:1,color:'#253a42',ports:group(8)},{id:'switch2',name:'MANAGED SWITCH 02',u:16,height:1,color:'#253a42',ports:group(8)},{id:'switch3',name:'MANAGED SWITCH 03',u:15,height:1,color:'#253a42',ports:group(8)},{id:'patch',name:'12-PORT PATCH PANEL',u:13,height:1,color:'#334850',ports:group(12)},{id:'pis',name:'8 VERTICAL PI SLOTS',u:10,height:2,color:'#23504c',category:'holder',slots:Array.from({length:8},(_,i)=>({id:'slot-'+(i+1),name:'Pi '+(i+1),model:'',ip:'',occupied:i<4})),ports:[]},{id:'jetson',name:'2 JETSON SLOTS',u:7,height:2,color:'#345765',ports:[]},{id:'kvm',name:'2 JETKVM SLOTS',u:5,height:1,color:'#3e4c57',ports:[]},{id:'nas',name:'STORAGE ARRAY',u:1,height:3,color:'#364653',ports:[]}]};
export const initial:Config={width:10,units:20,depthMm:600,devices:[]};
const color=(s:string)=>Color3.FromHexString(s);
export function build(canvas:HTMLCanvasElement,config:Config,onDevice:(id:string)=>void,onPort:(a:string)=>void,onPlacePort?:(id:string,port:string,x:number,y:number,z:number)=>void){const eng=new Engine(canvas,true);eng.setHardwareScalingLevel(Math.min(2,Math.max(1,devicePixelRatio/1.5)));const scene=new Scene(eng);const illumination=new GlowLayer('LED and cable bloom',scene,{blurKernelSize:24});illumination.intensity=.34;scene.clearColor=new Color4(.016,.024,.036,1);const cam=new ArcRotateCamera('camera',-Math.PI/2+.17,Math.PI/2.08,1.72,new Vector3(0,.4,0),scene);cam.attachControl(canvas,true);cam.lowerRadiusLimit=.4;cam.upperRadiusLimit=6;cam.wheelPrecision=60;cam.minZ=.01;const cameraControl=new CameraController(cam);const onManualCamera=()=>cameraControl.cancel();canvas.addEventListener('wheel',onManualCamera,{passive:true});canvas.addEventListener('pointerdown',onManualCamera);
const hemi=new HemisphericLight('soft ambient',new Vector3(0,1,0),scene);hemi.intensity=.83;
const light=new DirectionalLight('large key',new Vector3(-.7,-1,.9),scene);light.intensity=1.8;light.diffuse=color('#dcecff');const rackShadows=new ShadowGenerator(1024,light);rackShadows.usePercentageCloserFiltering=true;rackShadows.bias=.0008;
const rim=new DirectionalLight('edge rim',new Vector3(.8,-.4,-.7),scene);rim.intensity=.66;rim.diffuse=color('#459afa');
const material=(n:string,c:string)=>{const m=new PBRMaterial(n,scene);m.albedoColor=color(c);m.metallic=.75;m.roughness=.31;return m};const black=material('dark','#080d0c'),steel=material('steel','#202c3a'),accent=material('accent','#1475c6'),shadow=material('recess','#020604'),titanium=material('titanium','#596c81'),screw=material('screw','#98a8ba');let hasFramedRack=false;let rack:TransformNode|null=null;let instances=new Map<string,TransformNode>();let cfg=config;
const mk=(n:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial,parent:TransformNode,id?:string,port?:string)=>{const b=MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.material=mat;b.parent=parent;b.receiveShadows=true;if(/^(enclosure body|top frame|bottom frame|front steel rail|rear steel rail|side panel|plinth|chassis handle)/.test(n))rackShadows.addShadowCaster(b);if(id)b.metadata={id,port};return b};
function redraw(c:Config){cfg=c;if(rack)rack.dispose(false,true);for(const mesh of cableMeshes)mesh.dispose();cableMeshes=[];rack=new TransformNode('rack',scene);instances=new Map();const W=spacing(c.width),H=c.units*U,D=Math.max(.25,Math.min(1.5,(c.depthMm??(c.width===10?450:800))/1000)),x=W/2+.024;
const floorMat=material('matte showroom floor','#202b35');floorMat.metallic=.18;floorMat.roughness=.88;

mk('plinth',W+.17,.038,D+.12,0,-.031,0,steel,rack);mk('plinth insert',W+.12,.008,D+.08,0,-.008,0,black,rack);
for(const s of [-1,1]){mk('front steel rail',.032,H,.038,s*x,H/2,-D/2,steel,rack);mk('rear steel rail',.032,H,.038,s*x,H/2,D/2,steel,rack);mk('side frame upper spar',.016,.020,D,s*(x+.025),H-.032,0,steel,rack);mk('side frame lower spar',.016,.020,D,s*(x+.025),.032,0,steel,rack);mk('edge glow',.004,H*.95,.008,s*(x+.038),H/2,-D/2-.021,accent,rack);mk('machined edge',.006,H,.015,s*(x+.034),H/2,-D/2-.011,titanium,rack);for(let i=0;i<c.units;i++){const sy=(i+.5)*U;mk('mount hole front '+i,.008,.008,.004,s*x,sy,-D/2-.023,shadow,rack);mk('mount screw front '+i,.0035,.0035,.005,s*x,sy,-D/2-.027,screw,rack);mk('mount hole back '+i,.008,.008,.004,s*x,sy,D/2+.024,shadow,rack)}for(let j=0;j<13;j++){const sy=(j+.5)*H/13;mk('vent'+j,.002,.018,D*.43,s*(x+.033),sy,0,steel,rack)}}
/* Visible depth supports, cable management channels and crossbars — real geometry. */
for(const side of [-1,1]){mk('vertical cable duct '+side,.026,H*.95,.043,side*(W/2+.073),H/2,0,steel,rack);for(let i=0;i<Math.max(5,c.units);i++){const yy=(i+.5)*H/Math.max(5,c.units);mk('cable duct opening '+side+' '+i,.010,.010,.046,side*(W/2+.073),yy,0,shadow,rack)}}
for(const level of [0,Math.floor(c.units/2),c.units]){const yy=level*U;mk('rear structural crossmember '+level,W+.10,.012,.035,0,yy,D/2-.032,titanium,rack)}
/* Powder-coated perforated rack enclosure, crossbraces, four feet and shelves. */
for(const side of [-1,1]){for(let k=0;k<4;k++){const y=H*(.12+k*.245);mk('brace mounting '+side+' '+k,.018,.014,D*.66,side*(W/2+.035),y,0,titanium,rack)}}
for(const side of [-1,1])for(const depth of [-1,1])mk('rack leveling foot '+side+' '+depth,.046,.042,.046,side*W*.38,-.065,depth*D*.39,black,rack);
for(let k=0;k<c.units;k+=2){const yy=k*U+.007;mk('fine engraved unit guide '+k,.002,.003,.006,-W/2-.046,yy,-D/2-.032,screw,rack)}
mk('top frame',W+.14,.031,D+.09,0,H+.012,0,steel,rack);mk('roof inlay',W+.105,.005,D+.05,0,H+.031,0,shadow,rack);mk('bottom frame',W+.12,.023,D+.05,0,0,0,steel,rack);addPrecisionRackFixtures(scene,rack,W,H,D,c.units);addRackPresentation(scene,rack,W,H,D,c.units);buildRackInterior(scene,rack,W,H,D,c.devices.map(d=>({u:d.u,height:d.height})));/* Open back: no rear panel hiding rear-mounted modules. */
for(const d of c.devices){
 // Existing saved racks often predate category support. Detect their hardware visually.
 const identity=(d.name+' '+(d.model||'')+' '+(d.manufacturer||'')).toLowerCase();
 const hasPiChildren=c.devices.some(child=>(child.panelId===d.id||child.hostDeviceId===d.id)&&(child.category==='sbc'||/raspberry|\bpi\s*[345]\b/i.test(child.name)));
 const holderIsPi=/raspberry|\bpi\b|\brpi\b|sbc/i.test(identity);
 const visualCategory=d.category==='holder'&&(hasPiChildren||(holderIsPi&&d.slots?.some(slot=>slot.occupied)))?'pi-cluster':d.category&&d.category!=='other'?d.category:
 /switch|network|ethernet/.test(identity)?'switch':
 /synology|nas|storage/.test(identity)?'storage':
 /ups|cyberpower|battery/.test(identity)?'power':
 /dell|server|poweredge/.test(identity)?'server':
 /raspberry|\bpi cluster\b|\bpi rack\b/.test(identity)?'pi-cluster':d.category;
 const h=d.height*U-.006,y=(d.u-1)*U+h/2+.008;if(y>H||y<0)continue;const root=new TransformNode('device '+d.id,scene);const isRear=d.mount==='rear';const host=d.hostDeviceId?c.devices.find(item=>item.id===d.hostDeviceId):undefined;const panel=d.panelId?c.devices.find(item=>item.id===d.panelId):undefined;const attachedSlot=panel?.slots?.find(slot=>slot.id===d.slotId);const slotIndex=attachedSlot&&panel?.slots?panel.slots.indexOf(attachedSlot):-1;const cols=panel?.slots?.length?Math.max(1,Math.min(panel.slots.length,panel.slotColumns||panel.slots.length)):1;const rows=panel?.slots?.length?Math.ceil(panel.slots.length/cols):1;const slotCol=slotIndex>=0?slotIndex%cols:0,slotRow=slotIndex>=0?Math.floor(slotIndex/cols):0;const panelHeight=panel?(panel.height*U-.006):h;const slotX=panel&&attachedSlot?(-W*.4+(slotCol+.5)*W*.8/cols+(attachedSlot.offsetXmm||0)/1000):0;const slotY=panel&&attachedSlot?((panel.u-1)*U+panelHeight/2+.008+panelHeight*.38-(slotRow+.5)*panelHeight*.76/rows+(attachedSlot.offsetYmm||0)/1000):y;const hostY=host?(host.u-1)*U+(host.height*U-.006)/2+.008:y;const piHost=!!host&&d.category==='sbc'&&(host.category==='holder'||/raspberry|\bpi\b|sbc/i.test(host.name));
const hostSiblings=piHost?c.devices.filter(item=>item.hostDeviceId===host!.id&&item.category==='sbc'&&!item.panelId):[];
const hostIndex=hostSiblings.findIndex(item=>item.id===d.id);
const hostX=piHost&&hostIndex>=0?(-W*.37+(hostIndex+.5)*W*.74/Math.max(1,hostSiblings.length)):0;
const faceOffset=host&&d.category==='display'?.12:0;
root.position.set(panel&&attachedSlot?slotX:hostX,panel&&attachedSlot?slotY:(host?hostY:y),isRear?D/2+.01+faceOffset:-D/2-.01-faceOffset);
// Inset real equipment into the cage, not as overlapping front-facing full-width panels.
// For slot-mounted hardware, shrink the entire local assembly to the actual slot opening.
if(panel&&attachedSlot){
 const widthFactor=Math.max(.07,Math.min(1,(W*.8/cols-.008)/(W+.062)));
 const heightFactor=Math.max(.07,Math.min(1,(panelHeight*.76/rows-.006)/Math.max(h,.01)));
 root.scaling.set(widthFactor,heightFactor,1);
 root.position.z+=isRear?-.13:.13;
}else if(visualCategory==='pi-cluster'||piHost){
 // Recess Pi holder and individual edge-mounted Pi boards into the cage.
 root.position.z+=isRear?-.12:.12;
}
root.rotation.set((d.rotationX||0)*Math.PI/180,(isRear?Math.PI:0)+(d.rotationY||0)*Math.PI/180,(d.rotationZ||0)*Math.PI/180);root.parent=rack;root.metadata={id:d.id};instances.set(d.id,root);const face=material('face '+d.id,d.color);/* Full-depth equipment chassis with vents, handles and mounting details. */
const enclosureDepth=Math.min(D-.05,Math.max(.035,(d.depthMm??(d.category==='server'?650:d.category==='storage'?450:180))/1000));const sideBody=material('chassis '+d.id,'#273744');
if(!['sbc','display','lcd-pi','pi-cluster'].includes(visualCategory||'')&&!d.hostDeviceId)mk('enclosure body '+d.id,Math.min(W*.88,(d.widthMm||W*880)/1000),h*.83,enclosureDepth,0,0,enclosureDepth*.5+.005,sideBody,root,d.id);
if(!['sbc','display','lcd-pi','pi-cluster'].includes(visualCategory||'')&&!d.hostDeviceId)for(const side of [-1,1]){mk('chassis handle '+side+' '+d.id,.012,Math.max(.012,h*.42),.022,side*W*.37,0,-.045,titanium,root,d.id)}
if(d.category==='sbc'&&!d.slots?.length&&!host&&!panel){
  mk('open single board computer mounting tray',W*.57,h*.86,.008,0,0,-.023,steel,root,d.id);
  for(const side of [-1,1]){mk('SBC side mounting rail',.009,h*.9,.026,side*W*.30,0,-.028,titanium,root,d.id)}
  mk('mounting tray lower lip',W*.6,.006,.02,0,-h*.43,-.033,steel,root,d.id);
}else{if(!['display','lcd-pi','pi-cluster'].includes(visualCategory||'')&&!host&&!panel){
  // Equipment-specific front faces must stay uncovered by the formerly opaque rack slab.
  const showOriginalFront=!['switch','network','storage','server','power'].includes(visualCategory||'');
  if(showOriginalFront){mk(d.name,W+.062,h,.022,0,0,.010,face,root,d.id);mk('front',W+.052,h-.008,.003,0,0,-.003,black,root,d.id)}
  else{
   mk('recessed equipment chassis '+d.id,W*.92,h*.88,.023,0,0,.013,sideBody,root,d.id);
   mk('anodized top edge '+d.id,W*.88,.002,.015,0,h*.44,-.009,titanium,root,d.id);
   mk('anodized lower edge '+d.id,W*.88,.002,.015,0,-h*.44,-.009,titanium,root,d.id);
  }
 }if(!host&&!panel){for(const edge of [-1,1]){mk('ear '+edge,.018,h,.007,edge*(W/2+.025),0,-.034,titanium,root,d.id);mk('ear screw '+edge,.004,.004,.009,edge*(W/2+.026),0,-.04,screw,root,d.id)}mk('trim top',W*.93,.002,.004,0,h/2-.005,-.029,steel,root,d.id);mk('trim bottom',W*.93,.002,.004,0,-h/2+.005,-.029,steel,root,d.id);}
}
if(!host&&!panel)for(const sx of [-1,1]){mk('rack fastener recessed '+d.id+' '+sx,.009,.009,.004,sx*(W/2+.027),h*.29,-.042,shadow,root,d.id);mk('rack fastener head '+d.id+' '+sx,.004,.004,.006,sx*(W/2+.027),h*.29,-.048,screw,root,d.id)}

const trim=material('metal trim '+d.id,'#91a4ac');const blue=material('usb blue '+d.id,'#2264b0');const green=material('PCB '+d.id,'#216d50');const copper=material('PCB copper '+d.id,'#b68b52');const pale=material('connector '+d.id,'#a9b9bf');const tag=material('status '+d.id,'#e6c464');
if(d.category==='sbc'&&!d.slots?.length){renderSingleBoardComputer(scene,root,d.id,W,h)}
/* Perforated metal ventilation, meaningful status lights and dedicated device detail. */
if(!d.slots?.length&&!['sbc','display','lcd-pi','pi-cluster'].includes(visualCategory||'')){for(let vent=0;vent<8;vent++){const xx=-W*.28+vent*(W*.56/7);mk('machined vent '+d.id+' '+vent,.004,Math.max(.003,h*.12),.002,xx,-h*.23,-.032,shadow,root,d.id)}}
if(d.category==='switch'||d.category==='network'){mk('network status strip',W*.15,.006,.006,W*.3,h*.24,-.036,tag,root,d.id)}
for(const display of d.displays||[]){const dw=Math.max(.015,Math.min(W*.87,display.widthMm/1000));const dh=Math.max(.012,Math.min(h*.86,display.heightMm/1000));const dx=Math.max(-W*.35,Math.min(W*.35,display.offsetXmm/1000));const dy=Math.max(-h*.3,Math.min(h*.3,display.offsetYmm/1000));const bezel=material('display bezel '+display.id,'#283d48');const glass=material('display glass '+display.id,'#0e3242');glass.emissiveColor=color('#0b4c56');mk('display mount '+display.id,dw+.006,dh+.006,.008,dx,dy,-.055,bezel,root,d.id);mk('display screen '+display.id,dw,dh,.003,dx,dy,-.062,glass,root,d.id);mk('display status bar '+display.id,dw*.67,.002,.002,dx,dy+dh*.27,-.064,accent,root,d.id)}
if(d.category==='lcd-pi')renderLcdPi(scene,root,d.id,W,h);
if(visualCategory==='pi-cluster')renderPiCluster(scene,root,d.id,W,h,d.ports.filter(p=>p.type==='RJ45').slice(0,4).map(p=>p.x*W*.435),d.ports.filter(p=>p.type==='RJ45').slice(0,4).map(p=>p.id),!d.slots?.some(slot=>slot.occupied)&&!c.devices.some(child=>child.panelId===d.id||child.hostDeviceId===d.id));
const photoSurfaces=[
 ['front',d.imageData,W*.85,h*.8,0,0,-.065,0],
 ['rear',d.rearImageData,W*.85,h*.8,0,0,enclosureDepth+.028,Math.PI],
 ['left',d.leftImageData,enclosureDepth*.88,h*.77,-Math.min(W*.44,(d.widthMm||W*880)/1000/2)-.003,0,enclosureDepth*.5,Math.PI/2],
 ['right',d.rightImageData,enclosureDepth*.88,h*.77,Math.min(W*.44,(d.widthMm||W*880)/1000/2)+.003,0,enclosureDepth*.5,-Math.PI/2],
] as const;
for(const [side,url,pw,ph,px,py,pz,angle] of photoSurfaces){
 if(!url?.startsWith('data:image/'))continue;
 const surface=MeshBuilder.CreatePlane('real device '+side+' photograph '+d.id,{width:pw,height:ph,sideOrientation:Mesh.DOUBLESIDE},scene);
 surface.parent=root;surface.position.set(px,py,pz);surface.rotation.y=angle;surface.metadata={id:d.id};
 const mat=new StandardMaterial('device '+side+' photograph '+d.id,scene);
 mat.diffuseTexture=new Texture(url,scene);mat.emissiveColor=color('#434a4d');mat.backFaceCulling=false;
 surface.material=mat;
}
const led=material('led '+d.id,'#24cba7');led.emissiveColor=color('#0b7a66');mk('LED',.008,.008,.006,-W*.39,0,-.032,led,root,d.id);
for(const p of d.ports){const position=connectorPosition(p,W,h,enclosureDepth),px=position.x,py=position.y,pz=position.z;const isUsb=p.type.startsWith('USB'),isPower=p.type==='POWER',isHdmi=p.type==='HDMI'||p.type==='DisplayPort';const pw=isUsb?.012:isPower?.014:isHdmi?.019:.017,ph=isUsb?.008:isPower?.014:isHdmi?.008:.017;mk('connector rim '+p.type+' '+p.id,pw+.004,ph+.004,.009,px,py,pz,isUsb?blue:isPower?pale:trim,root,d.id,p.id);mk('connector cavity '+p.id,pw,ph,.003,px,py,pz-.006,shadow,root,d.id,p.id);if(isUsb){mk('usb contact '+p.id,pw*.65,.002,.003,px,py-.001,pz-.010,isUsb?blue:accent,root,d.id,p.id)}else if(p.type==='RJ45'){mk('rj45 tab '+p.id,pw*.45,.002,.003,px,py+ph*.28,pz-.010,steel,root,d.id,p.id)}else if(isPower){mk('power socket '+p.id,pw*.42,ph*.42,.003,px,py,pz-.011,black,root,d.id,p.id)}}
if(d.slots?.length&&visualCategory!=='pi-cluster'){const count=d.slots.length;const columns=Math.max(1,Math.min(count,d.slotColumns||count));const rows=Math.ceil(count/columns);for(let i=0;i<count;i++){const slot=d.slots[i];const col=i%columns,row=Math.floor(i/columns);const xSlot=-W*.4+(col+.5)*W*.8/columns+(slot.offsetXmm||0)/1000;const ySlot=h*.38-(row+.5)*h*.76/rows+(slot.offsetYmm||0)/1000;const slotRoot=new TransformNode('slot '+slot.id,scene);slotRoot.parent=root;slotRoot.position.set(xSlot,ySlot,0);slotRoot.rotation.z=(slot.rotationDeg||0)*Math.PI/180;mk('slot mounting rail '+i,W*.8/columns*.83,h*.8/rows*.85,.008,0,0,-.039,steel,slotRoot,d.id);if(slot.occupied){mk('slot PCB '+i,W*.7/columns,h*.64/rows,.014,0,0,-.053,green,slotRoot,d.id);mk('slot CPU '+i,W*.32/columns,h*.20/rows,.005,0,-h*.09/rows,-.063,black,slotRoot,d.id);mk('slot GPIO '+i,W*.48/columns,h*.035/rows,.005,0,h*.22/rows,-.062,copper,slotRoot,d.id)}else{mk('empty slot '+i,W*.58/columns,h*.42/rows,.004,0,0,-.051,shadow,slotRoot,d.id)}}}

if(visualCategory!=='pi-cluster')drawEquipmentDetail(scene,root,visualCategory,d.id,W,h,mk,d.ports.filter(p=>p.type==='RJ45').map(p=>p.x));

if(d.category==='ai'||d.category==='kvm')for(const s of [-1,1])mk('module',W*.34,h*.7,.012,s*W*.23,0,-.037,steel,root,d.id);
// CAD-only presentation: generated meshes are no longer represented as real devices.
// Keep editable port markers and cable anchor metadata; actual enclosure is loaded GLB.
for(const mesh of root.getChildMeshes(false)){
 if(!mesh.metadata?.port){
  mesh.isVisible=false;
  mesh.isPickable=false;
 }
}
}if(!hasFramedRack){cameraControl.home(H,D);hasFramedRack=true}}

let restoreRevision=0;
async function restoreModels(){
 const revision=++restoreRevision;
 for(const device of [...cfg.devices]){
  try{
   let asset=await loadModelAsset(device.id);
   if(!asset){try{const response=await fetch('/api/models/'+encodeURIComponent(device.id),{credentials:'same-origin'});if(response.ok){asset=await response.blob();await saveModelAsset(device.id,new File([asset],device.modelFileName||device.id+'.glb',{type:'model/gltf-binary'}))}}catch(error){console.warn('Remote GLB unavailable',error)}}
   if(!asset&&device.templateId==='rack-nas-4u')asset=await builtInNas();
   if(revision!==restoreRevision)return;
   if(asset&&instances.has(device.id)){
    const upload=new File([asset],device.modelFileName||(asset instanceof File?asset.name:device.id+'.glb'),{type:'model/gltf-binary'});
    await importGLB(upload,device.id,false);
   }
  }catch(error){console.warn('3D model restore failed',device.id,error)}
 }
}
async function importGLB(file:File,id:string,persist:boolean):Promise<'server'|'local'|'preview'>{
 const root=instances.get(id);if(!root)throw Error('No device selected');
 const url=URL.createObjectURL(file);
 try{
  const result=await SceneLoader.ImportMeshAsync('','',url,scene,undefined,'.glb');
  if(instances.get(id)!==root){for(const m of result.meshes)m.dispose();return 'preview'}
  // Re-import after redraw or model change must not pile up duplicate GLBs.
  for(const child of root.getChildren())if(child.name.startsWith('real-GLB '+id))child.dispose(false,true);
  const node=new TransformNode('real-GLB '+id,scene);node.parent=root;
  // Keep interactive port meshes visible but hide only primitive placeholder bodies.
  for(const child of root.getChildMeshes(false)){
   if(child!==node&&!child.metadata?.port&&!child.name.startsWith('real-GLB ')&&!child.name.includes(' photograph '+id)){
    // A CAD model replaces the device placeholder, never its mounting mechanics.
    const preserve=/bezel|mounting|carrier|rail|standoff|rack fastener|\bear\b|\btrim\b|telemetry screen/i.test(child.name);
    if(!preserve)child.isVisible=false;
   }
  }
  for(const mesh of result.meshes){if(!mesh.parent)mesh.parent=node;mesh.metadata={...mesh.metadata,id}}
  // Normalize models in their own local axes. Imported assets often have the
  // origin at a corner or use centimeters/millimeters instead of meters.
  // Never include connector meshes or the parent rack in these bounds.
  // CAD Pi-4/Pi-5 boards must be oriented before size fitting and centering.
  // Otherwise the model is fitted as a flat board and only rotated afterwards,
  // making its final dimensions collide with the neighbouring mounted Pis.
  const device=cfg.devices.find(d=>d.id===id);
  if(device?.category==='sbc' && /Raspberry-Pi-[45].*CAD\.glb/i.test(file.name) &&
     (device.panelId||device.hostDeviceId)){
    // STEP boards start in X/Z after CAD Z-up -> glTF Y-up conversion.
    // Rotate X into vertical Y so each board stands on its narrow edge in Y/Z.
    node.rotation.set(0,0,Math.PI/2);
  }
  node.computeWorldMatrix(true);
  const bounds=node.getHierarchyBoundingVectors(true),ext=bounds.max.subtract(bounds.min);
  // STEP tessellation creates geometry without PBR materials. Give only the
  // explicitly imported generic CAD catalog models physically plausible metal.
  // User-supplied textured GLBs keep their original materials unchanged.
  if(/^(switch-1u|server-2u|ups-3u|patch-24|cables)-CC0\.glb$/i.test(file.name)){
    const finish=new PBRMaterial('generic CAD brushed metal '+id,scene);
    finish.albedoColor=color('#344350');
    finish.metallic=.72;finish.roughness=.42;
    for(const mesh of result.meshes)if(mesh instanceof Mesh)mesh.material=finish;
  }
  if(device){
    const targetWidth=Math.min(spacing(cfg.width)*.86,(device.widthMm??spacing(cfg.width)*860)/1000);
    const targetHeight=device.height*U*.79;
    const targetDepth=Math.max(.035,Math.min((cfg.depthMm??800)/1000-.055,(device.depthMm??180)/1000));
    // Ignore zero-thickness axes (common with textured CAD board exports).
    const limits=[[ext.x,targetWidth],[ext.y,targetHeight],[ext.z,targetDepth]]
      .filter(([extent])=>extent>.00001).map(([extent,target])=>target/extent);
    if(limits.length){
      const scale=Math.min(...limits);
      const center=bounds.min.add(bounds.max).scale(.5);
      // node's own translation is used to re-center the original imported hierarchy.
      // Transform its local center into node-relative coordinates before applying scale.
      const inverse=node.getWorldMatrix().clone().invert();
      const localCenter=Vector3.TransformCoordinates(center,inverse);
      for(const child of [...node.getChildren()])if(child instanceof TransformNode)child.position.subtractInPlace(localCenter);
      node.scaling.setAll(scale);
      node.position.set(0,0,-.056);
    }
  }
  // The supplied 4U NAS asset has its detailed drive bays on local +Z.
  // Babylon's rack front points toward -Z, so face the bays toward the viewer.
  if(!persist&&device?.templateId==='rack-nas-4u')node.rotation.y=Math.PI;
  let stored:'server'|'local'|'preview'='preview';
  if(persist){
    stored='local';
    // Save a local copy regardless of login; never claim the server stored it unless confirmed.
    await saveModelAsset(id,file);
    try{
      const response=await fetch('/api/models/'+encodeURIComponent(id),{method:'POST',body:file,headers:{'Content-Type':'model/gltf-binary'},credentials:'same-origin'});
      if(response.ok)stored='server';
      else console.warn('GLB only stored in this browser; remote save returned HTTP '+response.status);
    }catch(error){console.warn('GLB only stored in this browser; remote save unavailable',error)}
  }
  return stored;
 }finally{URL.revokeObjectURL(url)}
}
let cableMeshes:Mesh[]=[];
/** Port edits must not rebuild the full rack, reload GLBs, or reset the camera. */
function updatePortPositions(next:Config){
 const old=cfg, width=spacing(next.width);
 for(const device of next.devices){
  const previous=old.devices.find(d=>d.id===device.id),root=instances.get(device.id);
  if(!previous||!root)continue;
  const h=device.height*U-.006;
  const depth=Math.min(Math.max(.25,Math.min(1.5,(next.depthMm??800)/1000))-.05,
   Math.max(.035,(device.depthMm??(device.category==='server'?650:device.category==='storage'?450:180))/1000));
  const meshes=root.getChildMeshes(false);
  for(const port of device.ports){
   const oldPort=previous.ports.find(p=>p.id===port.id);
   if(!oldPort||oldPort.x===port.x&&oldPort.y===port.y&&oldPort.z===port.z)continue;
   const shift=connectorPosition(port,width,h,depth).subtract(connectorPosition(oldPort,width,h,depth));
   if(port.type==='RJ45'){
    const carrier=scene.getTransformNodeByName('pi-port-carrier:'+device.id+':'+port.id);
    if(carrier)carrier.position.x=Math.max(-Math.min(width*.85,.415)*.44,Math.min(Math.min(width*.85,.415)*.44,port.x*width*.435));
   }
   for(const mesh of meshes){
    if(mesh.metadata?.id===device.id&&mesh.metadata?.port===port.id){
     mesh.position.addInPlace(shift);
    }
   }
  }
 }
 cfg=next;
}
function updateCables(connections:{a:string;b:string}[]){
 for(const mesh of cableMeshes)mesh.dispose();cableMeshes=[];
 const colors:{[kind:string]:string}={RJ45:'#248ee9',POWER:'#ec5a47',HDMI:'#b38cff',DisplayPort:'#b38cff','USB-C':'#33b8ee',USB:'#33b8ee'};
 const depth=Math.max(.25,Math.min(1.5,(cfg.depthMm??(cfg.width===10?450:800))/1000));
 for(const [i,link] of connections.entries()){
  const endpoint=(key:string)=>{const separator=key.indexOf('/');if(separator<0)return null;const id=key.slice(0,separator),portid=key.slice(separator+1),device=cfg.devices.find(d=>d.id===id),root=instances.get(id),port=device?.ports.find(p=>p.id===portid);if(!device||!root||!port)return null;
   root.computeWorldMatrix(true);const w=spacing(cfg.width),h=device.height*U-.006;
   const point=Vector3.TransformCoordinates(connectorPosition(port,w,h,Math.min(depth-.05,Math.max(.035,(device.depthMm??180)/1000))),root.getWorldMatrix());
   return{point,face:((device.mount==='rear')!==(port.z>0)?'rear':'front') as 'rear'|'front',type:port.type};
  };
  const a=endpoint(link.a),b=endpoint(link.b);if(!a||!b)continue;
  const routing=routeRackCable(a,b,spacing(cfg.width),depth,i%5);
  const points=softenCablePath(routing,.012);
  const material=new StandardMaterial('insulated cable '+i,scene);const shade=a.type==='RJ45'?['#178fec','#e05a4d','#35bd87','#f2b73f'][i%4]:(colors[a.type]||colors[b.type]||'#54bcd8');material.diffuseColor=color(shade);material.emissiveColor=color(shade).scale(.2);
  const tube=MeshBuilder.CreateTube('routed cable '+i,{path:points,radius:.0035,tessellation:12,cap:3},scene);tube.material=material;tube.isPickable=false;cableMeshes.push(tube);
  const plugMat=new StandardMaterial('connector shell '+i,scene);plugMat.diffuseColor=color('#23332a');
  for(const [n,end] of [a,b].entries()){
   const plug=MeshBuilder.CreateBox('cable plug '+i+'/'+n,{width:.011,height:.010,depth:.022},scene);
   plug.position.copyFrom(end.point);plug.material=plugMat;plug.isPickable=false;cableMeshes.push(plug);
  }
 }
}

let placement:{id:string;port:string;plane:Mesh}|null=null;
const stopPlacement=()=>{placement?.plane.dispose();placement=null};
const setPlacement=(id:string,port:string)=>{
 stopPlacement();
 const device=cfg.devices.find(d=>d.id===id),root=instances.get(id);
 if(!device||!root)return;
 const w=spacing(cfg.width),h=device.height*U-.006;
 const plane=MeshBuilder.CreatePlane('port placement surface '+id,{width:w*.87,height:h*.74},scene);
 plane.parent=root;plane.position.z=-.15;plane.visibility=.015;plane.isPickable=true;
 plane.metadata={id,placement:true};
 placement={id,port,plane};
};
redraw(config);void restoreModels();scene.onPointerObservable.add(e=>{if(e.type!==PointerEventTypes.POINTERDOWN)return;
 if(placement){
  const {id,port,plane}=placement;
  const deviceRoot=instances.get(id);
  const realModel=deviceRoot?.getChildren().find(child=>child.name==='real-GLB '+id);
  // Raycast the real CAD shell, not the old flat facade, when a CAD model exists.
  const cadHit=realModel?scene.pick(scene.pointerX,scene.pointerY,m=>m.isPickable&&m.isDescendantOf(realModel)):null;
  const onCad=!!cadHit?.hit&&!!cadHit.pickedPoint;
  const hit=onCad?cadHit:scene.pick(scene.pointerX,scene.pointerY,m=>m===plane);
  if(hit?.hit&&hit.pickedPoint){
   const device=cfg.devices.find(d=>d.id===id);
   const w=spacing(cfg.width),h=(device?.height||1)*U-.006;
   const depth=Math.min((cfg.depthMm??800)/1000-.05,Math.max(.035,(device?.depthMm??180)/1000));
   const inverse=plane.parent!.getWorldMatrix().clone().invert();
   const local=Vector3.TransformCoordinates(hit.pickedPoint,inverse);
   const x=Math.max(-1,Math.min(1,local.x/(w*.435)));
   const y=Math.max(-1,Math.min(1,local.y/(h*.37)));
   const z=onCad?Math.max(-1,Math.min(1,2*(local.z+.105)/(depth+.080)-1)):-1;
   stopPlacement();onPlacePort?.(id,port,Math.round(x*1000)/1000,Math.round(y*1000)/1000,Math.round(z*1000)/1000);
   return;
  }
  return;
 }
 let m=e.pickInfo?.pickedMesh;while(m){if(m.metadata?.id){if(m.metadata.port)onPort(m.metadata.id+'/'+m.metadata.port);else onDevice(m.metadata.id);return}m=m.parent as typeof m}},PointerEventTypes.POINTERDOWN);eng.runRenderLoop(()=>{cameraControl.tick();scene.render()});const resize=()=>eng.resize();window.addEventListener('resize',resize);
return{setPlacement,stopPlacement,updatePortPositions,redraw(c:Config){stopPlacement();redraw(c);void restoreModels()},updateCables,focus(id:string){const node=instances.get(id);if(!node)return;const dev=cfg.devices.find(d=>d.id===id);cameraControl.focus(node.getAbsolutePosition(),Math.max(.35,Math.min(1.05,(dev?.height||1)*U*4+.3)),dev?.mount==='rear'?'back':'front')},home(){cameraControl.home(cfg.units*U,(cfg.depthMm??800)/1000)},view(f:Face){cameraControl.view(f)},async load(file:File,id:string){
 if(!/\.glb$/i.test(file.name)||file.size<20)throw Error('Bitte eine gültige .glb-Datei auswählen.');
 if(file.size>50*1024*1024)throw Error('Das Modell darf höchstens 50 MB groß sein.');
 const signature=new Uint8Array(await file.slice(0,4).arrayBuffer());
 if(signature[0]!==103||signature[1]!==108||signature[2]!==84||signature[3]!==70)
  throw Error('Keine gültige binäre GLB-Datei (glTF-Kennung fehlt).');
 return await importGLB(file,id,true);
},async removeModel(id:string){
 await deleteModelAsset(id);
 try{await fetch('/api/models/'+encodeURIComponent(id),{method:'DELETE',credentials:'same-origin'})}catch{}
 redraw(cfg);void restoreModels();
},dispose(){stopPlacement();canvas.removeEventListener('wheel',onManualCamera);canvas.removeEventListener('pointerdown',onManualCamera);window.removeEventListener('resize',resize);eng.dispose()}}}
