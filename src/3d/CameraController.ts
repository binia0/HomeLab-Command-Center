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
 cancel(){this.target=null;this.alpha=null;this.beta=null;this.radius=this.camera.radius}
 focus(point:Vector3,distance:number,side:'front'|'back'|'orbit'='orbit'){
  this.target=point.clone();this.radius=Math.max(.25,distance);
  if(side==='front')this.alpha=-Math.PI/2;
  if(side==='back')this.alpha=Math.PI/2;
  if(side==='orbit')this.alpha=this.camera.alpha;
  this.beta=side==='orbit'?this.camera.beta:Math.PI/2;
 }
 home(height:number,depth=.8){
  // Reference view: rack fills the viewport WIDTH, not the full height.
  // The rack may extend above/below the visible area; users can pan vertically.
  const engine=this.camera.getEngine();
  const aspect=engine.getRenderWidth()/Math.max(1,engine.getRenderHeight());
  const horizontalFov=2*Math.atan(Math.tan(this.camera.fov/2)*aspect);
  const rackHalfWidth=.4826/2; // 19-inch rack outer width; do not derive width from depth.
  // Aim at the front plane so the perspective scales from its visible face.
  this.target=new Vector3(0,height*.5,-depth*.5);
  this.radius=Math.max(.34,rackHalfWidth/(Math.tan(horizontalFov/2)*.42));
  // Camera slightly to the LEFT: the RIGHT rack corner recedes a little.
  this.alpha=-Math.PI/2-.10;
  this.beta=Math.PI/2.10;
 }
 view(side:'front'|'back'|'orbit'){this.alpha=side==='front'?-Math.PI/2-.10:side==='back'?Math.PI/2-.13:-Math.PI/2-.10;this.beta=side==='orbit'?Math.PI/2.12:Math.PI/2.06}
 tick(){
  const k=.12;
  if(this.target){this.camera.setTarget(Vector3.Lerp(this.camera.target,this.target,k));this.camera.radius+=(this.radius-this.camera.radius)*k;if(Vector3.Distance(this.camera.target,this.target)<.0002&&Math.abs(this.camera.radius-this.radius)<.0002)this.target=null}
  if(this.alpha!==null){let delta=this.alpha-this.camera.alpha;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;this.camera.alpha+=delta*k;if(Math.abs(delta)<.001)this.alpha=null}
  if(this.beta!==null){this.camera.beta+=(this.beta-this.camera.beta)*k;if(Math.abs(this.beta-this.camera.beta)<.001)this.beta=null}
 }
}
