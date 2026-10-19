import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3,StandardMaterial,DynamicTexture,Mesh} from '@babylonjs/core';

/** A rack-mounted four SBC service bay with a front telemetry monitor. One rack device. */
export function renderPiCluster(scene:Scene,root:TransformNode,id:string,rackWidth:number,rackHeight:number){
 const paint=(name:string,hex:string,metallic=.3,glow=false)=>{
  const m=new PBRMaterial(id+' '+name,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=metallic;m.roughness=.52;
  if(glow)m.emissiveColor=Color3.FromHexString(hex).scale(.65);
  return m;
 };
 const back=paint('mounting frame','#17202c',.85),pcb=paint('four PCBs','#165c3c',.16),
 dark=paint('silicon','#131b23'),sockets=paint('steel connectors','#8d9dab',.8),
 blue=paint('USB insert','#155d9a'),gold=paint('pin headers','#c6a56b',.7),
 led=paint('activity lights','#36e29c',.1,true),displayFrame=paint('screen bezel','#252f3c',.65);
 const box=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial)=>{
  const o=MeshBuilder.CreateBox(id+' '+name,{width:w,height:h,depth:d},scene);o.parent=root;o.position.set(x,y,z);o.material=mat;o.metadata={id};return o;
 };
 const usable=Math.min(rackWidth*.86,.41),bayH=Math.min(rackHeight*.8,.18);
 box('cluster backplane',usable,bayH,.012,0,0,-.044,back);
 for(const side of [-1,1]){
  box('mount rail '+side,.016,bayH*.98,.021,side*usable*.5,0,-.061,sockets);
  for(let i=0;i<4;i++)box('mount rivet '+side+' '+i,.004,.004,.004,side*usable*.5,(i-1.5)*bayH*.20,-.073,gold);
 }
 // Each Pi has a separate physical 3D carrier and an elevated board.
 // Distinct PCB thickness, mounting standoffs, etched traces, chips and port bodies.
 const boardW=usable*.145,boardH=bayH*.70;
 const trace=paint('copper PCB traces','#9e8050',.38),silk=paint('PCB markings','#c5d9b2',.05);
 for(let i=0;i<4;i++){
  const x=-usable*.378+i*usable*.182;
  const carrierZ=-.064,boardZ=-.083;
  box('independent carrier '+i,boardW*1.12,boardH*1.12,.006,x,0,carrierZ,back);
  for(const sx of [-1,1])for(const sy of [-1,1]){
   const px=x+sx*boardW*.43,py=sy*boardH*.43;
   box('separate standoff '+i+' '+sx+sy,.007,.007,.019,px,py,-.073,sockets);
   box('standoff screw '+i+' '+sx+sy,.004,.004,.003,px,py,-.089,gold);
  }
  box('green Raspberry Pi circuit board '+i,boardW,boardH,.003,x,0,boardZ,pcb);
  for(let j=0;j<5;j++){
   box('PCB signal track '+i+' '+j,boardW*.55,.0009,.0007,x,boardH*(-.23+j*.115),-.085,trace);
   box('silkscreen label '+i+' '+j,boardW*.21,.0011,.0007,x-boardW*.20,boardH*(-.35+j*.155),-.0857,silk);
  }
  box('processor '+i,boardW*.39,boardH*.25,.008,x-boardW*.08,boardH*.12,-.090,dark);
  box('processor heatspreader '+i,boardW*.34,boardH*.22,.004,x-boardW*.08,boardH*.12,-.096,sockets);
  for(let j=0;j<5;j++)box('metal heatsink fin '+i+' '+j,boardW*.30,.0017,.009,x-boardW*.08,boardH*(.03+j*.043),-.104,sockets);
  box('RAM '+i,boardW*.22,boardH*.13,.003,x+boardW*.20,boardH*.18,-.088,dark);
  // Structural USB stack only; editable RJ45 sockets come from the shared port renderer.
  box('USB metal housing '+i,boardW*.28,boardH*.15,.012,x+boardW*.24,-boardH*.25,-.094,sockets);
  box('USB inset '+i,boardW*.19,boardH*.085,.002,x+boardW*.24,-boardH*.25,-.101,blue);
  box('USB stack seam '+i,boardW*.25,.001,.002,x+boardW*.24,-boardH*.25,-.103,dark);
  for(let p=0;p<12;p++){
   box('individual GPIO gold pin '+i+' '+p,.0013,.003,.004,x-boardW*.39+p*boardW*.068,boardH*.39,-.087,gold);
  }
  box('Pi activity diode '+i,.003,.004,.005,x+boardW*.32,boardH*.29,-.089,led);
 }
 const screenW=usable*.20,screenH=bayH*.53,screenX=usable*.35;
 box('monitor case',screenW,screenH,.014,screenX,0,-.081,displayFrame);
 const screen=MeshBuilder.CreatePlane(id+' telemetry screen',{width:screenW*.90,height:screenH*.82,sideOrientation:Mesh.DOUBLESIDE},scene);
 screen.parent=root;screen.position.set(screenX,0,-.091);screen.metadata={id};
 const tex=new DynamicTexture(id+' telemetry', {width:256,height:320},scene,false);
 const ctx=tex.getContext();ctx.fillStyle='#061728';ctx.fillRect(0,0,256,320);
 ctx.fillStyle='#4fcaff';ctx.font='bold 25px monospace';ctx.fillText('HomeLab',15,38);
 for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#258cda':'#35dc9c';ctx.fillRect(15,80+i*56,130+i*18,14);ctx.fillStyle='#d8f2ff';ctx.font='18px monospace';ctx.fillText(['CPU','RAM','TEMP','NET'][i],15,70+i*56)}
 tex.update();const screenMat=new StandardMaterial(id+' telemetry material',scene);screenMat.diffuseTexture=tex;screenMat.emissiveColor=new Color3(.21,.3,.4);screenMat.backFaceCulling=false;screen.material=screenMat;
}
