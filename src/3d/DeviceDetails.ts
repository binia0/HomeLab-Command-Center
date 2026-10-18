import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3} from '@babylonjs/core';
type Draw=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial,parent:TransformNode,id?:string)=>unknown;
export function drawEquipmentDetail(scene:Scene,root:TransformNode,category:string|undefined,id:string,width:number,height:number,draw:Draw,networkPortXs:number[]=[]){
 const mat=(name:string,hex:string)=>{const m=new PBRMaterial(name+' '+id,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=.65;m.roughness=.43;return m};
 const metal=mat('machined metal','#4e6258'),dark=mat('vent void','#030906'),led=mat('status led','#4afc86'),glass=mat('glass','#071d14'),orange=mat('activity','#c87738'),bezel=mat('screen bezel','#17241e');led.emissiveColor=Color3.FromHexString('#12a943');
 if(category==='server'||category==='storage'){ 
  // Server-style removable disk drawer array with separated faceplates.
  const brushed=mat('brushed hot swap drive cages','#334351');
  const latch=mat('disk tray handles','#697b89');
  for(let row=0;row<(height>.09?3:1);row++)for(let col=0;col<6;col++){
   const px=(col-2.5)*width*.137,py=(row-((height>.09?3:1)-1)/2)*height*.265;
   draw('drive sled inset '+row+'-'+col,width*.112,height*.215,.009,px,py,-.091,dark,root,id);
   draw('disk eject strip '+row+'-'+col,width*.093,height*.023,.011,px,py-height*.073,-.098,brushed,root,id);
   draw('disk release button '+row+'-'+col,.004,.004,.012,px+width*.041,py-height*.074,-.102,row%2?led:latch,root,id);
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
 if(category==='switch'||category==='network'||category==='patch'){
  const darkMetal=mat('switch chassis','#111b17'),accent=mat('switch identification','#45b96d');
  draw('full network module dark face',width*.91,height*.86,.006,0,0,-.063,darkMetal,root,id);
  draw('network module service stripe',width*.88,height*.035,.007,0,height*.41,-.069,accent,root,id);
  draw('network SFP cage',width*.090,height*.41,.009,width*.40,-height*.02,-.075,metal,root,id);
  draw('network SFP socket',width*.069,height*.29,.010,width*.40,-height*.02,-.081,dark,root,id);
  draw('network status',.004,.004,.009,-width*.41,height*.26,-.081,led,root,id);
  for(let v=0;v<5;v++)draw('switch fine cooling slit '+v,width*.07,.001,.009,-width*.40,-height*.06-v*height*.069,-.079,dark,root,id);

  const xs=networkPortXs.length?networkPortXs.slice(0,24).map(x=>x*width*.87):Array.from({length:8},(_,i)=>(i-3.5)*width*.102);
  for(let i=0;i<xs.length;i++){
   const x=xs[i],portW=Math.min(.022,width*.057);
   draw('8P switch recessed RJ45 shell '+i,portW,height*.48,.009,x,0,-.073,metal,root,id);
   draw('RJ45 dark opening '+i,portW*.82,height*.30,.010,x,-height*.025,-.082,dark,root,id);
   draw('RJ45 locking lip '+i,portW*.54,height*.04,.006,x,-height*.19,-.087,metal,root,id);
   for(let pin=0;pin<6;pin++)draw('gold contact '+i+' '+pin,portW*.06,.001,.003,x+portW*(pin-2.5)*.11,height*.06,-.088,orange,root,id);
   draw('link activity LED '+i,.003,.003,.006,x,height*.34,-.091,i%3?led:orange,root,id);
  }
 }
 // Physical front panel elements on otherwise generic hardware: vents, fasteners,
 // recessed diagnostic display and grouped service indicators.
 if(!['server','storage','switch','network','patch','display','sbc'].includes(category||'')){
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
 if(category==='sbc'){
  const pcb=mat('sbc pcb','#15533c'),tracks=mat('sbc routed traces','#357d62'),chip=mat('sbc integrated circuits','#11191d'),copper=mat('sbc pins','#c8a86a');
  draw('single board computer circuit board',width*.60,height*.68,.012,0,0,-.072,pcb,root,id);
  for(let i=0;i<12;i++){
   draw('GPIO copper contact '+i,.003,.006,.004,-width*.235+i*width*.041,height*.26,-.081,copper,root,id);
   if(i<7)draw('traces '+i,width*.12,.001,.003,-width*.16+i*width*.052,-height*.15+i*height*.04,-.081,tracks,root,id);
  }
  draw('processor package',width*.17,height*.33,.014,-width*.04,0,-.084,chip,root,id);
  draw('processor heat spreader',width*.14,height*.25,.004,-width*.04,0,-.093,metal,root,id);
  for(let i=0;i<5;i++)draw('soc heatsink fin '+i,width*.12,.002,.007,-width*.04,(i-2)*height*.042,-.098,dark,root,id);
  for(let i=0;i<2;i++){
   draw('usb stacked connector casing '+i,width*.095,height*.19,.024,width*.23,(i?1:-1)*height*.16,-.092,metal,root,id);
   draw('usb receptacle '+i,width*.066,height*.12,.004,width*.23,(i?1:-1)*height*.16,-.105,dark,root,id);
  }
  draw('board activity diode',.005,.005,.008,-width*.20,-height*.21,-.083,led,root,id);
 }
 if(category==='display'){
  draw('glass interactive display',width*.72,height*.7,.004,0,0,-.077,glass,root,id);draw('screen title strip',width*.64,height*.05,.005,0,height*.25,-.083,led,root,id);for(let line=0;line<4;line++)draw('screen metric '+line,width*(.32+line*.07),height*.022,.006,-width*.1,height*(.12-line*.1),-.084,line%2?metal:led,root,id);
  draw('screen bottom bezel',width*.74,height*.06,.006,0,-height*.38,-.081,dark,root,id);
  draw('display status led',.004,.004,.008,width*.32,-height*.38,-.086,led,root,id);
 }
}
