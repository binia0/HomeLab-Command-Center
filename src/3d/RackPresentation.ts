import {Scene,TransformNode,MeshBuilder,PBRMaterial,StandardMaterial,Color3,Mesh} from '@babylonjs/core';
/** Front rack trim and service-cable guides. Pure geometry; never blocks device picking. */
export function addRackPresentation(scene:Scene,parent:TransformNode,w:number,h:number,depth:number,units:number){
 const make=(name:string,c:string,emissive=false)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(c);m.specularColor=Color3.FromHexString('#354a61');if(emissive)m.emissiveColor=Color3.FromHexString(c).scale(.7);return m};
 // Thin metallic rails and non-pickable illumination, without front glass obscuring sockets.
 const electric=make('indicator cyan','#379bff',true);
 const frame=make('rack graphite trim','#111a27'),trim=make('rack silver screws','#77889a'),glow=make('rack green guide lights','#146fc6',true),warm=make('warm power cable guide','#d48e42',true),slots=make('rack vent slits','#020711');
 const part=(name:string,x:number,y:number,z:number,width:number,height:number,depthValue:number,mat:StandardMaterial)=>{
  const m=MeshBuilder.CreateBox(name,{width,height,depth:depthValue},scene);m.parent=parent;m.position.set(x,y,z);m.material=mat;m.isPickable=false;return m
 };
 // Recessed blue datacenter lighting: strips live behind the face and cannot steal input.
 const rimBlue=make('recessed blue LED wash','#1764b5',true);
 const blackTrim=make('anodized structural extrusion','#131f2b');
 const gold=make('warm service bay accent','#a66b35',true);
 for(const side of [-1,1]){
  part('rear interior LED strip '+side,side*(w/2+.015),h/2,-depth/2+.065,.003,h*.94,.006,rimBlue);
  part('polished front rail edge '+side,side*(w/2+.023),h/2,-depth/2-.078,.003,h*.99,.005,trim);
  for(let level=0;level<units;level+=2){
   const yy=(level+.5)*h/units;
   part('rail bay cutout '+side+' '+level,side*(w/2+.024),yy,-depth/2-.081,.013,.009,.004,blackTrim);
  }
 }
 for(const zz of [-1,1]){
  part('illuminated top recess '+zz,0,h-.012,zz*depth*.25,w*.79,.004,.006,zz===1?gold:rimBlue);
 }
 // Decorative internal roof structure and side panel perforations, never obstructing device picking.
 const enclosure=make('rack inner wall','#0a111d'),edge=make('brushed rack edge','#344357');
 for(const side of [-1,1]){
  const x=side*(w/2+.059);
  for(let u=0;u<units;u++){
   const y=(u+.5)*h/units;
   for(let row=0;row<3;row++){
    part('side cage vent '+side+' '+u+' '+row,x,y+(row-1)*h/units*.22,-depth*.16,.0026,.003,depth*.16,row===1?enclosure:edge);
   }
  }
 }
 for(const z of [-1,1])part('roof shadow lattice',0,h+.036,z*depth*.22,w*.91,.004,depth*.16,enclosure);
 for(const side of [-1,1]){
  // Paired rows of rack-mounted device bay ticks remain visible when the frame is populated.
  for(let u=0;u<units;u++){
   const yy=(u+.5)*h/units;
   part('unit tick '+side+' '+u,side*(w/2+.032),yy,-depth/2-.09,.003,.003,.003,u%5===0?electric:trim);
  }
 }
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
 // Dense hardware-rack details: inset rail strips, segmented LEDs and visible U engravings.
 const brass=make('rack amber signaling','#e9a34a',true);
 const plate=make('rack mounting shadow','#07111b');
 for(const side of [-1,1]){
  const xx=side*(w/2+.049);
  part('front black aluminium extrusion',xx,h/2,-depth/2-.083,.013,h*.985,.013,plate);
  for(let u=0;u<units;u++){
   const cy=(u+.5)*(h/units);
   part('front rack precise U line '+u+' '+side,xx,cy,-depth/2-.092,.009,.0012,.002,trim);
   if(u%4===0)part('rail green service LED '+u+' '+side,side*(w/2+.097),cy,-depth/2-.095,.004,.005,.003,side===-1?brass:glow);
   for(let n=-1;n<=1;n++){
    part('rail punched U hole '+u+' '+n+' '+side,xx,cy+n*(h/units)*.27,-depth/2-.094,.003,.003,.002,slots);
   }
  }
 }

}
