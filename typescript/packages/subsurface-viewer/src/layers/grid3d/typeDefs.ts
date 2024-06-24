export type MeshType = {
    drawMode?: number;
    attributes: {
        positions: { value: Float32Array; size: number };
        TEXCOORD_0?: { value: Float32Array; size: number };
        normals: { value: Float32Array; size: number };
        properties: { value: Float32Array; size: number };
    };
    vertexCount: number;
};

export type MeshTypeLines = {
    drawMode: number;
    attributes: {
        positions: { value: Float32Array; size: number };
        indices: { value: Uint32Array; size: number };
    };
    vertexCount: number;
};

export type Material =
    | {
          ambient: number;
          diffuse: number;
          shininess: number;
          specularColor: [number, number, number];
      }
    | boolean;

export type WebWorkerParams = {
    points: Float32Array;
    polys: Uint32Array;
    properties: Float32Array | Uint16Array;
};

export type AttributesData = {
    trianglePositions: Float32Array;
    triangleNormals: Float32Array;
    triangleVertexCount: number;
    linePositions: Float32Array;
    lineIndices: Uint32Array;
    lineVertexCount: number;
    propertyValues: Float32Array;
    propertyValueRange: [number, number];
};
