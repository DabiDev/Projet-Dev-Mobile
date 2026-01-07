// src/screens/WorkoutHistoryScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { theme } from '../constants/theme';

export default function WorkoutHistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const q = query(
                collection(db, "workouts"),
                where("userId", "==", user.uid)
            );

            const querySnapshot = await getDocs(q);
            const logs = [];
            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() });
            });

            // Manual Sort DESC
            logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

            setHistory(logs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    const renderItem = ({ item }) => {
        // Calculate total volume for fun
        const totalVolume = item.sets.reduce((acc, s) => acc + (parseFloat(s.weight) * parseFloat(s.reps)), 0);

        return (
            <View style={styles.card}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.exName}>{item.exerciseName}</Text>
                        <Text style={styles.volumeText}>{Math.round(totalVolume)} kg vol</Text>
                    </View>

                    <View style={styles.setsContainer}>
                        {item.sets.map((set, idx) => (
                            <View key={idx} style={styles.setTag}>
                                <Text style={styles.setText}>
                                    {set.reps} <Text style={styles.subText}>x</Text> {set.weight}<Text style={styles.subText}>kg</Text>
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>History</Text>
                <Text style={styles.headerSubtitle}>Your progress over time</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.empty}>No workouts logged yet.</Text>
                    <Text style={styles.emptySub}>Go back and start training!</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    headerContainer: {
        padding: theme.spacing.l,
        paddingBottom: theme.spacing.m,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        flexDirection: 'row',
        ...theme.shadows.small
    },
    dateBadge: {
        backgroundColor: theme.colors.primary + '10', // Very light opacity
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
        height: 60,
    },
    dateText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 18,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'baseline',
    },
    exName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    volumeText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    setsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    setTag: {
        marginRight: 8,
        marginBottom: 6,
        backgroundColor: theme.colors.background,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    setText: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    subText: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.text.secondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    empty: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    emptySub: {
        marginTop: 8,
        color: theme.colors.text.secondary,
    }
});
