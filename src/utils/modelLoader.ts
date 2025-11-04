import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { MODEL_NAME } from '../constants';

export const loadONNXModel = async (): Promise<ort.InferenceSession> => {
  try {
    const modelPath = `${RNFS.DocumentDirectoryPath}/${MODEL_NAME}`;
    
    if (!(await RNFS.exists(modelPath))) {
      await RNFS.copyFileAssets(MODEL_NAME, modelPath);
    }
    
    const session = await ort.InferenceSession.create(modelPath);
    console.log('✅ ONNX model loaded');
    return session;
  } catch (err) {
    console.error('❌ Model load failed', err);
    throw err;
  }
};
