import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Search, Leaf, Bug, Shield, TriangleAlert as AlertTriangle, Info, Zap, Database } from 'lucide-react-native';
import localKnowledgeBaseJson from '@/data/detectionData.json';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { HolographicCard } from '@/components/HolographicCard';
import { PulsingButton } from '@/components/PulsingButton';

const { width } = Dimensions.get('window');

export default function KnowledgeTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'disease' | 'pest'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const headerAnimation = useSharedValue(0);
  const searchAnimation = useSharedValue(0);

  const knowledgeBase = localKnowledgeBaseJson as any;

  useEffect(() => {
    headerAnimation.value = withTiming(1, { duration: 800 });
    searchAnimation.value = withDelay(300, withTiming(1, { duration: 600 }));
  }, []);

  const categories = [
    { key: 'all' as const, label: '🌐 ALL', icon: Database, color: '#00d4ff' },
    { key: 'disease' as const, label: '🦠 DISEASES', icon: Leaf, color: '#ff0040' },
    { key: 'pest' as const, label: '🐛 PESTS', icon: Bug, color: '#ff6b00' },
  ];

  const getFilteredEntries = () => {
    const entries = Object.entries(knowledgeBase).filter(([key, _]) => key !== 'unknown');
    
    let filtered = entries.filter(([key, entry]: [string, any]) => {
      const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      
      const isDiseaseKeyword = ['blight', 'spot', 'rot', 'mildew', 'rust', 'wilt', 'canker', 'scab', 'mosaic'].some(term => 
        key.toLowerCase().includes(term)
      );
      
      if (selectedCategory === 'disease') return matchesSearch && isDiseaseKeyword;
      if (selectedCategory === 'pest') return matchesSearch && !isDiseaseKeyword;
      
      return matchesSearch;
    });

    return filtered;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#ff0040';
      case 'medium': return '#ff6b00';
      case 'low': return '#00ff41';
      default: return '#00d4ff';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    switch (severity?.toLowerCase()) {
      case 'high': return <AlertTriangle size={16} color={color} />;
      case 'medium': return <Info size={16} color={color} />;
      case 'low': return <Shield size={16} color={color} />;
      default: return <Info size={16} color={color} />;
    }
  };

  const filteredEntries = getFilteredEntries();

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(headerAnimation.value, [0, 1], [-30, 0]);
    const opacity = interpolate(headerAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const animatedSearchStyle = useAnimatedStyle(() => {
    const scale = interpolate(searchAnimation.value, [0, 1], [0.9, 1]);
    const opacity = interpolate(searchAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <HolographicCard style={styles.headerCard} intensity={80}>
          <View style={styles.headerContent}>
            <Database size={28} color="#00ff41" />
            <Text style={styles.headerTitle}>🧠 AI KNOWLEDGE BASE</Text>
          </View>
        </HolographicCard>
      </Animated.View>

      {/* Futuristic Search */}
      <Animated.View style={[styles.searchContainer, animatedSearchStyle]}>
        <HolographicCard style={styles.searchCard} intensity={70}>
          <View style={styles.searchBar}>
            <Search size={24} color="#00ff41" />
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 SEARCH PLANT DATABASE..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </HolographicCard>
      </Animated.View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        <HolographicCard style={styles.categoryCard} intensity={60}>
          <View style={styles.categoryButtons}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.key && [styles.categoryButtonActive, { borderColor: category.color }]
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <IconComponent 
                    size={18} 
                    color={selectedCategory === category.key ? category.color : '#ffffff'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.key && [styles.categoryTextActive, { color: category.color }]
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </HolographicCard>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <HolographicCard style={styles.emptyCard} intensity={60}>
              <Search size={64} color="#00ff41" />
              <Text style={styles.emptyTitle}>🚀 NO RESULTS FOUND</Text>
              <Text style={styles.emptyText}>
                Try different search terms or adjust category filters! 🤖
              </Text>
            </HolographicCard>
          </View>
        ) : (
          filteredEntries.map(([key, entry]: [string, any], index) => (
            <KnowledgeCard
              key={key}
              entryKey={key}
              entry={entry}
              index={index}
              isExpanded={expandedItem === key}
              onToggle={() => setExpandedItem(expandedItem === key ? null : key)}
              getSeverityColor={getSeverityColor}
              getSeverityIcon={getSeverityIcon}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const KnowledgeCard: React.FC<{
  entryKey: string;
  entry: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  getSeverityColor: (severity: string) => string;
  getSeverityIcon: (severity: string) => React.ReactNode;
}> = ({ entryKey, entry, index, isExpanded, onToggle, getSeverityColor, getSeverityIcon }) => {
  const cardAnimation = useSharedValue(0);
  const expandAnimation = useSharedValue(0);

  useEffect(() => {
    cardAnimation.value = withDelay(
      index * 100,
      withSpring(1, { damping: 15, stiffness: 200 })
    );
  }, []);

  useEffect(() => {
    expandAnimation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const animatedCardStyle = useAnimatedStyle(() => {
    const translateX = interpolate(cardAnimation.value, [0, 1], [width, 0]);
    const opacity = interpolate(cardAnimation.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const animatedExpandStyle = useAnimatedStyle(() => {
    const height = interpolate(expandAnimation.value, [0, 1], [0, 500]);
    const opacity = interpolate(expandAnimation.value, [0, 1], [0, 1]);

    return {
      height,
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.knowledgeCard, animatedCardStyle]}>
      <HolographicCard style={styles.knowledgeCardInner} intensity={60}>
        <TouchableOpacity style={styles.cardHeader} onPress={onToggle}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>
              🔬 {entryKey.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text style={styles.cardScientific}>📋 {entry.scientific_name}</Text>
          </View>
          <View style={styles.severityContainer}>
            {getSeverityIcon(entry.severity)}
            <Text style={[styles.severityText, { color: getSeverityColor(entry.severity) }]}>
              {entry.severity.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        <Animated.View style={[styles.expandedContent, animatedExpandStyle]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>{entry.description}</Text>

            {entry.symptoms && entry.symptoms.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ SYMPTOMS</Text>
                {entry.symptoms.map((symptom: string, idx: number) => (
                  <Text key={idx} style={styles.symptomText}>🔸 {symptom}</Text>
                ))}
              </View>
            )}

            {entry.treatments?.organic && entry.treatments.organic.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌿 ORGANIC SOLUTIONS</Text>
                {entry.treatments.organic.map((treatment: any, idx: number) => (
                  <HolographicCard key={idx} style={styles.treatmentCard} intensity={40}>
                    <Text style={styles.treatmentName}>💊 {treatment.name}</Text>
                    <Text style={styles.treatmentDetail}>📏 Dosage: {treatment.dosage}</Text>
                    <Text style={styles.treatmentDetail}>⏰ Frequency: {treatment.frequency}</Text>
                    <Text style={styles.treatmentSafety}>✅ Safety: {treatment.safety}</Text>
                  </HolographicCard>
                ))}
              </View>
            )}

            {entry.treatments?.preventive && entry.treatments.preventive.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛡️ PREVENTION</Text>
                {entry.treatments.preventive.map((preventive: string, idx: number) => (
                  <Text key={idx} style={styles.preventiveText}>🔹 {preventive}</Text>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </HolographicCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCard: {
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 12,
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchCard: {
    marginTop: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 18,
    color: '#ff0040',
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryCard: {
    marginTop: 0,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 6,
    letterSpacing: 1,
  },
  categoryTextActive: {
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 255, 65, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  knowledgeCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  knowledgeCardInner: {
    marginTop: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff41',
    textShadowColor: 'rgba(0, 255, 65, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  cardScientific: {
    fontSize: 14,
    color: '#ffffff',
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.8,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1,
  },
  expandedContent: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 65, 0.3)',
    paddingTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.9,
  },
  section: {
    marginBottom: 20,
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
  treatmentCard: {
    marginBottom: 12,
  },
  treatmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00ff41',
    marginBottom: 8,
  },
  treatmentDetail: {
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 4,
    opacity: 0.9,
  },
  treatmentSafety: {
    fontSize: 13,
    color: '#ffd700',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  preventiveText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 6,
    opacity: 0.9,
  },
});