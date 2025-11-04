import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ort from 'onnxruntime-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { loadONNXModel } from '../utils/modelLoader';
import { detectAndExtractEmbedding, cosineSimilarity } from '../utils/faceDetection';
import { SIMILARITY_THRESHOLD } from '../constants';

export const useFaceRecognition = () => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [refEmbedding, setRefEmbedding] = useState<Float32Array | null>(null);
  const [refFaceUri, setRefFaceUri] = useState<string | null>(null);
  const [userFaceUri, setUserFaceUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadONNXModel()
      .then(setSession)
      .catch(err => Alert.alert('Error', 'Failed to load model'));
  }, []);

  const pickReferenceImage = async () => {
    if (!session) return;
    
    setLoading(true);
    setRefEmbedding(null);
    setRefFaceUri(null);
    setUserFaceUri(null);

    try {
      const res = await launchImageLibrary({ mediaType: 'photo' });
      const uri = res.assets?.[0]?.uri;

      if (!uri) throw new Error('No image selected');

      const result = await detectAndExtractEmbedding(session, uri);

      if (result) {
        setRefEmbedding(result.embedding);
        setRefFaceUri(result.faceUri);
      } else {
        Alert.alert('Error', 'No face detected in reference image.');
      }
    } catch (err) {
      console.error('❌ Reference image failed:', err);
      Alert.alert('Error', 'Failed to process reference image.');
    }

    setLoading(false);
  };

  const pickUserImage = async () => {
    if (!session || !refEmbedding) return;
    
    setLoading(true);
    setUserFaceUri(null);

    try {
      const res = await launchImageLibrary({ mediaType: 'photo' });
      const uri = res.assets?.[0]?.uri;

      if (!uri) throw new Error('No image selected');

      const result = await detectAndExtractEmbedding(session, uri);

      if (result) {
        setUserFaceUri(result.faceUri);
        const similarity = cosineSimilarity(result.embedding, refEmbedding);
        
        Alert.alert(
          similarity > SIMILARITY_THRESHOLD ? '✅ Face Matched' : '❌ Not Matched',
          `Similarity Score: ${similarity.toFixed(3)}`
        );
      } else {
        Alert.alert('Error', 'No face detected in source image.');
      }
    } catch (err) {
      console.error('❌ Source image failed:', err);
      Alert.alert('Error', 'Failed to process source image.');
    }

    setLoading(false);
  };

  const captureFromCamera = async () => {
    if (!session || !refEmbedding) return;
    
    setLoading(true);
    setUserFaceUri(null);

    try {
      const res = await launchCamera({ mediaType: 'photo' });
      const uri = res.assets?.[0]?.uri;

      if (!uri) throw new Error('No image captured');

      const result = await detectAndExtractEmbedding(session, uri);

      if (result) {
        setUserFaceUri(result.faceUri);
        const similarity = cosineSimilarity(result.embedding, refEmbedding);
        
        Alert.alert(
          similarity > SIMILARITY_THRESHOLD ? '✅ Face Matched' : '❌ Not Matched',
          `Similarity Score: ${similarity.toFixed(3)}`
        );
      } else {
        Alert.alert('Error', 'No face detected in source image.');
      }
    } catch (err) {
      console.error('❌ Camera capture failed:', err);
      Alert.alert('Error', 'Failed to process camera image.');
    }

    setLoading(false);
  };

  const reset = () => {
    setRefEmbedding(null);
    setRefFaceUri(null);
    setUserFaceUri(null);
  };

  const clearUserFace = () => {
    setUserFaceUri(null);
  };

  return {
    refFaceUri,
    userFaceUri,
    loading,
    hasReference: !!refEmbedding,
    pickReferenceImage,
    pickUserImage,
    captureFromCamera,
    reset,
    clearUserFace,
  };
};
