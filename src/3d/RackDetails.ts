import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3} from '@babylonjs/core';
/** Visible physical fixtures separate from device UI and port data. All lengths are metres. */
export function addPrecisionRackFixtures(scene:Scene,parent:TransformNode,w:number,h:number,depth:number,units:number){
 const mat=(id:string,hex:string,metal:number)=>{const m=new PBRMaterial(id,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=metal;m.roughness=.48;return m};
 const anodized=mat('powder coated structure','#3f4850',.78);
 const bright=mat('brushed aluminum brackets','#a8aeb2',.86);
 const dark=mat('ventilation recesses','#11191e',.2);
 const part=(name:string,width:number,height:number,d:number,x:number,y:number,z:number,m:PBRMaterial)=>{
  const mesh=MeshBuilder.CreateBox(name,{width,height,depth:d},scene);mesh.position.set(x,y,z);mesh.material=m;mesh.parent=parent;mesh.isPickable=false;return mesh;
 };
 for(const xsign of [-1,1]){
  const x=xsign*(w/2+.041);
  for(const zsign of [-1,1]){
   const z=zsign*depth/2;
   part('precision extruded aluminum post',.022,h+.065,.027,x,h/2,z,anodized);
   for(let u=0;u<units;u++){
    const y=(u+.5)*.04445;
    for(const offset of [-.012,0,.012])part('three-hole rack square perforation',.009,.006,.003,xsign*(w/2+.043),y+offset,zsign*(depth/2+.015),dark);
   }
  }
  for(let level=0;level<=4;level++){
   part('steel crossbrace',.012,.022,depth*.94,x,h*level/4,0,anodized);
   part('bracket join',.027,.026,.033,x,h*level/4,-depth*.42,bright);
  }
 }
 for(const zsign of [-1,1]){
  const z=zsign*depth/2;
  part('horizontal roof rail',w+.10,.021,.024,0,h+.015,z,anodized);
  part('horizontal base rail',w+.10,.021,.024,0,.004,z,anodized);
 }
}
