import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  totalRevenue: number;
  pendingMaintenance: number;
  overduePayments: number;
  occupancyRate: number;
  monthlyRevenue: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    totalTenants: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
    overduePayments: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with real API call
      const mockStats: DashboardStats = {
        totalProperties: 4,
        totalUnits: 80,
        occupiedUnits: 73,
        vacantUnits: 7,
        totalTenants: 73,
        totalRevenue: 185000,
        pendingMaintenance: 12,
        overduePayments: 3,
        occupancyRate: 91.25,
        monthlyRevenue: 185000,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon, color, gradient }: any) => (
    <TouchableOpacity style={styles.statCard}>
      <LinearGradient
        colors={gradient || ['#3b82f6', '#1d4ed8']}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardContent}>
          <View style={styles.statCardHeader}>
            <Ionicons name={icon} size={24} color="white" />
            <Text style={styles.statCardTitle}>{title}</Text>
          </View>
          <Text style={styles.statCardValue}>{value}</Text>
          {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Manager'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Overview Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Properties"
            value={stats.totalProperties}
            subtitle="Total managed"
            icon="business-outline"
            gradient={['#10b981', '#059669']}
          />
          <StatCard
            title="Units"
            value={stats.totalUnits}
            subtitle={`${stats.occupiedUnits} occupied`}
            icon="home-outline"
            gradient={['#3b82f6', '#1d4ed8']}
          />
          <StatCard
            title="Tenants"
            value={stats.totalTenants}
            subtitle="Active leases"
            icon="people-outline"
            gradient={['#8b5cf6', '#7c3aed']}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            subtitle="This month"
            icon="card-outline"
            gradient={['#f59e0b', '#d97706']}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Add Property"
            icon="add-circle-outline"
            color="#10b981"
            onPress={() => {}}
          />
          <QuickAction
            title="Add Tenant"
            icon="person-add-outline"
            color="#3b82f6"
            onPress={() => {}}
          />
          <QuickAction
            title="Maintenance"
            icon="construct-outline"
            color="#f59e0b"
            onPress={() => {}}
          />
          <QuickAction
            title="Payments"
            icon="card-outline"
            color="#8b5cf6"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.alertsContainer}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        
        {stats.pendingMaintenance > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="warning-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pending Maintenance</Text>
              <Text style={styles.alertSubtitle}>
                {stats.pendingMaintenance} requests need attention
              </Text>
            </View>
            <TouchableOpacity style={styles.alertAction}>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {stats.overduePayments > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Overdue Payments</Text>
              <Text style={styles.alertSubtitle}>
                {stats.overduePayments} payments are late
              </Text>
            </View>
            <TouchableOpacity style={styles.alertAction}>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {stats.vacantUnits > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="home-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Vacant Units</Text>
              <Text style={styles.alertSubtitle}>
                {stats.vacantUnits} units available for rent
              </Text>
            </View>
            <TouchableOpacity style={styles.alertAction}>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Performance</Text>
        
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Occupancy Rate</Text>
            <Text style={styles.metricValue}>{stats.occupancyRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats.occupancyRate}%` }
              ]} 
            />
          </View>
          <Text style={styles.metricSubtitle}>
            {stats.occupiedUnits} of {stats.totalUnits} units occupied
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Monthly Revenue</Text>
            <Text style={styles.metricValue}>{formatCurrency(stats.monthlyRevenue)}</Text>
          </View>
          <View style={styles.revenueBreakdown}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Rent</Text>
              <Text style={styles.revenueAmount}>
                {formatCurrency(stats.monthlyRevenue * 0.85)}
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Fees</Text>
              <Text style={styles.revenueAmount}>
                {formatCurrency(stats.monthlyRevenue * 0.15)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Payment received</Text>
              <Text style={styles.activitySubtitle}>
                Unit 101 - $2,500 rent payment
              </Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="construct" size={20} color="#f59e0b" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Maintenance request</Text>
              <Text style={styles.activitySubtitle}>
                Unit 205 - Plumbing issue reported
              </Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="person-add" size={20} color="#3b82f6" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New tenant</Text>
              <Text style={styles.activitySubtitle}>
                Unit 304 - Lease signed
              </Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionsContainer: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickAction: {
    width: (width - 72) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  alertsContainer: {
    padding: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  alertAction: {
    padding: 8,
  },
  metricsContainer: {
    padding: 20,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  revenueBreakdown: {
    gap: 8,
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
}); 