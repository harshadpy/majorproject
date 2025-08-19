import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CircleHelp as HelpCircle, Settings, ChevronRight, Mail, Phone, MapPin, Award, LogOut, Edit3, Save, X } from 'lucide-react-native';
import { StorageService, UserProfile } from '@/services/StorageService';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function ProfileTab() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [stats, setStats] = React.useState({
    totalScans: 0,
    diseasesDetected: 0,
    pestsDetected: 0,
    criticalIssues: 0,
  });
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editedProfile, setEditedProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        StorageService.getProfile(),
        StorageService.getStats()
      ]);
      setProfile(profileData);
      setStats({
        totalScans: statsData.totalScans,
        diseasesDetected: statsData.diseasesDetected,
        pestsDetected: statsData.pestsDetected,
        criticalIssues: statsData.criticalIssues,
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleEditProfile = () => {
    if (profile) {
      setEditedProfile({ ...profile });
      setEditModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    if (editedProfile) {
      try {
        await StorageService.saveProfile(editedProfile);
        setProfile(editedProfile);
        setEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };

  const handlePreferenceChange = async (key: keyof UserProfile['preferences'], value: any) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          [key]: value,
        },
      };
      try {
        await StorageService.saveProfile(updatedProfile);
        setProfile(updatedProfile);
      } catch (error) {
        Alert.alert('Error', 'Failed to update preferences');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Signed Out', 'You have been signed out successfully');
          }
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your detection history and reset your stats. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadData();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        },
      ]
    );
  };

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <User size={32} color="#16a34a" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const profileStats = [
    { label: 'Plants Scanned', value: stats.totalScans.toString(), icon: Award, color: '#16a34a' },
    { label: 'Issues Detected', value: (stats.diseasesDetected + stats.pestsDetected).toString(), icon: Shield, color: '#ea580c' },
    { label: 'Critical Issues', value: stats.criticalIssues.toString(), icon: Award, color: '#ef4444' },
  ];

  const menuItems = [
    {
      section: 'Account',
      items: [
        { title: 'Edit Profile', icon: User, onPress: handleEditProfile },
        { title: 'Contact Information', icon: Mail, onPress: () => Alert.alert('Contact Info', 'Contact information management coming soon!') },
        { title: 'Farm Location', icon: MapPin, onPress: () => Alert.alert('Farm Location', 'Location management coming soon!') },
      ]
    },
    {
      section: 'Settings',
      items: [
        { 
          title: 'Push Notifications', 
          icon: Bell, 
          rightComponent: (
            <Switch
              value={profile.preferences.notifications}
              onValueChange={(value) => handlePreferenceChange('notifications', value)}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor={profile.preferences.notifications ? '#ffffff' : '#f4f3f4'}
            />
          )
        },
        { 
          title: 'Auto Detection', 
          icon: Settings, 
          rightComponent: (
            <Switch
              value={profile.preferences.autoDetection}
              onValueChange={(value) => handlePreferenceChange('autoDetection', value)}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor={profile.preferences.autoDetection ? '#ffffff' : '#f4f3f4'}
            />
          )
        },
      ]
    },
    {
      section: 'Support',
      items: [
        { title: 'Help Center', icon: HelpCircle, onPress: () => Alert.alert('Help Center', 'Help documentation coming soon!') },
        { title: 'Privacy Policy', icon: Shield, onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon!') },
        { title: 'Clear All Data', icon: Settings, onPress: handleClearData },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animatable.View animation="fadeInDown" style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <Text style={styles.profileLocation}>📍 {profile.location}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Edit3 size={16} color="#16a34a" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Stats */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
          {profileStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                  <IconComponent size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </Animatable.View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <Animatable.View 
            key={sectionIndex} 
            animation="fadeInUp" 
            delay={300 + (sectionIndex * 100)}
            style={styles.menuSection}
          >
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.menuItemLast
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconContainer}>
                        <IconComponent size={20} color="#6b7280" />
                      </View>
                      <Text style={styles.menuItemText}>{item.title}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.rightComponent || <ChevronRight size={16} color="#9ca3af" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animatable.View>
        ))}

        {/* Logout Button */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* App Version */}
        <Animatable.View animation="fadeIn" delay={700} style={styles.versionContainer}>
          <Text style={styles.versionText}>Plant Detective v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built for farmers, by farmers</Text>
        </Animatable.View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Save size={24} color="#16a34a" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile?.name || ''}
                onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, name: text } : null)}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile?.email || ''}
                onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, email: text } : null)}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Farm Location</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile?.location || ''}
                onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, location: text } : null)}
                placeholder="Enter your farm location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Farm Name</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile?.farmName || ''}
                onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, farmName: text } : null)}
                placeholder="Enter your farm name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Treatment</Text>
              <View style={styles.treatmentOptions}>
                {['organic', 'chemical', 'both'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.treatmentOption,
                      editedProfile?.preferences.preferredTreatment === option && styles.treatmentOptionActive
                    ]}
                    onPress={() => setEditedProfile(prev => prev ? {
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        preferredTreatment: option as 'organic' | 'chemical' | 'both'
                      }
                    } : null)}
                  >
                    <Text style={[
                      styles.treatmentOptionText,
                      editedProfile?.preferences.preferredTreatment === option && styles.treatmentOptionTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#9ca3af',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  editProfileText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  treatmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  treatmentOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    marginRight: 8,
    marginBottom: 8,
  },
  treatmentOptionActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  treatmentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  treatmentOptionTextActive: {
    color: '#ffffff',
  },
});