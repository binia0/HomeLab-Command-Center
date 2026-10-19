import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3,Vector3} from '@babylonjs/core';

/** Pi-inspired detailed geometry, NOT a manufacturer's measured CAD/GLB model. */
export function renderSingleBoardComputer(scene:Scene,parent:TransformNode,id:string,rackWidth:number,height:number){
 const make=(name:string,hex:string,metallic=.18,roughness=.55)=>{
  const m=new PBRMaterial(id+' '+name,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=metallic;m.roughness=roughness;return m;
 };
 const pcb=make('green FR4','#146743'),silk=make('white silkscreen','#d9dfc8'),copper=make('solder gold','#cda85f',.76),
 steel=make('brushed nickel','#a7b2b8',.82,.29),dark=make('socket interiors','#0a1419'),
 black=make('black packages','#22272c'),blue=make('USB inserts','#195cad'),gold=make('GPIO pins','#c5a65b',.81);
 const w=Math.min(.085,rackWidth*.47),h=Math.min(.056,height*.75),z=-.067;
 const box=(name:string,bw:number,bh:number,bd:number,x:number,y:number,bz:number,mat:PBRMaterial)=>{
  const m=MeshBuilder.CreateBox(id+' '+name,{width:bw,height:bh,depth:bd},scene);
  m.position.set(x,y,bz);m.parent=parent;m.material=mat;m.metadata={id};return m;
 };
 const cylinder=(name:string,r:number,depth:number,x:number,y:number,bz:number,mat:PBRMaterial,segments=20)=>{
  const m=MeshBuilder.CreateCylinder(id+' '+name,{diameter:r*2,height:depth,tessellation:segments},scene);
  m.rotation.x=Math.PI/2;m.position.set(x,y,bz);m.parent=parent;m.material=mat;m.metadata={id};return m;
 };
 // Green FR4 has a thin, rounded outline rather than a sharp rectangular slab.
 box('PCB core',w-.006,h,.0018,0,0,z,pcb);
 box('PCB spine',w,h-.006,.0018,0,0,z,pcb);
 for(const sx of [-1,1])for(const sy of [-1,1]){
  cylinder('rounded PCB corner '+sx+sy,.003,.0018,sx*(w/2-.003),sy*(h/2-.003),z,pcb);
  cylinder('gold mounting annulus '+sx+sy,.0029,.0021,sx*(w/2-.0038),sy*(h/2-.0038),z-.001,copper);
  cylinder('drilled mounting hole '+sx+sy,.00165,.0024,sx*(w/2-.0038),sy*(h/2-.0038),z-.002,dark);
 }
 // The etched tracks, multiple packages, silkscreen, GPIO and metal connector shells.
 box('processor package',w*.24,h*.30,.004,-w*.10,0,z-.004,black);
 box('processor die',w*.15,h*.19,.0008,-w*.10,0,z-.0068,steel);
 box('RAM IC',w*.17,h*.22,.002,w*.15,-h*.10,z-.003,black);
 for(let n=0;n<14;n++){
  const x=-w*.37+(n%7)*w*.082,y=-h*.35+Math.floor(n/7)*h*.59;
  box('copper trace '+n,w*.061,.00055,.0003,x,y,z-.0012,copper);
 }
 box('GPIO header base',w*.52,.005,.007,-w*.11,h*.34,z-.004,dark);
 for(let n=0;n<20;n++)box('GPIO pin '+n,.00115,.00125,.010,-w*.35+n*w*.0264,h*.34,z-.009,gold);
 box('Ethernet connector shield',w*.205,h*.32,.016,w*.35,h*.17,z-.012,steel);
 box('Ethernet internal recess',w*.155,h*.205,.001,w*.35,h*.17,z-.021,dark);
 for(let n=0;n<8;n++)box('RJ45 contacts '+n,.00075,.003,.001,w*.35+w*(-.055+n*.016),h*.24,z-.022,gold);
 for(let n=0;n<2;n++){
  box('stacked USB connector '+n,w*.18,h*.17,.015,w*.35,-h*.11-n*h*.19,z-.010,steel);
  box('USB blue inset '+n,w*.12,h*.095,.0009,w*.35,-h*.11-n*h*.19,z-.019,blue);
 }
 // Real interface positions at the board edge: power, micro-HDMI and audio barrel.
 for(let n=0;n<3;n++){
  const xx=-w*.29+n*w*.16;
  box('side interface body '+n,w*.12,.005,.009,xx,-h*.49,z-.005,steel);
  box('side interface opening '+n,w*.08,.0012,.001,xx,-h*.515,z-.006,dark);
 }
 cylinder('round audio connector',.0039,.009,-w*.38,-h*.24,z-.008,steel);
 for(let n=0;n<6;n++)box('silkscreen legend '+n,w*.07,.0008,.0003,-w*.33+(n%3)*w*.18,h*(-.22+Math.floor(n/3)*.19),z-.002,silk);
}
