import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, FlipHorizontal, Zap, Bug, Leaf, Target, Crosshair, Scan } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { DetectionService } from '@/services/DetectionService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import { HolographicCard } from '@/components/HolographicCard';
import { PulsingButton } from '@/components/PulsingButton';
import { ScanningOverlay } from '@/components/ScanningOverlay';
import { ParticleExplosion } from '@/components/ParticleExplosion';

const { width, height } = Dimensions.get('window');

type DetectionType = 'disease' | 'pest';
type CropType = 'tomato' | 'pepper' | 'corn' | 'wheat' | 'other';

export default function CameraTab() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedDetectionType, setSelectedDetectionType] = useState<DetectionType>('disease');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('tomato');
  const [showExplosion, setShowExplosion] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  const scanAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const detectionTypes = [
    { key: 'disease' as DetectionType, label: '🦠 DISEASE', icon: Leaf, color: '#ff0040' },
    { key: 'pest' as DetectionType, label: '🐛 PEST', icon: Bug, color: '#ff6b00' },
  ];

  const cropTypes = [
    { key: 'tomato' as CropType, label: '🍅 TOMATO' },
    { key: 'pepper' as CropType, label: '🌶️ PEPPER' },
    { key: 'corn' as CropType, label: '🌽 CORN' },
    { key: 'wheat' as CropType, label: '🌾 WHEAT' },
    { key: 'other' as CropType, label: '🌱 OTHER' },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('🚨 ACCESS DENIED', 'Camera roll permissions required for AI analysis!');
      }
    })();
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <HolographicCard style={styles.permissionCard} intensity={100}>
            <View style={styles.permissionContent}>
              <CameraIcon size={80} color="#00ff41" />
              <Text style={styles.permissionTitle}>🚀 CAMERA ACCESS REQUIRED</Text>
              <Text style={styles.permissionText}>
                Enable camera to unleash AI-powered plant detection technology! 🤖
              </Text>
              <PulsingButton
                title="🔓 GRANT ACCESS"
                onPress={requestPermission}
                variant="primary"
                size="large"
                style={styles.permissionButton}
              />
            </View>
          </HolographicCard>
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
        setShowExplosion(true);
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCapturedImage(photo.uri);
        }
        setTimeout(() => setShowExplosion(false), 500);
      } catch (error) {
        Alert.alert('🚨 CAPTURE FAILED', 'Unable to capture image. Try again!');
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
      Alert.alert('🚨 IMPORT FAILED', 'Unable to import image from gallery!');
      console.error(error);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setScanProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const result = await DetectionService.analyzeImage(
        capturedImage,
        selectedDetectionType,
        selectedCrop
      );
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setTimeout(() => {
        setAnalysisResult(result);
        setShowExplosion(true);
        setTimeout(() => setShowExplosion(false), 1000);
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      Alert.alert('🚨 ANALYSIS FAILED', error.message || 'AI analysis failed. Try again!');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setScanProgress(0);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setScanProgress(0);
  };

  const getSeverityColor = (severity: string) => {
    return DetectionService.getSeverityColor(severity);
  };

  const animatedScanFrameStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseAnimation.value,
      [0, 0.5, 1],
      [1, 1.05, 1]
    );

    const opacity = interpolate(
      pulseAnimation.value,
      [0, 0.5, 1],
      [0.8, 1, 0.8]
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.reviewContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.8)', 'transparent', 'rgba(0, 0, 0, 0.8)']}
              style={styles.imageOverlay}
            />
            <TouchableOpacity style={styles.retakeButton} onPress={resetCamera}>
              <Text style={styles.retakeButtonText}>🔄 RETAKE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectionContainer}>
            <HolographicCard style={styles.selectionCard} intensity={70}>
              <Text style={styles.selectionTitle}>🎯 DETECTION MODE</Text>
              <View style={styles.typeSelector}>
                {detectionTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeButton,
                        selectedDetectionType === type.key && styles.typeButtonActive
                      ]}
                      onPress={() => setSelectedDetectionType(type.key)}
                    >
                      <IconComponent 
                        size={20} 
                        color={selectedDetectionType === type.key ? '#ffffff' : type.color} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        selectedDetectionType === type.key && styles.typeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.selectionTitle}>🌱 CROP TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelector}>
                {cropTypes.map((crop) => (
                  <TouchableOpacity
                    key={crop.key}
                    style={[
                      styles.cropButton,
                      selectedCrop === crop.key && styles.cropButtonActive
                    ]}
                    onPress={() => setSelectedCrop(crop.key)}
                  >
                    <Text style={[
                      styles.cropButtonText,
                      selectedCrop === crop.key && styles.cropButtonTextActive
                    ]}>
                      {crop.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </HolographicCard>
          </View>

          <View style={styles.analyzeContainer}>
            <PulsingButton
              title={isAnalyzing ? '🔍 AI ANALYZING...' : '⚡ UNLEASH AI'}
              onPress={analyzeImage}
              variant="primary"
              size="large"
              disabled={isAnalyzing}
              style={styles.analyzeButton}
              icon={isAnalyzing ? <ActivityIndicator size="small" color="#ffffff" /> : <Zap size={24} color="#ffffff" />}
            />
          </View>

          {isAnalyzing && (
            <ScanningOverlay isScanning={true} progress={scanProgress / 100} />
          )}

          {analysisResult && (
            <View style={styles.resultContainer}>
              <HolographicCard style={styles.resultCard} intensity={90}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>🎉 AI ANALYSIS COMPLETE</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>SUCCESS</Text>
                  </View>
                </View>

                <View style={styles.resultContent}>
                  <Text style={styles.detectionName}>
                    🔬 {analysisResult.result.name.toUpperCase()}
                  </Text>
                  <Text style={styles.scientificName}>
                    📋 {analysisResult.result.scientific_name}
                  </Text>
                  
                  <View style={styles.statusRow}>
                    <View style={styles.severityContainer}>
                      <View style={[styles.severityDot, { backgroundColor: getSeverityColor(analysisResult.result.severity) }]} />
                      <Text style={styles.severityText}>
                        THREAT LEVEL: {analysisResult.result.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.confidenceText}>
                      🎯 {analysisResult.result.confidence}% ACCURACY
                    </Text>
                  </View>

                  <Text style={styles.description}>{analysisResult.result.description}</Text>

                  {analysisResult.result.symptoms.length > 0 && (
                    <View style={styles.symptomsSection}>
                      <Text style={styles.sectionTitle}>⚠️ SYMPTOMS DETECTED</Text>
                      {analysisResult.result.symptoms.map((symptom: string, index: number) => (
                        <Text key={index} style={styles.symptomText}>🔸 {symptom}</Text>
                      ))}
                    </View>
                  )}

                  {analysisResult.result.treatments.organic.length > 0 && (
                    <View style={styles.treatmentsSection}>
                      <Text style={styles.sectionTitle}>🌿 ORGANIC SOLUTIONS</Text>
                      {analysisResult.result.treatments.organic.map((treatment: any, index: number) => (
                        <HolographicCard key={index} style={styles.treatmentCard} intensity={50}>
                          <Text style={styles.treatmentName}>💊 {treatment.name}</Text>
                          <Text style={styles.treatmentDetail}>📏 Dosage: {treatment.dosage}</Text>
                          <Text style={styles.treatmentDetail}>⏰ Frequency: {treatment.frequency}</Text>
                          <Text style={styles.treatmentSafety}>✅ Safety: {treatment.safety}</Text>
                        </HolographicCard>
                      ))}
                    </View>
                  )}
                </View>
              </HolographicCard>
            </View>
          )}
        </ScrollView>

        <ParticleExplosion
          trigger={showExplosion}
          centerX={width / 2}
          centerY={height / 2}
          particleCount={40}
          colors={['#00ff41', '#ffd700', '#00d4ff']}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraHeader}>
        <HolographicCard style={styles.headerCard} intensity={80}>
          <Text style={styles.headerTitle}>🚀 AI PLANT SCANNER</Text>
          <Text style={styles.headerSubtitle}>POINT • SCAN • DETECT • TREAT</Text>
        </HolographicCard>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          {/* Futuristic Scanning Frame */}
          <Animated.View style={[styles.scanFrame, animatedScanFrameStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(0, 255, 65, 0.3)', 'transparent']}
              style={styles.scanFrameGradient}
            />
            <View style={styles.scanCorners}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.centerCrosshair}>
              <Crosshair size={32} color="#00ff41" />
            </View>
          </Animated.View>

          <Text style={styles.scanInstructions}>
            🎯 POSITION AFFECTED AREA IN CROSSHAIRS
          </Text>
        </CameraView>
      </View>

      {/* Futuristic Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
          <HolographicCard style={styles.controlCard} intensity={60}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }}
              style={styles.galleryPreview}
            />
          </HolographicCard>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <LinearGradient
            colors={['#00ff41', '#00cc33']}
            style={styles.captureGradient}
          >
            <View style={styles.captureInner}>
              <Scan size={32} color="#ffffff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <HolographicCard style={styles.controlCard} intensity={60}>
            <FlipHorizontal size={24} color="#00ff41" />
          </HolographicCard>
        </TouchableOpacity>
      </View>

      <ParticleExplosion
        trigger={showExplosion}
        centerX={width / 2}
        centerY={height / 2}
        particleCount={30}
        colors={['#00ff41', '#ffd700']}
      />
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
  permissionCard: {
    width: '100%',
  },
  permissionContent: {
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.9,
  },
  permissionButton: {
    minWidth: 200,
  },
  cameraHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCard: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#00ff41',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanFrameGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ff41',
  },
  scanCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00ff41',
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  centerCrosshair: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructions: {
    position: 'absolute',
    bottom: 100,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ff41',
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
  },
  controlCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  retakeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ff41',
  },
  retakeButtonText: {
    color: '#00ff41',
    fontSize: 12,
    fontWeight: '700',
  },
  selectionContainer: {
    padding: 20,
  },
  selectionCard: {
    marginTop: 0,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginHorizontal: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0, 255, 65, 0.3)',
    borderColor: '#00ff41',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  typeButtonTextActive: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  cropSelector: {
    flexDirection: 'row',
  },
  cropButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginRight: 12,
  },
  cropButtonActive: {
    backgroundColor: 'rgba(0, 255, 65, 0.3)',
    borderColor: '#00ff41',
  },
  cropButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  cropButtonTextActive: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  analyzeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  analyzeButton: {
    width: '100%',
  },
  resultContainer: {
    margin: 20,
  },
  resultCard: {
    marginTop: 0,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  resultBadge: {
    backgroundColor: 'rgba(0, 255, 65, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ff41',
  },
  resultBadgeText: {
    fontSize: 10,
    color: '#00ff41',
    fontWeight: '700',
    letterSpacing: 1,
  },
  resultContent: {
    flex: 1,
  },
  detectionName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00ff41',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scientificName: {
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'italic',
    marginBottom: 20,
    opacity: 0.8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffd700',
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  symptomsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  symptomText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 6,
    opacity: 0.9,
  },
  treatmentsSection: {
    marginBottom: 24,
  },
  treatmentCard: {
    marginBottom: 12,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff41',
    marginBottom: 8,
  },
  treatmentDetail: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    opacity: 0.9,
  },
  treatmentSafety: {
    fontSize: 14,
    color: '#ffd700',
    fontStyle: 'italic',
    fontWeight: '600',
  },
});