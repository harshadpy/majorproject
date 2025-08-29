import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, FlipHorizontal, Zap, Bug, Leaf, ArrowRight, CircleCheck as CheckCircle, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { DetectionService } from '@/services/DetectionService';
import { useTheme } from '@/hooks/useTheme';

type DetectionType = 'disease' | 'pest';
type CropType = 'tomato' | 'pepper' | 'corn' | 'wheat' | 'other';

export default function CameraTab() {
  const { colors, isDark } = useTheme();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedDetectionType, setSelectedDetectionType] = useState<DetectionType>('disease');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('tomato');
  const cameraRef = useRef<CameraView>(null);

  const detectionTypes = [
    { key: 'disease' as DetectionType, label: 'Disease', icon: Leaf, color: colors.primary },
    { key: 'pest' as DetectionType, label: 'Pest', icon: Bug, color: colors.accent },
  ];

  const cropTypes = [
    { key: 'tomato' as CropType, label: 'Tomato' },
    { key: 'pepper' as CropType, label: 'Pepper' },
    { key: 'corn' as CropType, label: 'Corn' },
    { key: 'wheat' as CropType, label: 'Wheat' },
    { key: 'other' as CropType, label: 'Other' },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
          <CameraIcon size={64} color={colors.textMuted} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Permission Required</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            We need access to your camera to detect plant diseases and pests
          </Text>
          <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
            <Text style={[styles.permissionButtonText, { color: colors.background }]}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error(error);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await DetectionService.analyzeImage(
        capturedImage,
        selectedDetectionType,
        selectedCrop
      );
      setAnalysisResult(result);
    } catch (error: any) {
      Alert.alert('Analysis Failed', error.message || 'Please try again');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const getSeverityColor = (severity: string) => {
    return DetectionService.getSeverityColor(severity);
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={[styles.reviewContainer, { backgroundColor: colors.background }]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            <TouchableOpacity style={[styles.retakeButton, { backgroundColor: colors.card }]} onPress={resetCamera}>
              <Text style={[styles.retakeButtonText, { color: colors.text }]}>Retake</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.selectionContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.selectionTitle, { color: colors.text }]}>Detection Type</Text>
            <View style={styles.typeSelector}>
              {detectionTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton, 
                      { backgroundColor: colors.card, borderColor: colors.border },
                      selectedDetectionType === type.key && { backgroundColor: type.color }
                    ]}
                    onPress={() => setSelectedDetectionType(type.key)}
                  >
                    <IconComponent 
                      size={20} 
                      color={selectedDetectionType === type.key ? colors.background : type.color} 
                    />
                    <Text style={[
                      styles.typeButtonText, 
                      { color: colors.text },
                      selectedDetectionType === type.key && { color: colors.background }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.selectionTitle, { color: colors.text }]}>Crop Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelector}>
              {cropTypes.map((crop) => (
                <TouchableOpacity
                  key={crop.key}
                  style={[
                    styles.cropButton, 
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedCrop === crop.key && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCrop(crop.key)}
                >
                  <Text style={[
                    styles.cropButtonText, 
                    { color: colors.text },
                    selectedCrop === crop.key && { color: colors.background }
                  ]}>
                    {crop.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.analyzeButton, 
              { backgroundColor: colors.primary },
              isAnalyzing && { backgroundColor: colors.textMuted }
            ]}
            onPress={analyzeImage}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Zap size={20} color={colors.background} />
            )}
            <Text style={[styles.analyzeButtonText, { color: colors.background }]}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Plant'}
            </Text>
          </TouchableOpacity>

          {analysisResult && (
            <View style={[styles.resultContainer, { backgroundColor: colors.background }]}>
              <View style={styles.resultHeader}>
                <CheckCircle size={24} color={colors.primary} />
                <Text style={[styles.resultTitle, { color: colors.text }]}>Analysis Complete</Text>
              </View>

              <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
                <View style={styles.resultInfo}>
                  <Text style={[styles.detectionName, { color: colors.text }]}>{analysisResult.result.name}</Text>
                  <Text style={[styles.scientificName, { color: colors.textSecondary }]}>{analysisResult.result.scientific_name}</Text>
                  
                  <View style={styles.statusRow}>
                    <View style={styles.severityBadge}>
                      <View style={[styles.severityDot, { backgroundColor: getSeverityColor(analysisResult.result.severity) }]} />
                      <Text style={[styles.severityText, { color: colors.text }]}>
                        Severity: {analysisResult.result.severity}
                      </Text>
                    </View>
                    <Text style={[styles.confidenceText, { color: colors.text }]}>
                      Confidence: {analysisResult.result.confidence}%
                    </Text>
                  </View>

                  <Text style={[styles.description, { color: colors.textSecondary }]}>{analysisResult.result.description}</Text>

                  {analysisResult.result.symptoms.length > 0 && (
                    <View style={styles.symptomsSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Symptoms</Text>
                      {analysisResult.result.symptoms.map((symptom: string, index: number) => (
                        <Text key={index} style={[styles.symptomText, { color: colors.textSecondary }]}>• {symptom}</Text>
                      ))}
                    </View>
                  )}

                  {analysisResult.result.treatments.organic.length > 0 && (
                    <View style={styles.treatmentsSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Organic Treatments</Text>
                      {analysisResult.result.treatments.organic.map((treatment: any, index: number) => (
                        <View key={index} style={[styles.treatmentCard, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.treatmentName, { color: colors.text }]}>{treatment.name}</Text>
                          <Text style={[styles.treatmentDetail, { color: colors.textSecondary }]}>Dosage: {treatment.dosage}</Text>
                          <Text style={[styles.treatmentDetail, { color: colors.textSecondary }]}>Frequency: {treatment.frequency}</Text>
                          <Text style={[styles.treatmentSafety, { color: colors.primary }]}>Safety: {treatment.safety}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.cameraHeader, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Plant Detection</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Point camera at affected plant area</Text>
      </View>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <View style={[styles.scanFrame, { borderColor: colors.primary }]} />
          <Text style={[styles.scanInstructions, { color: colors.text }]}>
            Position the affected area within the frame
          </Text>
        </View>
      </CameraView>

      <View style={styles.cameraControls}>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]} onPress={pickImage}>
          <ImageIcon size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.captureButton, { backgroundColor: colors.primary }]} onPress={takePicture}>
          <View style={[styles.captureButtonInner, { backgroundColor: colors.background }]} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]} onPress={toggleCameraFacing}>
          <FlipHorizontal size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  cameraHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-SemiBold',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  reviewContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: 300,
  },
  retakeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeButtonText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  selectionContainer: {
    padding: 20,
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 12,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  cropSelector: {
    flexDirection: 'row',
  },
  cropButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  cropButtonText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
    marginLeft: 8,
  },
  resultContainer: {
    margin: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultInfo: {
    flex: 1,
  },
  detectionName: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  symptomsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 12,
  },
  symptomText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  treatmentsSection: {
    marginBottom: 20,
  },
  treatmentCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 4,
  },
  treatmentDetail: {
    fontSize: 13,
    marginBottom: 2,
    fontFamily: 'Inter-Regular',
  },
  treatmentSafety: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
});