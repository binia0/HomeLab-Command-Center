import {Scene,TransformNode,MeshBuilder,PBRMaterial,StandardMaterial,Color3,Mesh} from '@babylonjs/core';
/** Front rack trim and service-cable guides. Pure geometry; never blocks device picking. */
export function addRackPresentation(scene:Scene,parent:TransformNode,w:number,h:number,depth:number,units:number){
 const make=(name:string,c:string,emissive=false)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(c);m.specularColor=Color3.FromHexString('#35463d');if(emissive)m.emissiveColor=Color3.FromHexString(c).scale(.7);return m};
 const frame=make('rack graphite trim','#101915'),trim=make('rack silver screws','#68796d'),glow=make('rack green guide lights','#338a57',true),warm=make('warm power cable guide','#ef6a37',true),slots=make('rack vent slits','#020804');
 const part=(name:string,x:number,y:number,z:number,width:number,height:number,depthValue:number,mat:StandardMaterial)=>{
  const m=MeshBuilder.CreateBox(name,{width,height,depth:depthValue},scene);m.parent=parent;m.position.set(x,y,z);m.material=mat;m.isPickable=false;return m
 };
 for(const side of [-1,1]){
  const x=side*(w/2+.084);
  part('front vertical cable management enclosure',x,h/2,-depth/2-.045,.038,h*.98,.045,frame);
  // visible along edges at distance, but not opaque slabs over device faces
  part('front illuminated cable guide',side*(w/2+.105),h/2,-depth/2-.072,.0025,h*.94,.003,side<0?warm:glow);
  for(let u=0;u<units;u++){
   const y=(u+.5)*(h/units);
   part('cable guide slot '+side+'/'+u,x,y,-depth/2-.070,.028,.009,.003,slots);
   if(u%2===0)part('rack U reference '+side+'/'+u,side*(w/2+.042),y,-depth/2-.064,.007,.003,.004,trim);
  }
 }
 for(const side of [-1,1]){
  part('top rack cap',0,h+.026,side*depth/2,w+.13,.014,.027,frame);
  part('bottom rack boot',0,-.021,side*depth/2,w+.13,.02,.027,frame);
 }
 for(const y of [.016,h-.015]){
  for(const side of [-1,1])part('corner post fastener',side*(w/2+.042),y,-depth/2-.060,.008,.008,.006,trim);
 }
}
