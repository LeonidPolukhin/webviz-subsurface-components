export default `\
#version 300 es
#define SHADER_NAME axes2d-layer-vertex-shader

precision highp float;

in vec3 positions;

in vec2 vTexCoord;
out vec2 _vTexCoord;

void main(void) {
   _vTexCoord = vTexCoord;

   vec3 position_commonspace = project_position(positions);
   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));
}
`;
