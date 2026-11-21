"use client";

import { wrapEffect } from "@react-three/postprocessing";
import { BlendFunction, Effect } from "postprocessing";
import * as THREE from "three";

// Blood-red neon grade over the whole frame: shadows stay black, midtones go crimson, highlights hot pink-white.
// Natural colour is kept at (1 - amount) so signage and skin still read.
const frag = /* glsl */ `
uniform float amount;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = max(inputColor.rgb, 0.0);
  float l = pow(dot(c, vec3(0.2126, 0.7152, 0.0722)), 0.4545); // perceptual luminance
  vec3 duo = mix(vec3(0.02, 0.0, 0.01), vec3(0.78, 0.03, 0.1), smoothstep(0.0, 0.5, l));
  duo = mix(duo, vec3(1.0, 0.78, 0.8), smoothstep(0.5, 1.0, l));
  outputColor = vec4(mix(c, pow(duo, vec3(2.2)), amount), inputColor.a);
}`;

class CrimsonGradeEffect extends Effect {
  constructor({ amount = 0.6 } = {}) {
    super("CrimsonGrade", frag, { blendFunction: BlendFunction.NORMAL, uniforms: new Map([["amount", new THREE.Uniform(amount)]]) });
  }
}

export const CrimsonGrade = wrapEffect(CrimsonGradeEffect);
