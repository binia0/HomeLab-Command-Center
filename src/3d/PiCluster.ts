import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3,StandardMaterial,DynamicTexture,Mesh} from '@babylonjs/core';

/** Four vertically edge-mounted Pi boards: PCB planes run along rack depth.
 * The forward network and USB cages are at negative Z; the boards are not front-facing stickers.
 */
export function renderPiCluster(scene:Scene,root:TransformNode,id:string,rackWidth:number,rackHeight:number,ethernetPositions:number[]=[],ethernetIds:string[]=[]){
 const paint=(name:string,hex:string,metallic=.3,emissive=false)=>{
  const m=new PBRMaterial(id+' '+name,scene);m.albedoColor=Color3.FromHexString(hex);
  m.metallic=metallic;m.roughness=metallic>.7?.34:.62;
  if(emissive)m.emissiveColor=Color3.FromHexString(hex).scale(.55);
  return m;
 };
 const frame=paint('machined aluminum carrier','#263540',.84),pcb=paint('PCB substrate','#19613c',.14);
 const silicon=paint('chips','#172228',.28),nickel=paint('connector shields','#98a6ad',.82);
 const sockets=paint('dark sockets','#0c151e',.2),blue=paint('blue USB cores','#225a9b',.2);
 const gold=paint('gold pins','#d4b36a',.8),led=paint('activity LED','#26d99f',.1,true);
 let boardRoot:TransformNode|null=null,boardX=0;
 const box=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial)=>{
  const mesh=MeshBuilder.CreateBox(id+' '+name,{width:w,height:h,depth:d},scene);
  mesh.parent=boardRoot||root;mesh.position.set(boardRoot?x-boardX:x,y,z);mesh.material=mat;mesh.metadata={id};
  return mesh;
 };
 const bayW=Math.min(rackWidth*.85,.415),bayH=Math.min(rackHeight*.84,.19);
 const boardH=Math.min(.057,bayH*.73),boardD=.085,boardFront=-.086,boardBack=boardFront+boardD;
 box('open bottom carrier',bayW,.006,.126,0,-bayH*.44,-.054,frame);
 box('backplate rails',bayW,.009,.016,0,bayH*.40,-.027,frame);
 for(const side of [-1,1]){
  box('side upright '+side,.010,bayH*.91,.115,side*bayW*.51,0,-.06,frame);
 }
 // Each board is orthogonal to the front face and sits on its NARROW edge.
 // Align its Ethernet-facing end with the actual editable physical connector.
 const standard=[-.34,-.125,.09,.305].map(x=>x*bayW);
 const xs=ethernetPositions.length>=4?ethernetPositions.slice(0,4):standard;
 for(let i=0;i<4;i++){
  const x=Math.max(-bayW*.44,Math.min(bayW*.44,xs[i]));
  boardRoot=new TransformNode('pi-port-carrier:'+id+':'+(ethernetIds[i]||'lan'+i),scene);
  boardRoot.parent=root;boardRoot.position.x=x;boardX=x;
  box('vertical Pi PCB '+(i+1),.002,boardH,boardD,x,0,(boardFront+boardBack)/2,pcb);
  for(const dy of [-1,1]){
   box('board standoff '+i+' '+dy,.014,.007,.014,x,-boardH*.5+(.006+(.5+dy*.5)*(boardH-.012)),-.041,frame);
  }
  // Copper, ICs and GPIO are on the two side faces, visible from angled camera.
  for(const side of [-1,1]){
   const xx=x+side*.003;
   box('main processor '+i+' '+side,.004,boardH*.29,.021,xx,boardH*.12,-.067,silicon);
   box('RAM chip '+i+' '+side,.003,boardH*.18,.018,xx,-boardH*.22,-.078,silicon);
   box('GPIO header '+i+' '+side,.004,.007,.051,xx,boardH*.39,-.065,sockets);
   for(let pin=0;pin<10;pin++)box('GPIO pin '+i+' '+side+' '+pin,.004,.0015,.002,xx+side*.002,boardH*.39,-.088+pin*.0051,gold);
  }
  // Metal cages genuinely face the aisle, not sideways into neighbouring boards.
  box('forward Ethernet cage '+i,.020,.018,.016,x,boardH*.22,boardFront-.007,nickel);
  box('forward Ethernet cavity '+i,.015,.012,.002,x,boardH*.22,boardFront-.016,sockets);
  for(let n=0;n<2;n++){
   box('forward USB shield '+i+' '+n,.017,.010,.013,x,-boardH*.05-n*.012,boardFront-.006,nickel);
   box('forward USB socket '+i+' '+n,.012,.006,.002,x,-boardH*.05-n*.012,boardFront-.014,blue);
  }
  box('Pi activity light '+i,.004,.004,.004,x,boardH*.38,boardFront-.012,led);
  boardRoot=null;
 }
 const screenW=bayW*.23,screenH=Math.min(bayH*.50,.095),screenX=bayW*.375;
 box('monitor case',screenW,screenH,.015,screenX,0,-.091,frame);
 const screen=MeshBuilder.CreatePlane(id+' telemetry screen',{width:screenW*.89,height:screenH*.81,sideOrientation:Mesh.DOUBLESIDE},scene);
 screen.parent=root;screen.position.set(screenX,0,-.101);screen.metadata={id};
 const tex=new DynamicTexture(id+' telemetry',{width:256,height:320},scene,false);
 const ctx=tex.getContext();ctx.fillStyle='#061728';ctx.fillRect(0,0,256,320);
 ctx.fillStyle='#4fcaff';ctx.font='bold 25px monospace';ctx.fillText('HomeLab',15,38);
 for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#258cda':'#35dc9c';ctx.fillRect(15,78+i*55,125+i*18,13);ctx.fillStyle='#d8f2ff';ctx.font='16px monospace';ctx.fillText('PI '+(i+1),15,75+i*55);}
 tex.update();const display=new StandardMaterial(id+' display screen',scene);display.diffuseTexture=tex;display.emissiveColor=Color3.FromHexString('#106c8b');display.backFaceCulling=false;screen.material=display;
}
