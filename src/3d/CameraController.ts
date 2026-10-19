import {ArcRotateCamera,Vector3} from '@babylonjs/core';
export class CameraController {
 private target:Vector3|null=null;
 private radius=1;
 private alpha:number|null=null;
 private beta:number|null=null;
 constructor(private camera:ArcRotateCamera){
  // Direct mouse/wheel interactions always win over pending animated framing.
  camera.onViewMatrixChangedObservable.add(()=>{
   if(camera.inertialRadiusOffset!==0||camera.inertialAlphaOffset!==0||camera.inertialBetaOffset!==0){
    this.target=null;this.alpha=null;this.beta=null;
   }
  });
 }
 focus(point:Vector3,distance:number,side:'front'|'back'|'orbit'='orbit'){
  this.target=point.clone();this.radius=Math.max(.25,distance);
  if(side==='front')this.alpha=-Math.PI/2;
  if(side==='back')this.alpha=Math.PI/2;
  if(side==='orbit')this.alpha=this.camera.alpha;
  this.beta=side==='orbit'?this.camera.beta:Math.PI/2;
 }
 home(height:number,depth=.8){
  // Frame the whole 3D rack, including its top and feet, at any canvas aspect ratio.
  const engine=this.camera.getEngine(),size=engine.getRenderWidth()/Math.max(1,engine.getRenderHeight());
  const vfov=this.camera.fov;
  const hfov=2*Math.atan(Math.tan(vfov/2)*size);
  const halfHeight=height*.56,halfWidth=Math.max(.34,depth*.53);
  const fitVertical=halfHeight/Math.tan(vfov/2);
  const fitHorizontal=halfWidth/Math.tan(Math.max(.1,hfov)/2);
  this.target=new Vector3(0,height*.5,0);
  this.radius=Math.max(depth*.63+.3,fitVertical,fitHorizontal)*1.10;
  this.alpha=-Math.PI/2+.30;
  this.beta=Math.PI/2.10;
 }
 view(side:'front'|'back'|'orbit'){this.alpha=side==='front'?-Math.PI/2+.13:side==='back'?Math.PI/2-.13:-Math.PI/2+.42;this.beta=side==='orbit'?Math.PI/2.12:Math.PI/2.06}
 tick(){
  const k=.12;
  if(this.target){this.camera.setTarget(Vector3.Lerp(this.camera.target,this.target,k));this.camera.radius+=(this.radius-this.camera.radius)*k;if(Vector3.Distance(this.camera.target,this.target)<.0002&&Math.abs(this.camera.radius-this.radius)<.0002)this.target=null}
  if(this.alpha!==null){let delta=this.alpha-this.camera.alpha;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;this.camera.alpha+=delta*k;if(Math.abs(delta)<.001)this.alpha=null}
  if(this.beta!==null){this.camera.beta+=(this.beta-this.camera.beta)*k;if(Math.abs(this.beta-this.camera.beta)<.001)this.beta=null}
 }
}
