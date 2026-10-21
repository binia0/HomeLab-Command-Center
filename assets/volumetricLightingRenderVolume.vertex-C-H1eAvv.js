import { S as ShaderStore } from "./main-CFV-7JOD.js";
import "./network-CuG69UkU.js";
const name = "volumetricLightingRenderVolumeVertexShader";
const shader = `#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute position : vec3f;varying vWorldPos: vec4f;@vertex
fn main(input : VertexInputs)->FragmentInputs {let worldPos=mesh.world*vec4f(vertexInputs.position,1.0);vertexOutputs.vWorldPos=worldPos;vertexOutputs.position=scene.viewProjection*worldPos;}
`;
if (!ShaderStore.ShadersStoreWGSL[name]) {
  ShaderStore.ShadersStoreWGSL[name] = shader;
}
const volumetricLightingRenderVolumeVertexShaderWGSL = { name, shader };
export {
  volumetricLightingRenderVolumeVertexShaderWGSL
};
