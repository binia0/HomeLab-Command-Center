import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3} from '@babylonjs/core';
type Draw=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial,parent:TransformNode,id?:string)=>unknown;
export function drawEquipmentDetail(scene:Scene,root:TransformNode,category:string|undefined,id:string,width:number,height:number,draw:Draw,networkPortXs:number[]=[]){
 const mat=(name:string,hex:string)=>{const m=new PBRMaterial(name+' '+id,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=.65;m.roughness=.43;return m};
 const metal=mat('machined metal','#647589'),dark=mat('vent void','#050c16'),led=mat('status led','#37b1ff'),glass=mat('glass','#091d35'),orange=mat('activity','#c87738'),bezel=mat('screen bezel','#182a40');led.emissiveColor=Color3.FromHexString('#116aaf');
 if(category==='storage'){
  // NAS: eight tall, independently recessed removable drive bays, not a server grid.
  const enclosure=mat('NAS matte black fascia','#101820');
  const tray=mat('NAS individually milled tray','#293644');
  const lip=mat('NAS satin silver latch','#7a91a5');
  draw('8 bay NAS recessed door',width*.79,height*.80,.016,0,0,-.073,enclosure,root,id);
  const bayW=width*.077,step=width*.095;
  for(let i=0;i<8;i++){
   const x=(i-3.5)*step;
   draw('NAS deep bay recess '+i,bayW,height*.67,.010,x,-height*.015,-.086,dark,root,id);
   draw('NAS removable vertical drive '+i,bayW*.87,height*.63,.011,x,-height*.008,-.094,tray,root,id);
   draw('NAS drive eject latch '+i,bayW*.62,height*.036,.013,x,-height*.282,-.103,lip,root,id);
   draw('NAS drive activity LED '+i,.0028,.004,.014,x+bayW*.27,height*.246,-.105,i%4===0?orange:led,root,id);
  }
  draw('NAS power switch surround',width*.042,height*.20,.013,width*.43,height*.19,-.080,glass,root,id);
  draw('NAS power illuminated',.009,.009,.015,width*.43,height*.19,-.089,led,root,id);
 }
 if(category==='server'){
  // Rack server: horizontal drive carriers, paired intake banks and a control module.
  const front=mat('server graphite perforated fascia','#1b2836');
  const handle=mat('server brushed titanium sled grip','#768a9b');
  draw('rack server removable front',width*.83,height*.80,.010,0,0,-.071,front,root,id);
  const rows=height>.095?2:1,columns=6;
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
   const px=(col-2.5)*width*.119,py=(row-(rows-1)/2)*height*.29;
   draw('server hot swap shadow '+row+'-'+col,width*.103,height*.245,.009,px,py,-.083,dark,root,id);
   draw('server horizontal drive '+row+'-'+col,width*.094,height*.220,.009,px,py,-.090,metal,root,id);
   draw('server drive release '+row+'-'+col,width*.077,height*.033,.011,px,py-height*.077,-.097,handle,root,id);
   draw('server disk green activity '+row+'-'+col,.003,.003,.012,px+width*.039,py+height*.076,-.098,col%3===0?orange:led,root,id);
  }
 }
 if(category==='server'){
   for(let j=0;j<2;j++){
    const x=(j?1:-1)*width*.41;
    draw('server exhaust grill '+j,width*.045,height*.55,.006,x,0,-.079,dark,root,id);
    for(let k=0;k<5;k++)draw('server grill horizontal '+j+' '+k,width*.04,.0016,.007,x,(k-2)*height*.085,-.084,metal,root,id);
   }
   draw('server control module',width*.10,height*.43,.007,width*.31,0,-.078,dark,root,id);
   for(let j=0;j<3;j++)draw('server drive status '+j,.004,.003,.009,width*.29+j*.008,height*.11,-.085,j===2?orange:led,root,id);
 }
 if(category==='switch'||category==='network'||category==='patch'||category==='patch-panel'){
  // Dense, physically layered 24-port network fascia, with the RJ45 mouths on the
  // outward surface. Ports are not flat drawn rectangles.
  const chassis=mat('switch black anodized chassis','#151c28');
  const cavity=mat('dark socket interiors','#02060c');
  const shell=mat('satin nickel RJ45 housings','#8a939a');
  const gold=mat('eight gold contacts','#c4a269');
  const portCount=Math.max(8,Math.min(24,networkPortXs.length||24));
  const columns=Math.ceil(portCount/2);
  draw('recessed switch faceplate',width*.91,height*.88,.018,0,0,-.068,chassis,root,id);
  const firstX=-width*.385, spacing=width*.765/Math.max(1,columns-1);
  for(let i=0;i<portCount;i++){
   const col=i%columns,row=Math.floor(i/columns);
   const x=firstX+col*spacing;
   const y=(row===0?1:-1)*height*.19;
   const pw=Math.min(width*.045,spacing*.75);
   const ph=height*.28;
   draw('machined RJ45 bezel '+i,pw,ph,.012,x,y,-.086,shell,root,id);
   draw('recessed RJ45 interior '+i,pw*.79,ph*.76,.004,x,y,-.094,cavity,root,id);
   draw('socket retaining lip '+i,pw*.58,ph*.09,.004,x,y-ph*.29,-.099,shell,root,id);
   for(let pin=0;pin<8;pin++){
    draw('RJ45 contact '+i+'-'+pin,pw*.045,ph*.11,.002,x+(pin-3.5)*pw*.087,y+ph*.21,-.098,gold,root,id);
   }
   draw('network activity '+i,.0026,.0026,.005,x+pw*.38,y+ph*.42,-.095,i%4===0?orange:led,root,id);
  }
  draw('switch ventilation grille',width*.073,height*.38,.012,width*.425,0,-.079,cavity,root,id);
  for(let v=0;v<7;v++)draw('switch vent vane '+v,width*.060,.0015,.013,width*.425,(v-3)*height*.043,-.086,metal,root,id);
 }
 // Physical front panel elements on otherwise generic hardware: vents, fasteners,
 // recessed diagnostic display and grouped service indicators.
 if(!['server','storage','switch','network','patch','patch-panel','display','sbc','power'].includes(category||'')){
  const face=mat('anodized front plate','#242e35'),trim=mat('precision milled outline','#6c7a83'),recess=mat('ventilation darkness','#080e14');
  draw('anodized removable front plate',width*.81,height*.72,.008,0,0,-.068,face,root,id);
  for(const side of [-1,1]){
   draw('countersunk mounting bezel '+side,.012,height*.54,.010,side*width*.375,0,-.075,trim,root,id);
   for(let n=0;n<3;n++)draw('vertical intake '+side+' '+n,.004,height*.12,.012,side*width*.29,(n-1)*height*.18,-.079,recess,root,id);
  }
  draw('service information label',width*.28,height*.19,.009,-width*.12,height*.11,-.077,recess,root,id);
  draw('service label accent',width*.26,.002,.011,-width*.12,height*.18,-.084,trim,root,id);
  for(let i=0;i<3;i++)draw('device indicator '+i,.0045,.0045,.011,width*.16+i*.012,-height*.17,-.085,i===2?orange:led,root,id);
 }
 if(category==='power'){
  // Distinct 2U UPS front with a projecting LCD control bay and two recessed vents.
  const caseMat=mat('UPS powder coated steel','#202a3a');
  const edge=mat('UPS metallic edge','#687c8f');
  const shadow=mat('UPS deep mesh','#050a12');
  const screen=mat('UPS powered LCD','#075286');
  const green=mat('UPS online LED','#23cd8e');
  screen.emissiveColor=Color3.FromHexString('#084c86');
  green.emissiveColor=Color3.FromHexString('#159766');
  draw('UPS broad dark steel bezel',width*.87,height*.83,.014,0,0,-.074,caseMat,root,id);
  for(const side of [-1,1]){
   const x=side*width*.265;
   draw('UPS recessed air intake '+side,width*.245,height*.58,.010,x,0,-.086,shadow,root,id);
   for(let i=0;i<10;i++)draw('UPS horizontal grille '+side+' '+i,width*.215,.0028,.011,x,(i-4.5)*height*.049,-.093,edge,root,id);
   draw('UPS inlet bordering bar '+side,width*.260,.004,.012,x,height*.32,-.088,edge,root,id);
  }
  draw('UPS control housing',width*.155,height*.60,.022,0,0,-.091,caseMat,root,id);
  draw('UPS powered display rim',width*.128,height*.41,.006,0,height*.06,-.107,edge,root,id);
  draw('UPS luminous screen',width*.114,height*.35,.005,0,height*.06,-.112,screen,root,id);
  for(let i=0;i<4;i++)draw('UPS meter row '+i,width*(.03+.014*(i%2)),.0035,.006,-width*.012,height*(.18-i*.066),-.116,i===0?green:led,root,id);
  draw('UPS power circle',.014,.014,.012,0,-height*.252,-.104,edge,root,id);
  draw('UPS power LED',.006,.006,.014,0,-height*.252,-.112,green,root,id);
  for(const side of [-1,1]){
   draw('UPS grab handle '+side,.010,height*.63,.026,side*width*.447,0,-.091,edge,root,id);
  }
 }
 // A chassis must read as real equipment at normal rack-camera distance.
 if(category==='switch'||category==='network'||category==='patch'||category==='patch-panel'){
  const rail=mat('machined switch aluminium','#6a7b91'),channel=mat('machined recess','#06101e');
  for(const side of [-1,1]){
   draw('switch front mounting ear '+side,width*.033,height*.90,.012,side*width*.476,0,-.070,rail,root,id);
   draw('switch mounting fastener '+side,.006,.006,.015,side*width*.478,height*.25,-.080,rail,root,id);
  }
  draw('switch lower machined recess',width*.78,height*.025,.009,0,-height*.40,-.078,channel,root,id);
 }
 if(category==='server'||category==='storage'){
  const aluminum=mat('storage brushed steel','#586a80'),deep=mat('drive ventilation dark','#020814');
  for(const side of [-1,1]){
   draw('storage mounting handle '+side,.017,height*.67,.028,side*width*.45,0,-.084,aluminum,root,id);
   draw('storage handle recess '+side,.006,height*.46,.011,side*width*.45,0,-.101,deep,root,id);
  }
  for(let i=0;i<12;i++)draw('top exhaust perforation '+i,width*.041,.003,.006,(i-5.5)*width*.066,height*.43,-.077,deep,root,id);
 }
 if(category==='display'){
  // Layered industrial monitor: a projecting aluminium case, black glass and a legible
  // status-dashboard silhouette. All dimensions are relative to the assigned rack bay.
  const housing=mat('monitor dark anodized aluminium','#263541');
  const glassEdge=mat('monitor reflective glass border','#0e253d');
  const screen=mat('monitor powered display','#08213b');
  const cyan=mat('monitor cyan illuminated widgets','#2caef7');
  const blue=mat('monitor blue illuminated widgets','#1274c3');
  const white=mat('monitor labels','#9dd8eb');
  cyan.emissiveColor=Color3.FromHexString('#1078b5');
  blue.emissiveColor=Color3.FromHexString('#0a4a83');
  screen.emissiveColor=Color3.FromHexString('#031a2e');
  draw('display case milled aluminium',width*.91,height*.87,.025,0,0,-.069,housing,root,id);
  draw('glass edge trim',width*.846,height*.77,.005,0,0,-.085,glassEdge,root,id);
  draw('active monitor display',width*.825,height*.745,.003,0,0,-.089,screen,root,id);
  draw('screen title bar',width*.75,height*.07,.004,0,height*.285,-.092,blue,root,id);
  draw('screen left navigation',width*.125,height*.54,.004,-width*.323,-height*.045,-.092,glassEdge,root,id);
  for(let i=0;i<4;i++){
   draw('display navigation line '+i,width*.08,height*.012,.005,-width*.325,height*(.15-i*.12),-.095,i===0?cyan:white,root,id);
  }
  for(let i=0;i<3;i++){
   const xx=width*(-.13+i*.19);
   draw('status tile '+i,width*.155,height*.22,.004,xx,height*.055,-.093,glassEdge,root,id);
   draw('status tile header '+i,width*.11,height*.02,.005,xx,height*.105,-.096,cyan,root,id);
   draw('status tile value '+i,width*.072,height*.037,.005,xx,height*.018,-.096,white,root,id);
   for(let j=0;j<4;j++)draw('micro bar '+i+' '+j,width*.012,height*(.03+.025*((i+j)%3)),.005,xx+width*(j-1.5)*.029,-height*.065,-.096,blue,root,id);
  }
  draw('timeline graphite',width*.55,height*.14,.004,width*.055,-height*.25,-.093,glassEdge,root,id);
  for(let i=0;i<10;i++)draw('timeline activity '+i,width*.036,height*(.02+.015*(i%4)),.005,-width*.17+i*width*.047,-height*.28,-.096,i%3===0?cyan:blue,root,id);
  draw('display lower metal chin',width*.91,height*.055,.007,0,-height*.43,-.086,housing,root,id);
  draw('display illuminated power button',.006,.006,.010,width*.388,-height*.422,-.094,cyan,root,id);
 }
}
