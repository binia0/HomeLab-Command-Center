import { S as ShaderStore } from "./main-CFV-7JOD.js";
import "./network-CuG69UkU.js";
const name = "oitFinalSimpleBlendPixelShader";
const shader = `precision highp float;uniform sampler2D uFrontColor;void main() {ivec2 fragCoord=ivec2(gl_FragCoord.xy);vec4 frontColor=texelFetch(uFrontColor,fragCoord,0);glFragColor=frontColor;}
`;
if (!ShaderStore.ShadersStore[name]) {
  ShaderStore.ShadersStore[name] = shader;
}
const oitFinalSimpleBlendPixelShader = { name, shader };
export {
  oitFinalSimpleBlendPixelShader
};
