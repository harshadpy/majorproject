import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DetectionRecord {
  id: string;
  timestamp: number;
  image: string;
  type: 'disease' | 'pest';
  crop: string;
  result: {
    name: string;
    scientific_name: string;
    severity: string;
    confidence: number;
    description: string;
    symptoms: string[];
    treatments: {
      organic: any[];
      chemical: any[];
      preventive: string[];
    };
  };
}

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  farmName: string;
  joinDate: number;
  preferences: {
    notifications: boolean;
    autoDetection: boolean;
    preferredTreatment: 'organic' | 'chemical' | 'both';
  };
}

export class StorageService {
  private static readonly DETECTIONS_KEY = 'plant_detections';
  private static readonly PROFILE_KEY = 'user_profile';
  private static readonly STATS_KEY = 'farm_stats';

  // Detection History Management
  static async saveDetection(detection: DetectionRecord): Promise<void> {
    try {
      const existing = await this.getDetections();
      const updated = [detection, ...existing];
      await AsyncStorage.setItem(this.DETECTIONS_KEY, JSON.stringify(updated));
      
      // Update stats after saving detection
      await this.updateStats(detection);
    } catch (error) {
      console.error('Error saving detection:', error);
      throw new Error('Failed to save detection');
    }
  }

  static async getDetections(): Promise<DetectionRecord[]> {
    try {
      const data = await AsyncStorage.getItem(this.DETECTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading detections:', error);
      return [];
    }
  }

  static async deleteDetection(id: string): Promise<void> {
    try {
      const existing = await this.getDetections();
      const updated = existing.filter(d => d.id !== id);
      await AsyncStorage.setItem(this.DETECTIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting detection:', error);
      throw new Error('Failed to delete detection');
    }
  }

  // User Profile Management
  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('Failed to save profile');
    }
  }

  static async getProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(this.PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      
      // Return default profile
      const defaultProfile: UserProfile = {
        name: 'Farmer John',
        email: 'john.farmer@email.com',
        location: 'Green Valley Farm, CA',
        farmName: 'Green Valley Farm',
        joinDate: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
        preferences: {
          notifications: true,
          autoDetection: false,
          preferredTreatment: 'organic',
        },
      };
      
      await this.saveProfile(defaultProfile);
      return defaultProfile;
    } catch (error) {
      console.error('Error loading profile:', error);
      throw new Error('Failed to load profile');
    }
  }

  // Stats Management
  private static async updateStats(detection: DetectionRecord): Promise<void> {
    try {
      const stats = await this.getStats();
      stats.totalScans += 1;
      
      if (detection.type === 'disease') {
        stats.diseasesDetected += 1;
      } else {
        stats.pestsDetected += 1;
      }
      
      if (detection.result.severity.toLowerCase() === 'high') {
        stats.criticalIssues += 1;
      }
      
      stats.lastScanDate = detection.timestamp;
      
      await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  static async getStats(): Promise<{
    totalScans: number;
    diseasesDetected: number;
    pestsDetected: number;
    criticalIssues: number;
    healthyPlants: number;
    growthRate: number;
    lastScanDate: number;
  }> {
    try {
      const data = await AsyncStorage.getItem(this.STATS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      
      // Return default stats
      const defaultStats = {
        totalScans: 0,
        diseasesDetected: 0,
        pestsDetected: 0,
        criticalIssues: 0,
        healthyPlants: 0,
        growthRate: 0,
        lastScanDate: 0,
      };
      
      await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(defaultStats));
      return defaultStats;
    } catch (error) {
      console.error('Error loading stats:', error);
      return {
        totalScans: 0,
        diseasesDetected: 0,
        pestsDetected: 0,
        criticalIssues: 0,
        healthyPlants: 0,
        growthRate: 0,
        lastScanDate: 0,
      };
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.DETECTIONS_KEY, this.STATS_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }
}