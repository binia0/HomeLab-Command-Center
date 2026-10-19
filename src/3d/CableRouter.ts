import {Vector3} from '@babylonjs/core';
export type CableEnd={point:Vector3;face:'front'|'rear'};
/** Routes cable trunks along the visible rack mounting rails, not far outside the chassis. */
export function routeRackCable(a:CableEnd,b:CableEnd,width:number,depth:number,lane:number):Vector3[]{
 const inset=.021+(lane%5)*.008;
 const side=(a.point.x+b.point.x)/2<0?-1:1;
 const gutter=side*(width*.5-inset);
 const front=-depth/2-.17-(lane%5)*.004,rear=depth/2+.11+(lane%5)*.004;
 const plane=(face:'front'|'rear')=>face==='rear'?rear:front;
 const exitA=new Vector3(a.point.x,a.point.y,plane(a.face));
 const exitB=new Vector3(b.point.x,b.point.y,plane(b.face));
 const channelA=new Vector3(gutter,a.point.y,plane(a.face));
 const channelB=new Vector3(gutter,b.point.y,plane(b.face));
 const points=[a.point,exitA,channelA];
 if(a.face!==b.face){
  // Front-to-rear transfers follow the side rail cable gutter.
  const transitionY=Math.max(.06,Math.min(a.point.y,b.point.y)-.035);
  points.push(new Vector3(gutter,transitionY,plane(a.face)));
  points.push(new Vector3(gutter,transitionY,plane(b.face)));
 }
 points.push(channelB,exitB,b.point);
 return points.filter((point,i,list)=>i===0||Vector3.DistanceSquared(point,list[i-1])>1e-9);
}
/** Rounded orthogonal corners with continuous cable sweep. */
export function softenCablePath(points:Vector3[],radius=.012):Vector3[]{
 if(points.length<3)return points;
 const result=[points[0]];
 for(let i=1;i<points.length-1;i++){
  const before=points[i-1],at=points[i],after=points[i+1];
  const incoming=at.subtract(before),outgoing=after.subtract(at);
  const incomingLength=incoming.length(),outgoingLength=outgoing.length();
  if(incomingLength<.001||outgoingLength<.001){result.push(at);continue}
  const amount=Math.min(radius,incomingLength*.2,outgoingLength*.2);
  const entry=at.subtract(incoming.normalize().scale(amount));
  const exit=at.add(outgoing.normalize().scale(amount));
  result.push(entry);
  for(let j=1;j<=4;j++){const t=j/5;result.push(Vector3.Lerp(Vector3.Lerp(entry,at,t),Vector3.Lerp(at,exit,t),t))}
  result.push(exit);
 }
 result.push(points[points.length-1]);
 return result;
}
