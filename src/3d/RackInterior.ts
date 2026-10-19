import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3,Vector3,SpotLight,PointLight} from '@babylonjs/core';

/** Interior-only 3D staging. Independent of faceplates, ports and the management UI. */
export function buildRackInterior(scene:Scene,root:TransformNode,w:number,h:number,depth:number,occupied:Array<{u:number;height:number}>) {
 const metal=(name:string,hex:string,roughness=.48)=>{
  const m=new PBRMaterial(name,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=.84;m.roughness=roughness;return m;
 };
 const graphite=metal('interior powder coated graphite','#18232f',.7);
 const shadow=metal('open rack internal shadow','#080f19',.92);
 const aluminum=metal('brushed interior steel','#4e6278',.35);
 const rib=metal('rubber isolation mounts','#0b141e',.87);
 const stage=(name:string,ww:number,hh:number,dd:number,x:number,y:number,z:number,material:PBRMaterial)=>{
  const mesh=MeshBuilder.CreateBox(name,{width:ww,height:hh,depth:dd},scene);
  mesh.parent=root;mesh.position.set(x,y,z);mesh.material=material;mesh.isPickable=false;mesh.receiveShadows=true;return mesh;
 };
 // The rear surface sits behind the device bodies, giving real parallax without masking fronts.
 // Open center for rear-mounted equipment and back-side cable inspection.
 for(const side of [-1,1]){
  stage('recessed rear cavity side panel '+side,w*.115,h*.94,.009,side*w*.432,h*.5,depth*.45,shadow);
 }
 // Rear structural uprights, visible in the gaps between distinct rack components.
 for(const side of [-1,1]){
  stage('deep interior rear pillar '+side,.022,h*.97,.043,side*w*.44,h*.5,depth*.39,graphite);
  stage('long satin metal inside runner '+side,.004,h*.93,depth*.62,side*w*.438,h*.5,0,aluminum);
  stage('side cavity shadow '+side,.008,h*.94,depth*.77,side*w*.493,h*.5,.013,shadow);
  for(let level=0;level<Math.floor(h/.04445);level+=3){
   const y=(level+.5)*.04445;
   if(y>h-.025)break;
   stage('cable management carrier '+side+' '+level,.018,.008,depth*.26,side*w*.44,y,-depth*.20,rib);
  }
 }
 // Structural shelves occur only in empty rack units, not intersecting the installed devices.
 const unit=.04445,units=Math.round(h/unit);
 for(let u=1;u<units;u++){
  if(occupied.some(d=>u>=d.u-1&&u<=d.u-1+d.height))continue;
  if(u%3!==0)continue;
  const y=u*unit;
  stage('recessed horizontal interior tray '+u,w*.80,.003,depth*.72,0,y,depth*.065,graphite);
  stage('tray steel forward edge '+u,w*.80,.003,.007,0,y,-depth*.30,aluminum);
 }
 // Practical work light is inside the cage; it changes the entire 3D depth impression.
 for(const side of [-1,1]){
  const lamp=new PointLight('rack interior blue area light '+side,new Vector3(side*w*.40,h*.72,-depth*.22),scene);
  lamp.diffuse=Color3.FromHexString('#3287dc');lamp.intensity=.23;lamp.range=Math.max(.65,h*.9);lamp.parent=root;
 }
 const lamp=new SpotLight('rack warm overhead downlight',new Vector3(-w*.12,h-.025,-depth*.1),new Vector3(.12,-1,.24),Math.PI*.55,2,scene);
 lamp.diffuse=Color3.FromHexString('#ffe0b5');lamp.intensity=1.1;lamp.range=Math.max(.8,h*1.15);lamp.parent=root;
}
