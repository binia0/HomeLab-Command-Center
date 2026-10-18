import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3} from '@babylonjs/core';
type Draw=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial,parent:TransformNode,id?:string)=>unknown;
export function drawEquipmentDetail(scene:Scene,root:TransformNode,category:string|undefined,id:string,width:number,height:number,draw:Draw){
 const mat=(name:string,hex:string)=>{const m=new PBRMaterial(name+' '+id,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=.65;m.roughness=.43;return m};
 const metal=mat('machined metal','#87949e'),dark=mat('vent void','#0c151e'),led=mat('status led','#35c4a5'),glass=mat('glass','#123a51');
 if(category==='server'||category==='storage'){
  const columns=4,rows=height>.08?3:1;
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
   const px=(x-(columns-1)/2)*width*.205,py=(y-(rows-1)/2)*height*.29;
   draw('removable drive cartridge '+x+'-'+y,width*.17,height*.22,.006,px,py,-.072,metal,root,id);
   draw('cartridge inlay '+x+'-'+y,width*.13,height*.15,.008,px,py,-.077,dark,root,id);
   draw('cartridge latch '+x+'-'+y,width*.07,.002,.009,px,py-height*.073,-.082,metal,root,id);
  }
 }
 if(category==='switch'||category==='network'||category==='patch'){
  for(let i=0;i<12;i++){
   const x=(i-5.5)*width*.065;
   draw('switch jack recess '+i,width*.047,height*.29,.005,x,0,-.075,dark,root,id);
   draw('switch jack metal surround '+i,width*.052,.002,.007,x,height*.19,-.077,metal,root,id);
  }
 }
 if(category==='display'){
  draw('glass interactive display',width*.72,height*.7,.004,0,0,-.077,glass,root,id);
  draw('screen bottom bezel',width*.74,height*.06,.006,0,-height*.38,-.081,dark,root,id);
  draw('display status led',.004,.004,.008,width*.32,-height*.38,-.086,led,root,id);
 }
}
