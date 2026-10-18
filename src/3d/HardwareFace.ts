import {Scene,TransformNode,MeshBuilder,StandardMaterial,DynamicTexture,Color3,Mesh} from '@babylonjs/core';

const label=(v:string)=>v.trim().slice(0,30).toUpperCase();
export function addHardwareFace(scene:Scene,parent:TransformNode,details:{
 id:string;name:string;category?:string;model?:string;manufacturer?:string;ip?:string;
},width:number,height:number){
 if(height<.025)return;
 const canvas=new DynamicTexture('front identity '+details.id,{width:1024,height:256},scene,false);
 const ctx=canvas.getContext();
 ctx.fillStyle='#111b17';ctx.fillRect(0,0,1024,256);
 ctx.fillStyle='#4be592';ctx.fillRect(0,0,8,256);
 ctx.fillStyle='#a3c3b0';ctx.font='500 25px monospace';ctx.fillText(label(details.manufacturer||details.category||'HOMELAB'),32,46);
 ctx.fillStyle='#effcf2';ctx.font='bold 51px monospace';ctx.fillText(label(details.name),32,117);
 ctx.fillStyle='#83c8a0';ctx.font='28px monospace';ctx.fillText(label(details.model||details.ip||'RACK HARDWARE'),32,161);
 ctx.fillStyle='#182e20';ctx.fillRect(28,192,825,3);
 ctx.fillStyle='#47ce79';for(let i=0;i<7;i++)ctx.fillRect(34+i*20,211,11,12);
 ctx.fillStyle='#bcdac6';ctx.font='22px monospace';ctx.fillText('RACK DEVICE  /  '+label(details.category||'CUSTOM'),32,249);
 canvas.update();
 const material=new StandardMaterial('device label material '+details.id,scene);
 material.diffuseTexture=canvas;material.emissiveColor=new Color3(.38,.42,.38);material.backFaceCulling=false;
 const image=MeshBuilder.CreatePlane('readable device identity '+details.id,{width:width*.48,height:Math.min(height*.43,width*.48*.25),sideOrientation:Mesh.DOUBLESIDE},scene);
 image.parent=parent;image.position.set(-width*.19,height*.11,-.096);image.material=material;image.metadata={id:details.id};
 image.isPickable=true;
 return image;
}
