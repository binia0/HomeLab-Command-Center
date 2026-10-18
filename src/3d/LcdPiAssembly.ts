import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3,StandardMaterial,DynamicTexture,Mesh} from '@babylonjs/core';
/** Physical single assembly: LCD face and Pi PCB are one rack object. */
export function renderLcdPi(scene:Scene,root:TransformNode,id:string,width:number,height:number){
 const paint=(name:string,hex:string)=>{const m=new PBRMaterial(id+' '+name,scene);m.albedoColor=Color3.FromHexString(hex);m.metallic=.35;m.roughness=.45;return m};
 const black=paint('LCD housing','#101714'),green=paint('pi PCB','#176c49'),chip=paint('silicon','#1b2922'),silver=paint('connector','#9da8a2');
 const box=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:PBRMaterial)=>{const m=MeshBuilder.CreateBox(id+' '+name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=mat;m.metadata={id};return m};
 const w=Math.min(width*.69,.192),h=Math.min(height*.76,.073);
 box('LCD frame',w,h,.015,0,0,-.074,black);
 const tex=new DynamicTexture(id+' LCD telemetry',{width:512,height:256},scene,false),c=tex.getContext();
 c.fillStyle='#07120b';c.fillRect(0,0,512,256);c.fillStyle='#68f39c';c.font='bold 30px monospace';c.fillText('RACK MONITOR',18,46);
 for(let i=0;i<4;i++){c.fillStyle=i%2?'#193d29':'#2a6740';c.fillRect(20,70+i*39,390,18);c.fillStyle='#adf7c3';c.fillRect(20,70+i*39,120+i*57,18)}
 tex.update();const mat=new StandardMaterial(id+' LCD screen',scene);mat.diffuseTexture=tex;mat.emissiveColor=new Color3(.38,.45,.38);mat.backFaceCulling=false;
 const screen=MeshBuilder.CreatePlane(id+' LCD active image',{width:w*.9,height:h*.83,sideOrientation:Mesh.DOUBLESIDE},scene);screen.parent=root;screen.position.set(0,0,-.083);screen.material=mat;screen.metadata={id};
 // Rear-side Pi electronics belong to the same parent device, no independent rack U allocation.
 box('integrated Raspberry Pi PCB',w*.44,h*.65,.004,0,0,.018,green);
 box('Pi processor',w*.12,h*.22,.006,-w*.07,0,.013,chip);
 box('Pi ethernet',w*.12,h*.2,.012,w*.13,h*.10,.009,silver);
 box('Pi power connector',w*.09,h*.13,.012,-w*.14,-h*.2,.009,silver);
}
