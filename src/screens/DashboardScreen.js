// src/screens/DashboardScreen.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Animated, Dimensions, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { logoutUser } from '../services/authService';
import { getDailyLog } from '../services/logService';
import { theme } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const [logs, setLogs] = useState([]);
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [refreshing, setRefreshing] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const fetchLogs = async () => {
        try {
            const dailyLogs = await getDailyLog();
            setLogs(dailyLogs);
            calculateTotals(dailyLogs);
        } catch (error) {
            console.error(error);
        }
    };

    const calculateTotals = (data) => {
        const newTotals = data.reduce((acc, item) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setTotals(newTotals);
    };

    useFocusEffect(
        useCallback(() => {
            fetchLogs();
            // Trigger Animation each time screen comes into focus
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]).start();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLogs();
        setRefreshing(false);
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6C63FF', '#f0f2f5', '#f0f2f5']} // Vibrant top fading to white
                style={styles.background}
            />
            <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.date}>{new Date().toDateString()}</Text>
                        <Text style={styles.greeting}>Hello, User</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
                        <Text style={styles.logoutText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Animated Highlights */}
                <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.caloriesInfo}>
                            <Text style={styles.mainValue}>{Math.round(totals.calories)}</Text>
                            <Text style={styles.mainLabel}>kcal eaten</Text>
                        </View>
                        {/* Simple visual representation of progress could be added here */}
                        <View style={styles.progressCircle}>
                            <Text style={styles.progressText}>Today</Text>
                        </View>
                    </View>

                    {/* Macros Grid */}
                    <View style={styles.macrosGrid}>
                        <MacroCard label="Protein" value={totals.protein} color="#FF6584" />
                        <MacroCard label="Carbs" value={totals.carbs} color="#36A2EB" />
                        <MacroCard label="Fat" value={totals.fat} color="#FFCE56" />
                    </View>
                </Animated.View>

                {/* Recent Activity Section */}
                <Text style={styles.sectionTitle}>Recent Meals</Text>

                {logs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No food logged yet.</Text>
                    </View>
                ) : (
                    logs.map((item, index) => (
                        <Animated.View
                            key={item.id || index}
                            style={[
                                styles.logItem,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.logIcon}>
                                <Text style={{ fontSize: 20 }}>🍎</Text>
                            </View>
                            <View style={styles.logContent}>
                                <Text style={styles.logTitle}>{item.foodName}</Text>
                                <Text style={styles.logSubtitle}>{item.mealType} • {Math.round(item.calories)} kcal</Text>
                            </View>
                            <Text style={styles.logTime}>Today</Text>
                        </Animated.View>
                    ))
                )}

            </ScrollView>
        </View>
    );
}

// Sub-components
const MacroCard = ({ label, value, color }) => (
    <View style={styles.macroCard}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.macroValue}>{Math.round(value)}g</Text>
        <Text style={styles.macroLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    background: {
        position: 'absolute',
        left: 0, right: 0, top: 0,
        height: 300, // Gradient covers top part
    },
    scrollView: { flex: 1, paddingHorizontal: 20 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: 20,
    },
    date: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
    greeting: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center'
    },
    logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 30,
    },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    caloriesInfo: { flex: 1 },
    mainValue: { fontSize: 48, fontWeight: 'bold', color: '#1E1E1E' },
    mainLabel: { fontSize: 16, color: '#888', fontWeight: '500' },
    progressCircle: { // Placeholder for a chart
        width: 60, height: 60, borderRadius: 30,
        borderWidth: 4, borderColor: '#f0f0f0',
        justifyContent: 'center', alignItems: 'center'
    },
    progressText: { fontSize: 12, color: '#888', fontWeight: '600' },

    macrosGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    macroCard: {
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        width: '30%'
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
    macroValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    macroLabel: { fontSize: 12, color: '#888' },

    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    // Log Items
    logItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    logIcon: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: '#F0F2F5',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15
    },
    logContent: { flex: 1 },
    logTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    logSubtitle: { fontSize: 14, color: '#888', marginTop: 2 },
    logTime: { fontSize: 12, color: '#ccc', fontWeight: '600' },

    emptyState: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#aaa', fontStyle: 'italic' }

});
