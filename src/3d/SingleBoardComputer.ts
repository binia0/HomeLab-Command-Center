import {Scene,TransformNode,MeshBuilder,PBRMaterial,Color3} from '@babylonjs/core';
/** Compact single-board-computer assembly, not a full-width 19-inch server faceplate. */
export function renderSingleBoardComputer(scene:Scene,parent:TransformNode,id:string,rackWidth:number,height:number){
 const color=(hex:string)=>Color3.FromHexString(hex);
 const material=(suffix:string,hex:string,metallic=.25)=>{const m=new PBRMaterial(id+' '+suffix,scene);m.albedoColor=color(hex);m.metallic=metallic;m.roughness=.58;return m};
 const pcb=material('fiberglass PCB','#176746'),chip=material('chip','#171e20'),gold=material('contacts','#b99b59',.7),shell=material('port housing','#b7bec0',.8),black=material('socket','#11191b'),blue=material('usb liner','#196ba5');
 const w=Math.min(.085,rackWidth*.47),h=Math.min(.056,height*.75),z=-.067;
 const box=(n:string,bw:number,bh:number,bd:number,x:number,y:number,bz:number,mat:PBRMaterial)=>{const m=MeshBuilder.CreateBox(id+' '+n,{width:bw,height:bh,depth:bd},scene);m.position.set(x,y,bz);m.parent=parent;m.material=mat;m.metadata={id};return m};
 box('PCB',w,h,.003,0,0,z,pcb);
 for(const dx of [-1,1])for(const dy of [-1,1])box('mounting eyelet',.005,.005,.004,dx*w*.42,dy*h*.38,z-.004,gold);
 box('SoC',w*.22,h*.32,.007,-w*.07,0,z-.006,chip);
 box('RAM',w*.16,h*.28,.006,w*.19,-h*.08,z-.006,chip);
 box('Ethernet jack shield',w*.21,h*.38,.015,w*.35,h*.18,z-.011,shell);
 box('Ethernet jack opening',w*.13,h*.22,.002,w*.35,h*.18,z-.020,black);
 for(let j=0;j<2;j++){box('USB housing '+j,w*.17,h*.17,.012,w*.35,-h*.14-j*h*.19,z-.009,shell);box('USB cavity '+j,w*.11,h*.09,.002,w*.35,-h*.14-j*h*.19,z-.016,blue)}
 box('GPIO header',w*.55,h*.085,.008,-w*.12,h*.34,z-.008,black);
 for(let j=0;j<14;j++)box('GPIO pin '+j,.0018,.002,.002,-w*.36+j*w*.037,h*.34,z-.014,gold);
 for(let j=0;j<9;j++)box('surface mount capacitor '+j,.003,.003,.002,-w*.36+(j%5)*w*.13,-h*.29+Math.floor(j/5)*h*.11,z-.006,j%3?chip:gold);
}
