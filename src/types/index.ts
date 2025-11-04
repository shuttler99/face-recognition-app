export interface FaceEmbedding {
  data: Float32Array;
  uri: string;
}

export interface DetectionResult {
  embedding: Float32Array;
  faceUri: string;
}
