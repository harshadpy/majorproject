import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History as HistoryIcon, Calendar, CircleAlert as AlertCircle, CircleCheck as CheckCircle, TrendingUp, Filter, Trash2, RefreshCw } from 'lucide-react-native';
import { DetectionService } from '@/services/DetectionService';
import { StorageService, DetectionRecord } from '@/services/StorageService';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function HistoryTab() {
  const [detections, setDetections] = useState<DetectionRecord[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'disease' | 'pest'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetectionHistory = async () => {
    try {
      const history = await StorageService.getDetections();
      setDetections(history);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load detection history');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDetectionHistory();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetectionHistory();
  };

  const handleDeleteDetection = async (id: string) => {
    Alert.alert(
      'Delete Detection',
      'Are you sure you want to delete this detection record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteDetection(id);
              await loadDetectionHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete detection');
            }
          },
        },
      ]
    );
  };

  const handleClearAllHistory = async () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all detection records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadDetectionHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const filteredDetections = filterType === 'all' 
    ? detections 
    : detections.filter(detection => detection.type === filterType);

  const getStats = () => {
    const total = detections.length;
    const diseases = detections.filter(d => d.type === 'disease').length;
    const pests = detections.filter(d => d.type === 'pest').length;
    const highSeverity = detections.filter(d => d.result.severity.toLowerCase() === 'high').length;

    return { total, diseases, pests, highSeverity };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <RefreshCw size={32} color="#16a34a" />
          <Text style={styles.loadingText}>Loading detection history...</Text>
        </View>
      </SafeAreaView>
    );
    }

  const stats = getStats();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getSeverityColor = (severity: string) => {
    return DetectionService.getSeverityColor(severity);
  };

  const getSeverityIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    if (severity.toLowerCase() === 'low') return <CheckCircle size={16} color={color} />;
    return <AlertCircle size={16} color={color} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <HistoryIcon size={24} color="#16a34a" />
        <Text style={styles.headerTitle}>Detection History</Text>
        <TouchableOpacity onPress={onRefresh}>
          <RefreshCw size={20} color="#16a34a" />
        </TouchableOpacity>
      </Animatable.View>

      {/* Stats Overview */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.diseases}</Text>
          <Text style={styles.statLabel}>Diseases</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pests}</Text>
          <Text style={styles.statLabel}>Pests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.highSeverity}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </Animatable.View>

      {/* Filter Buttons */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'disease' && styles.filterButtonActive]}
          onPress={() => setFilterType('disease')}
        >
          <Text style={[styles.filterText, filterType === 'disease' && styles.filterTextActive]}>
            Diseases
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'pest' && styles.filterButtonActive]}
          onPress={() => setFilterType('pest')}
        >
          <Text style={[styles.filterText, filterType === 'pest' && styles.filterTextActive]}>
            Pests
          </Text>
        </TouchableOpacity>
        
        {detections.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAllHistory}
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        )}
      </Animatable.View>

      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredDetections.length === 0 ? (
          <Animatable.View animation="fadeIn" delay={400} style={styles.emptyState}>
            <HistoryIcon size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {filterType === 'all' ? 'No detections yet' : `No ${filterType}s detected`}
            </Text>
            <Text style={styles.emptyText}>
              {filterType === 'all' 
                ? 'Start scanning your plants to build your detection history'
                : `Try scanning for ${filterType}s or change your filter`
              }
            </Text>
          </Animatable.View>
        ) : (
          filteredDetections.map((detection, index) => (
            <Animatable.View 
              key={detection.id || index} 
              animation="fadeInUp" 
              delay={400 + (index * 100)}
              style={styles.detectionCard}
            >
              <Image source={{ uri: detection.image }} style={styles.detectionImage} />
              
              <View style={styles.detectionInfo}>
                <View style={styles.detectionHeader}>
                  <Text style={styles.detectionName}>{detection.result.name}</Text>
                  <View style={styles.severityContainer}>
                    {getSeverityIcon(detection.result.severity)}
                    <Text style={[styles.severityText, { color: getSeverityColor(detection.result.severity) }]}>
                      {detection.result.severity}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.scientificName}>{detection.result.scientific_name}</Text>
                
                <View style={styles.detectionMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{formatDate(detection.timestamp)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <TrendingUp size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{detection.result.confidence}% confidence</Text>
                  </View>
                </View>
                
                <Text style={styles.cropType}>Crop: {detection.crop}</Text>
                <Text style={styles.detectionDescription} numberOfLines={2}>
                  {detection.result.description}
                </Text>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDetection(detection.id)}
                >
                  <Trash2 size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </Animatable.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#16a34a',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  detectionCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detectionImage: {
    width: 100,
    height: 120,
  },
  detectionInfo: {
    flex: 1,
    position: 'relative',
    padding: 16,
  },
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textTransform: 'capitalize',
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  scientificName: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  detectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  cropType: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  detectionDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
});