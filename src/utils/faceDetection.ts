import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import FaceDetection from '@react-native-ml-kit/face-detection';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import { INPUT_WIDTH, INPUT_HEIGHT } from '../constants';
import { DetectionResult } from '../types';

export const detectAndExtractEmbedding = async (
  session: ort.InferenceSession,
  imgPath: string
): Promise<DetectionResult | null> => {
  try {
    const path = imgPath.startsWith('file://') ? imgPath : `file://${imgPath}`;
    const faces = await FaceDetection.detect(path);
    const face = faces?.[0];

    if (!face || !face.frame) {
      throw new Error('No face detected');
    }

    const { width, height, left, top } = face.frame;
    
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid bounding box');
    }

    const { default: ImageEditor } = await import('@react-native-community/image-editor');
    
    const crop = {
      offset: { x: left, y: top },
      size: { width, height },
      displaySize: { width: INPUT_WIDTH, height: INPUT_HEIGHT },
      resizeMode: 'contain' as 'contain',
    };

    const cropResult = await ImageEditor.cropImage(path, crop);
    const buf = await RNFS.readFile(cropResult.uri.replace('file://', ''), 'base64');
    const raw = jpeg.decode(Buffer.from(buf, 'base64'), { useTArray: true });

    const floatData = new Float32Array(INPUT_WIDTH * INPUT_HEIGHT * 3);
    
    for (let y = 0; y < INPUT_HEIGHT; y++) {
      for (let x = 0; x < INPUT_WIDTH; x++) {
        const idx = (y * INPUT_WIDTH + x) * 4;
        const r = raw.data[idx] / 255;
        const g = raw.data[idx + 1] / 255;
        const b = raw.data[idx + 2] / 255;
        const i = (y * INPUT_WIDTH + x) * 3;
        floatData[i] = r;
        floatData[i + 1] = g;
        floatData[i + 2] = b;
      }
    }

    const input = new ort.Tensor('float32', floatData, [1, INPUT_HEIGHT, INPUT_WIDTH, 3]);
    const output = await session.run({ image_input: input });
    
    return {
      embedding: output.Bottleneck_BatchNorm.data as Float32Array,
      faceUri: cropResult.uri,
    };
  } catch (err) {
    console.error('❌ Face detection failed:', err);
    return null;
  }
};

export const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (magA * magB);
};
