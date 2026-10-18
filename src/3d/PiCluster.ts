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
 const boardW=usable*.155,boardH=bayH*.69;
 for(let i=0;i<4;i++){
  const x=-usable*.36+i*usable*.18;
  box('board '+i,boardW,boardH,.004,x,0,-.077,pcb);
  for(const sx of [-1,1])for(const sy of [-1,1])box('board fixing '+i+sx+sy,.005,.005,.005,x+sx*boardW*.42,sy*boardH*.42,-.082,gold);
  box('processor '+i,boardW*.48,boardH*.30,.009,x,boardH*.13,-.086,dark);
  box('CPU cooler '+i,boardW*.41,boardH*.24,.006,x,boardH*.13,-.095,sockets);
  for(let j=0;j<4;j++)box('heatsink fin '+i+' '+j,boardW*.34,.002,.008,x,boardH*(.035+j*.048),-.101,back);
  box('ethernet case '+i,boardW*.39,boardH*.21,.014,x+boardW*.21,-boardH*.27,-.088,sockets);
  box('ethernet cavity '+i,boardW*.25,boardH*.13,.004,x+boardW*.21,-boardH*.27,-.098,dark);
  box('USB connector '+i,boardW*.31,boardH*.18,.013,x-boardW*.24,-boardH*.29,-.088,sockets);
  box('USB slot '+i,boardW*.24,boardH*.09,.003,x-boardW*.24,-boardH*.29,-.098,blue);
  for(let p=0;p<9;p++)box('GPIO pin '+i+' '+p,.0017,.003,.003,x-boardW*.39+p*boardW*.095,boardH*.38,-.083,gold);
  box('Pi LED '+i,.004,.004,.006,x+boardW*.31,boardH*.30,-.088,led);
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
