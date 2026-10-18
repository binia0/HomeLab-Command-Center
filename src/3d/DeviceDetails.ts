import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3} from '@babylonjs/core';
type Draw=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial,parent:TransformNode,id?:string)=>unknown;
export function drawEquipmentDetail(scene:Scene,root:TransformNode,category:string|undefined,id:string,width:number,height:number,draw:Draw,networkPortXs:number[]=[]){
 const mat=(name:string,hex:string)=>{const m=new PBRMaterial(name+' '+id,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=.65;m.roughness=.43;return m};
 const metal=mat('machined metal','#4e6258'),dark=mat('vent void','#030906'),led=mat('status led','#4afc86'),glass=mat('glass','#071d14'),orange=mat('activity','#c87738'),bezel=mat('screen bezel','#17241e');led.emissiveColor=Color3.FromHexString('#12a943');
 if(category==='server'||category==='storage'){
  const columns=4,rows=height>.08?3:1;
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
   const px=(x-(columns-1)/2)*width*.205,py=(y-(rows-1)/2)*height*.29;
   draw('removable drive cartridge '+x+'-'+y,width*.17,height*.22,.006,px,py,-.072,metal,root,id);
   draw('cartridge inlay '+x+'-'+y,width*.13,height*.15,.008,px,py,-.077,dark,root,id);
   draw('cartridge latch '+x+'-'+y,width*.07,.002,.009,px,py-height*.073,-.082,metal,root,id);
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
 if(category==='display'){
  draw('glass interactive display',width*.72,height*.7,.004,0,0,-.077,glass,root,id);draw('screen title strip',width*.64,height*.05,.005,0,height*.25,-.083,led,root,id);for(let line=0;line<4;line++)draw('screen metric '+line,width*(.32+line*.07),height*.022,.006,-width*.1,height*(.12-line*.1),-.084,line%2?metal:led,root,id);
  draw('screen bottom bezel',width*.74,height*.06,.006,0,-height*.38,-.081,dark,root,id);
  draw('display status led',.004,.004,.008,width*.32,-height*.38,-.086,led,root,id);
 }
}
