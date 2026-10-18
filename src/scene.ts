import {addRackPresentation} from './3d/RackPresentation';
import {renderLcdPi} from './3d/LcdPiAssembly';
import {routeRackCable,softenCablePath} from './3d/CableRouter';
import {builtInNas} from './3d/built-in-nas';
import {loadModelAsset,saveModelAsset} from './lib/model-assets';
import {renderSingleBoardComputer} from './3d/SingleBoardComputer';
import {drawEquipmentDetail} from './3d/DeviceDetails';
import {addPrecisionRackFixtures} from './3d/RackDetails';
import {CameraController} from './3d/CameraController';
import{Engine,Scene,ArcRotateCamera,Vector3,Color3,Color4,HemisphericLight,DirectionalLight,MeshBuilder,PBRMaterial,TransformNode,PointerEventTypes,SceneLoader,StandardMaterial,Mesh,Texture,GlowLayer,ShadowGenerator}from'@babylonjs/core';import'@babylonjs/loaders/glTF';
export type Width=10|19;export type Face='front'|'back'|'orbit';export type Port={id:string;type:string;x:number;y:number;z:number};export type Slot={id:string;name:string;model:string;ip:string;occupied:boolean;deviceIds?:string[];offsetXmm?:number;offsetYmm?:number;rotationDeg?:number;scale?:number};export type DeviceDisplay={id:string;name:string;kind:'lcd'|'oled'|'touch'|'monitor';widthMm:number;heightMm:number;offsetXmm:number;offsetYmm:number;connection:'HDMI'|'USB'|'DSI'|'SPI'|'I2C'|'OTHER'};export type Device={id:string;name:string;u:number;height:number;color:string;mount?:'front'|'rear';category?:string;manufacturer?:string;model?:string;ip?:string;slots?:Slot[];slotColumns?:number;displays?:DeviceDisplay[];imageData?:string;templateId?:string;widthMm?:number;depthMm?:number;hostDeviceId?:string;panelId?:string;slotId?:string;ports:Port[]};export type Config={width:Width;units:number;depthMm?:number;devices:Device[]};
export const U=.04445;export const spacing=(w:Width)=>w===10?.254:.4826;const group=(n:number):Port[]=>Array.from({length:n},(_,i)=>({id:String(i+1),type:'RJ45',x:-.43+i*(.86/Math.max(n-1,1)),y:0,z:-1}));
export const demo:Config={width:10,units:20,devices:[{id:'router',name:'NETWORK GATEWAY',u:19,height:1,color:'#365969',ports:group(4)},{id:'switch1',name:'MANAGED SWITCH 01',u:17,height:1,color:'#253a42',ports:group(8)},{id:'switch2',name:'MANAGED SWITCH 02',u:16,height:1,color:'#253a42',ports:group(8)},{id:'switch3',name:'MANAGED SWITCH 03',u:15,height:1,color:'#253a42',ports:group(8)},{id:'patch',name:'12-PORT PATCH PANEL',u:13,height:1,color:'#334850',ports:group(12)},{id:'pis',name:'8 VERTICAL PI SLOTS',u:10,height:2,color:'#23504c',category:'holder',slots:Array.from({length:8},(_,i)=>({id:'slot-'+(i+1),name:'Pi '+(i+1),model:'',ip:'',occupied:i<4})),ports:[]},{id:'jetson',name:'2 JETSON SLOTS',u:7,height:2,color:'#345765',ports:[]},{id:'kvm',name:'2 JETKVM SLOTS',u:5,height:1,color:'#3e4c57',ports:[]},{id:'nas',name:'STORAGE ARRAY',u:1,height:3,color:'#364653',ports:[]}]};
export const initial:Config={width:10,units:20,depthMm:600,devices:[]};
const color=(s:string)=>Color3.FromHexString(s);
export function build(canvas:HTMLCanvasElement,config:Config,onDevice:(id:string)=>void,onPort:(a:string)=>void){const eng=new Engine(canvas,true);eng.setHardwareScalingLevel(Math.min(2,Math.max(1,devicePixelRatio/1.5)));const scene=new Scene(eng);const illumination=new GlowLayer('LED and cable bloom',scene,{blurKernelSize:24});illumination.intensity=.34;scene.clearColor=new Color4(.006,.013,.008,1);const cam=new ArcRotateCamera('camera',-Math.PI/2,Math.PI/2.12,1.72,new Vector3(0,.4,0),scene);cam.attachControl(canvas,true);cam.lowerRadiusLimit=.4;cam.upperRadiusLimit=6;cam.wheelPrecision=60;cam.minZ=.01;const cameraControl=new CameraController(cam);
const hemi=new HemisphericLight('soft ambient',new Vector3(0,1,0),scene);hemi.intensity=.72;
const light=new DirectionalLight('large key',new Vector3(-.7,-1,.9),scene);light.intensity=1.55;light.diffuse=color('#f5f9ff');const rackShadows=new ShadowGenerator(1024,light);rackShadows.usePercentageCloserFiltering=true;rackShadows.bias=.0008;
const rim=new DirectionalLight('edge rim',new Vector3(.8,-.4,-.7),scene);rim.intensity=.32;rim.diffuse=color('#c6e2f2');
const material=(n:string,c:string)=>{const m=new PBRMaterial(n,scene);m.albedoColor=color(c);m.metallic=.75;m.roughness=.31;return m};const black=material('dark','#080d0c'),steel=material('steel','#29342e'),accent=material('accent','#278849'),shadow=material('recess','#020604'),titanium=material('titanium','#576960'),screw=material('screw','#89998c');let rack:TransformNode|null=null;let instances=new Map<string,TransformNode>();let cfg=config;
const mk=(n:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial,parent:TransformNode,id?:string,port?:string)=>{const b=MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.material=mat;b.parent=parent;b.receiveShadows=true;if(/^(enclosure body|top frame|bottom frame|front steel rail|rear steel rail|side panel|plinth|chassis handle)/.test(n))rackShadows.addShadowCaster(b);if(id)b.metadata={id,port};return b};
function redraw(c:Config){cfg=c;if(rack)rack.dispose(false,true);for(const mesh of cableMeshes)mesh.dispose();cableMeshes=[];rack=new TransformNode('rack',scene);instances=new Map();const W=spacing(c.width),H=c.units*U,D=Math.max(.25,Math.min(1.5,(c.depthMm??(c.width===10?450:800))/1000)),x=W/2+.024;
mk('plinth',W+.17,.038,D+.12,0,-.031,0,steel,rack);mk('plinth insert',W+.12,.008,D+.08,0,-.008,0,black,rack);
for(const s of [-1,1]){mk('front steel rail',.032,H,.038,s*x,H/2,-D/2,steel,rack);mk('rear steel rail',.032,H,.038,s*x,H/2,D/2,steel,rack);mk('side frame upper spar',.016,.020,D,s*(x+.025),H-.032,0,steel,rack);mk('side frame lower spar',.016,.020,D,s*(x+.025),.032,0,steel,rack);mk('edge glow',.004,H*.95,.008,s*(x+.038),H/2,-D/2-.021,accent,rack);mk('machined edge',.006,H,.015,s*(x+.034),H/2,-D/2-.011,titanium,rack);for(let i=0;i<c.units;i++){const sy=(i+.5)*U;mk('mount hole front '+i,.008,.008,.004,s*x,sy,-D/2-.023,shadow,rack);mk('mount screw front '+i,.0035,.0035,.005,s*x,sy,-D/2-.027,screw,rack);mk('mount hole back '+i,.008,.008,.004,s*x,sy,D/2+.024,shadow,rack)}for(let j=0;j<13;j++){const sy=(j+.5)*H/13;mk('vent'+j,.002,.018,D*.43,s*(x+.033),sy,0,steel,rack)}}
/* Visible depth supports, cable management channels and crossbars — real geometry. */
for(const side of [-1,1]){mk('vertical cable duct '+side,.026,H*.95,.043,side*(W/2+.073),H/2,0,steel,rack);for(let i=0;i<Math.max(5,c.units);i++){const yy=(i+.5)*H/Math.max(5,c.units);mk('cable duct opening '+side+' '+i,.010,.010,.046,side*(W/2+.073),yy,0,shadow,rack)}}
for(const level of [0,Math.floor(c.units/2),c.units]){const yy=level*U;mk('rear structural crossmember '+level,W+.10,.012,.035,0,yy,D/2-.032,titanium,rack)}
/* Powder-coated perforated rack enclosure, crossbraces, four feet and shelves. */
for(const side of [-1,1]){for(let k=0;k<4;k++){const y=H*(.12+k*.245);mk('brace mounting '+side+' '+k,.018,.014,D*.66,side*(W/2+.035),y,0,titanium,rack)}}
for(const side of [-1,1])for(const depth of [-1,1])mk('rack leveling foot '+side+' '+depth,.046,.042,.046,side*W*.38,-.065,depth*D*.39,black,rack);
for(let k=0;k<c.units;k+=2){const yy=k*U+.007;mk('fine engraved unit guide '+k,.002,.003,.006,-W/2-.046,yy,-D/2-.032,screw,rack)}
mk('top frame',W+.14,.031,D+.09,0,H+.012,0,steel,rack);mk('roof inlay',W+.105,.005,D+.05,0,H+.031,0,shadow,rack);mk('bottom frame',W+.12,.023,D+.05,0,0,0,steel,rack);addPrecisionRackFixtures(scene,rack,W,H,D,c.units);addRackPresentation(scene,rack,W,H,D,c.units);/* Open back: no rear panel hiding rear-mounted modules. */
for(const d of c.devices){const h=d.height*U-.006,y=(d.u-1)*U+h/2+.008;if(y>H||y<0)continue;const root=new TransformNode('device '+d.id,scene);const isRear=d.mount==='rear';const host=d.hostDeviceId?c.devices.find(item=>item.id===d.hostDeviceId):undefined;const panel=d.panelId?c.devices.find(item=>item.id===d.panelId):undefined;const attachedSlot=panel?.slots?.find(slot=>slot.id===d.slotId);const slotIndex=attachedSlot&&panel?.slots?panel.slots.indexOf(attachedSlot):-1;const cols=panel?.slots?.length?Math.max(1,Math.min(panel.slots.length,panel.slotColumns||panel.slots.length)):1;const rows=panel?.slots?.length?Math.ceil(panel.slots.length/cols):1;const slotCol=slotIndex>=0?slotIndex%cols:0,slotRow=slotIndex>=0?Math.floor(slotIndex/cols):0;const panelHeight=panel?(panel.height*U-.006):h;const slotX=panel&&attachedSlot?(-W*.4+(slotCol+.5)*W*.8/cols+(attachedSlot.offsetXmm||0)/1000):0;const slotY=panel&&attachedSlot?((panel.u-1)*U+panelHeight/2+.008+panelHeight*.38-(slotRow+.5)*panelHeight*.76/rows+(attachedSlot.offsetYmm||0)/1000):y;const hostY=host?(host.u-1)*U+(host.height*U-.006)/2+.008:y;root.position.set(slotX,panel&&attachedSlot?slotY:(host?hostY:y),isRear?D/2+.01:-D/2-.01);if(isRear)root.rotation.y=Math.PI;root.parent=rack;root.metadata={id:d.id};instances.set(d.id,root);const face=material('face '+d.id,d.color);/* Full-depth equipment chassis with vents, handles and mounting details. */
const enclosureDepth=Math.min(D-.05,Math.max(.035,(d.depthMm??(d.category==='server'?650:d.category==='storage'?450:180))/1000));const sideBody=material('chassis '+d.id,'#273744');
mk('enclosure body '+d.id,Math.min(W*.88,(d.widthMm||W*880)/1000),h*.83,enclosureDepth,0,0,enclosureDepth*.5+.005,sideBody,root,d.id);
for(const side of [-1,1]){mk('chassis handle '+side+' '+d.id,.012,Math.max(.012,h*.42),.022,side*W*.37,0,-.045,titanium,root,d.id)}
if(d.category==='sbc'&&!d.slots?.length){
  mk('open single board computer mounting tray',W*.57,h*.86,.008,0,0,-.023,steel,root,d.id);
  for(const side of [-1,1]){mk('SBC side mounting rail',.009,h*.9,.026,side*W*.30,0,-.028,titanium,root,d.id)}
  mk('mounting tray lower lip',W*.6,.006,.02,0,-h*.43,-.033,steel,root,d.id);
}else{mk(d.name,W+.062,h,.04,0,0,0,face,root,d.id);mk('front',W+.052,h-.008,.006,0,0,-.024,black,root,d.id);mk('cyan stripe',W*.76,.002,.007,0,h/2-.013,-.031,accent,root,d.id);for(const edge of [-1,1]){mk('ear '+edge,.018,h,.007,edge*(W/2+.025),0,-.034,titanium,root,d.id);mk('ear screw '+edge,.004,.004,.009,edge*(W/2+.026),0,-.04,screw,root,d.id)}mk('trim top',W*.93,.002,.004,0,h/2-.005,-.029,steel,root,d.id);mk('trim bottom',W*.93,.002,.004,0,-h/2+.005,-.029,steel,root,d.id);
}
for(const sx of [-1,1]){mk('rack fastener recessed '+d.id+' '+sx,.009,.009,.004,sx*(W/2+.027),h*.29,-.042,shadow,root,d.id);mk('rack fastener head '+d.id+' '+sx,.004,.004,.006,sx*(W/2+.027),h*.29,-.048,screw,root,d.id)}

const trim=material('metal trim '+d.id,'#91a4ac');const blue=material('usb blue '+d.id,'#2264b0');const green=material('PCB '+d.id,'#216d50');const copper=material('PCB copper '+d.id,'#b68b52');const pale=material('connector '+d.id,'#a9b9bf');const tag=material('status '+d.id,'#e6c464');
if(d.category==='sbc'&&!d.slots?.length){renderSingleBoardComputer(scene,root,d.id,W,h)}
if(d.category==='server'){const bays=d.height>=2?8:4;for(let j=0;j<bays;j++){const cols=d.height>=2?4:4,row=Math.floor(j/cols),col=j%cols;const xx=(col-1.5)*W*.205,yy=d.height>=2?(row===0?h*.19:-h*.19):0;mk('hot swap bay '+d.id+' '+j,W*.165,d.height>=2?h*.3:h*.52,.012,xx,yy,-.044,steel,root,d.id);mk('bay release '+d.id+' '+j,W*.115,.003,.015,xx,yy-h*.07,-.055,titanium,root,d.id)}mk('server diagnostics '+d.id,W*.09,.008,.008,W*.34,-h*.28,-.049,accent,root,d.id)}
if(d.category==='storage'){for(let j=0;j<4;j++){mk('drive bay '+j,W*.17,h*.67,.008,(j-1.5)*W*.215,0,-.044,steel,root,d.id);mk('drive bay handle '+j,W*.12,h*.065,.01,(j-1.5)*W*.215,-h*.18,-.052,trim,root,d.id)}}
/* Perforated metal ventilation, meaningful status lights and dedicated device detail. */
if(!d.slots?.length){for(let vent=0;vent<8;vent++){const xx=-W*.28+vent*(W*.56/7);mk('machined vent '+d.id+' '+vent,.004,Math.max(.003,h*.12),.002,xx,-h*.23,-.032,shadow,root,d.id)}}
if(d.category==='switch'||d.category==='network'){mk('network status strip',W*.15,.006,.006,W*.3,h*.24,-.036,tag,root,d.id)}
for(const display of d.displays||[]){const dw=Math.max(.015,Math.min(W*.87,display.widthMm/1000));const dh=Math.max(.012,Math.min(h*.86,display.heightMm/1000));const dx=Math.max(-W*.35,Math.min(W*.35,display.offsetXmm/1000));const dy=Math.max(-h*.3,Math.min(h*.3,display.offsetYmm/1000));const bezel=material('display bezel '+display.id,'#283d48');const glass=material('display glass '+display.id,'#0e3242');glass.emissiveColor=color('#0b4c56');mk('display mount '+display.id,dw+.006,dh+.006,.008,dx,dy,-.055,bezel,root,d.id);mk('display screen '+display.id,dw,dh,.003,dx,dy,-.062,glass,root,d.id);mk('display status bar '+display.id,dw*.67,.002,.002,dx,dy+dh*.27,-.064,accent,root,d.id)}
if(d.category==='lcd-pi')renderLcdPi(scene,root,d.id,W,h);
if(d.category==='display'){const bezel=material('standalone display bezel '+d.id,'#192d38');const screen=material('standalone screen '+d.id,'#0c4656');screen.metallic=.16;screen.roughness=.2;screen.emissiveColor=color('#136678');mk('display mounting back',W*.87,h*.89,.025,0,0,-.037,bezel,root,d.id);mk('display luminous screen',W*.79,h*.73,.005,0,0,-.057,screen,root,d.id);mk('display header',W*.68,h*.055,.003,0,h*.26,-.062,accent,root,d.id);for(let k=0;k<4;k++)mk('display status indicator '+k,W*.12,h*.022,.003,-W*.27+k*W*.18,-h*.12,-.063,k%2?accent:titanium,root,d.id)}
if(d.imageData?.startsWith('data:image/')){const front=MeshBuilder.CreatePlane('device photo '+d.id,{width:W*.72,height:h*.56,sideOrientation:Mesh.DOUBLESIDE},scene);front.position.set(0,0,-.069);front.parent=root;front.metadata={id:d.id};const photo=new StandardMaterial('device photo material '+d.id,scene);photo.diffuseTexture=new Texture(d.imageData,scene);photo.emissiveColor=color('#59646a');photo.backFaceCulling=false;front.material=photo}
const led=material('led '+d.id,'#24cba7');led.emissiveColor=color('#0b7a66');mk('LED',.008,.008,.006,-W*.39,0,-.032,led,root,d.id);
for(const p of d.ports){const px=Math.max(-W*.44,Math.min(W*.44,p.x*W*.87)),py=Math.max(-h*.37,Math.min(h*.37,p.y*h));const isUsb=p.type.startsWith('USB'),isPower=p.type==='POWER',isHdmi=p.type==='HDMI'||p.type==='DisplayPort';const pw=isUsb?.012:isPower?.014:isHdmi?.019:.017,ph=isUsb?.008:isPower?.014:isHdmi?.008:.017;mk('connector rim '+p.type+' '+p.id,pw+.004,ph+.004,.009,px,py,-.105,isUsb?blue:isPower?pale:trim,root,d.id,p.id);mk('connector cavity '+p.id,pw,ph,.003,px,py,-.111,shadow,root,d.id,p.id);if(isUsb){mk('usb contact '+p.id,pw*.65,.002,.003,px,py-.001,-.115,isUsb?blue:accent,root,d.id,p.id)}else if(p.type==='RJ45'){mk('rj45 tab '+p.id,pw*.45,.002,.003,px,py+ph*.28,-.115,steel,root,d.id,p.id)}else if(isPower){mk('power socket '+p.id,pw*.42,ph*.42,.003,px,py,-.116,black,root,d.id,p.id)}}
if(d.slots?.length){const count=d.slots.length;const columns=Math.max(1,Math.min(count,d.slotColumns||count));const rows=Math.ceil(count/columns);for(let i=0;i<count;i++){const slot=d.slots[i];const col=i%columns,row=Math.floor(i/columns);const xSlot=-W*.4+(col+.5)*W*.8/columns+(slot.offsetXmm||0)/1000;const ySlot=h*.38-(row+.5)*h*.76/rows+(slot.offsetYmm||0)/1000;const slotRoot=new TransformNode('slot '+slot.id,scene);slotRoot.parent=root;slotRoot.position.set(xSlot,ySlot,0);slotRoot.rotation.z=(slot.rotationDeg||0)*Math.PI/180;mk('slot mounting rail '+i,W*.8/columns*.83,h*.8/rows*.85,.008,0,0,-.039,steel,slotRoot,d.id);if(slot.occupied){mk('slot PCB '+i,W*.7/columns,h*.64/rows,.014,0,0,-.053,green,slotRoot,d.id);mk('slot CPU '+i,W*.32/columns,h*.20/rows,.005,0,-h*.09/rows,-.063,black,slotRoot,d.id);mk('slot GPIO '+i,W*.48/columns,h*.035/rows,.005,0,h*.22/rows,-.062,copper,slotRoot,d.id)}else{mk('empty slot '+i,W*.58/columns,h*.42/rows,.004,0,0,-.051,shadow,slotRoot,d.id)}}}

drawEquipmentDetail(scene,root,d.category,d.id,W,h,mk,d.ports.filter(p=>p.type==='RJ45').map(p=>p.x));

if(d.category==='ai'||d.category==='kvm')for(const s of [-1,1])mk('module',W*.34,h*.7,.012,s*W*.23,0,-.037,steel,root,d.id);
}cam.setTarget(new Vector3(0,H/2,0));cam.radius=Math.max(1.03,D/2+H*1.4)}

let restoreRevision=0;
async function restoreModels(){
 const revision=++restoreRevision;
 for(const device of [...cfg.devices]){
  try{
   let asset=await loadModelAsset(device.id);
   if(!asset&&device.templateId==='rack-nas-4u')asset=await builtInNas();
   if(revision!==restoreRevision)return;
   if(asset&&instances.has(device.id)){
    const upload=new File([asset],device.id+'.glb',{type:'model/gltf-binary'});
    await importGLB(upload,device.id,false);
   }
  }catch(error){console.warn('3D model restore failed',device.id,error)}
 }
}
async function importGLB(file:File,id:string,persist:boolean){
 const root=instances.get(id);if(!root)throw Error('No device selected');
 const url=URL.createObjectURL(file);
 try{
  const result=await SceneLoader.ImportMeshAsync('','',url,scene,undefined,'.glb');
  if(instances.get(id)!==root){for(const m of result.meshes)m.dispose();return}
  // Re-import after redraw or model change must not pile up duplicate GLBs.
  for(const child of root.getChildren())if(child.name.startsWith('real-GLB '+id))child.dispose(false,true);
  const node=new TransformNode('real-GLB '+id,scene);node.parent=root;
  // Keep interactive port meshes visible but hide only primitive placeholder bodies.
  for(const child of root.getChildMeshes(false)){
   if(child!==node&&!child.metadata?.port&&!child.name.startsWith('real-GLB '))child.isVisible=false;
  }
  for(const mesh of result.meshes){if(!mesh.parent)mesh.parent=node;mesh.metadata={...mesh.metadata,id}}
  const bounds=node.getHierarchyBoundingVectors(true),ext=bounds.max.subtract(bounds.min);
  const device=cfg.devices.find(d=>d.id===id);
  if(device&&ext.x>.00001&&ext.y>.00001&&ext.z>.00001){
    const depth=Math.max(.04,(device.depthMm??280)/1000);
    const scale=Math.min(spacing(cfg.width)*.89/ext.x,device.height*U*.88/ext.y,depth*.9/ext.z);
    node.scaling.scaleInPlace(scale);
  }
  node.position.z=-.058;
  // The supplied 4U NAS asset has its detailed drive bays on local +Z.
  // Babylon's rack front points toward -Z, so face the bays toward the viewer.
  if(!persist&&device?.templateId==='rack-nas-4u')node.rotation.y=Math.PI;
  if(persist)await saveModelAsset(id,file);
 }finally{URL.revokeObjectURL(url)}
}
let cableMeshes:Mesh[]=[];
function updateCables(connections:{a:string;b:string}[]){
 for(const mesh of cableMeshes)mesh.dispose();cableMeshes=[];
 const colors:{[kind:string]:string}={RJ45:'#38e4a0',POWER:'#f0a85e',HDMI:'#8d9dff',DisplayPort:'#8d9dff','USB-C':'#7fd0f1',USB:'#7fd0f1'};
 const depth=Math.max(.25,Math.min(1.5,(cfg.depthMm??(cfg.width===10?450:800))/1000));
 for(const [i,link] of connections.entries()){
  const endpoint=(key:string)=>{const separator=key.indexOf('/');if(separator<0)return null;const id=key.slice(0,separator),portid=key.slice(separator+1),device=cfg.devices.find(d=>d.id===id),root=instances.get(id),port=device?.ports.find(p=>p.id===portid);if(!device||!root||!port)return null;
   root.computeWorldMatrix(true);const w=spacing(cfg.width),h=device.height*U-.006;
   const point=Vector3.TransformCoordinates(new Vector3(Math.max(-w*.44,Math.min(w*.44,port.x*w*.87)),Math.max(-h*.37,Math.min(h*.37,port.y*h)),-.055),root.getWorldMatrix());
   return{point,face:device.mount==='rear'?'rear' as const:'front' as const,type:port.type};
  };
  const a=endpoint(link.a),b=endpoint(link.b);if(!a||!b)continue;
  const routing=routeRackCable(a,b,spacing(cfg.width),depth,i%5);
  const points=softenCablePath(routing,.012);
  const material=new StandardMaterial('insulated cable '+i,scene);const shade=a.type==='RJ45'?['#49dfa0','#ebc554','#a5e38b','#d87057'][i%4]:(colors[a.type]||colors[b.type]||'#54bcd8');material.diffuseColor=color(shade);material.emissiveColor=color(shade).scale(.12);
  const tube=MeshBuilder.CreateTube('routed cable '+i,{path:points,radius:.0028,tessellation:10,cap:3},scene);tube.material=material;tube.isPickable=false;cableMeshes.push(tube);
  const plugMat=new StandardMaterial('connector shell '+i,scene);plugMat.diffuseColor=color('#23332a');
  for(const [n,end] of [a,b].entries()){
   const plug=MeshBuilder.CreateBox('cable plug '+i+'/'+n,{width:.011,height:.010,depth:.022},scene);
   plug.position.copyFrom(end.point);plug.material=plugMat;plug.isPickable=false;cableMeshes.push(plug);
  }
 }
}

redraw(config);void restoreModels();scene.onPointerObservable.add(e=>{if(e.type!==PointerEventTypes.POINTERDOWN)return;let m=e.pickInfo?.pickedMesh;while(m){if(m.metadata?.id){if(m.metadata.port)onPort(m.metadata.id+'/'+m.metadata.port);else onDevice(m.metadata.id);return}m=m.parent as typeof m}},PointerEventTypes.POINTERDOWN);eng.runRenderLoop(()=>{cameraControl.tick();scene.render()});const resize=()=>eng.resize();window.addEventListener('resize',resize);
return{redraw(c:Config){redraw(c);void restoreModels()},updateCables,focus(id:string){const node=instances.get(id);if(!node)return;const dev=cfg.devices.find(d=>d.id===id);cameraControl.focus(node.getAbsolutePosition(),Math.max(.35,Math.min(1.05,(dev?.height||1)*U*4+.3)),dev?.mount==='rear'?'back':'front')},home(){cameraControl.home(cfg.units*U,(cfg.depthMm??800)/1000)},view(f:Face){cameraControl.view(f)},async load(file:File,id:string){await importGLB(file,id,true)},dispose(){window.removeEventListener('resize',resize);eng.dispose()}}}
