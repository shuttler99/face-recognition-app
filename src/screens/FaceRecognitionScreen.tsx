import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useFaceRecognition } from '../hooks/useFaceRecognition';
import { FaceImage } from '../components/FaceImage';
import { ActionButton } from '../components/ActionButton';

export const FaceRecognitionScreen: React.FC = () => {
  const {
    refFaceUri,
    userFaceUri,
    loading,
    hasReference,
    pickReferenceImage,
    pickUserImage,
    captureFromCamera,
    reset,
    clearUserFace,
  } = useFaceRecognition();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>🧠</Text>
          <Text style={styles.title}>Face Recognition</Text>
          <Text style={styles.subtitle}>AI-Powered Face Matching</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 1: Set Reference</Text>
          <ActionButton
            title="Select Reference Image"
            onPress={pickReferenceImage}
            icon="📷"
            loading={loading && !hasReference}
          />
          {refFaceUri && <FaceImage uri={refFaceUri} label="Reference Face" />}
        </View>

        {hasReference && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 2: Compare Face</Text>
            <ActionButton
              title="Select from Gallery"
              onPress={pickUserImage}
              disabled={loading}
              variant="secondary"
              icon="🖼️"
            />
            <ActionButton
              title="Capture with Camera"
              onPress={captureFromCamera}
              disabled={loading}
              variant="secondary"
              icon="📸"
            />
            {userFaceUri && <FaceImage uri={userFaceUri} label="Comparison Face" />}
          </View>
        )}

        {(refFaceUri || userFaceUri) && (
          <View style={styles.actions}>
            {userFaceUri && (
              <ActionButton
                title="Try Another Match"
                onPress={clearUserFace}
                disabled={loading}
                variant="secondary"
              />
            )}
            <ActionButton
              title="Reset All"
              onPress={reset}
              disabled={loading}
              variant="danger"
              icon="🔄"
            />
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  actions: {
    marginTop: 8,
  },
});
