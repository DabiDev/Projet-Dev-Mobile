// src/screens/WorkoutScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, FlatList, StatusBar, ImageBackground, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExercises } from '../services/workoutService';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { theme } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WorkoutScreen({ navigation }) {
    const [allExercises, setAllExercises] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [viewMode, setViewMode] = useState('categories');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredExercises, setFilteredExercises] = useState([]);

    // Logger State
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [sets, setSets] = useState([{ reps: '10', weight: '20' }]);

    // Logger Modal Flow State
    const [loggerStep, setLoggerStep] = useState('form');
    const [pickerConfig, setPickerConfig] = useState(null);

    // Constants
    const ITEM_HEIGHT = 50;
    const weightOptions = Array.from({ length: 301 }, (_, i) => i.toString());
    const repOptions = Array.from({ length: 101 }, (_, i) => (i + 1).toString());

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const data = await getExercises();
        if (data) {
            setAllExercises(data);
            const uniqueCats = [...new Set(data.map(item => item.muscle))].sort();
            setCategories(uniqueCats);
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        }
        setLoading(false);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        const filtered = allExercises.filter(ex => ex.muscle === category);
        setFilteredExercises(filtered);
        setViewMode('exercises');
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setFilteredExercises([]);
        setViewMode('categories');
    };

    const openLogger = (exercise) => {
        setSelectedExercise(exercise);
        setSets([{ reps: '10', weight: '20' }]);
        setLoggerStep('form');
        setModalVisible(true);
    };

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets([...sets, { ...lastSet }]);
    };

    const updateSet = (index, field, value) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        setSets(newSets);
    };

    const removeSet = (index) => {
        if (sets.length > 1) {
            const newSets = sets.filter((_, i) => i !== index);
            setSets(newSets);
        }
    };

    const openPickerFor = (index, type) => {
        setPickerConfig({ index, type });
        setLoggerStep('picker');
    };

    const handlePickerSelect = (value) => {
        if (pickerConfig) {
            updateSet(pickerConfig.index, pickerConfig.type, value);
        }
        setLoggerStep('form');
        setPickerConfig(null);
    };

    const saveWorkout = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const validSets = sets.filter(s => s.reps && s.weight);
            if (validSets.length === 0) return;

            await addDoc(collection(db, "workouts"), {
                userId: user.uid,
                date: new Date().toISOString().split('T')[0],
                timestamp: Timestamp.now(),
                exerciseName: selectedExercise.name,
                exerciseId: selectedExercise.id,
                sets: validSets
            });
            setModalVisible(false);
        } catch (error) {
            console.error(error);
        }
    };

    const renderForm = () => (
        <View style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedExercise?.name}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Log your sets</Text>

            <FlatList
                data={sets}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item: set, index }) => (
                    <View style={styles.setRow}>
                        <View style={styles.setBadge}><Text style={styles.setBadgeText}>{index + 1}</Text></View>

                        <TouchableOpacity style={styles.selectorButton} onPress={() => openPickerFor(index, 'weight')}>
                            <Text style={styles.selectorText}>{set.weight}</Text>
                            <Text style={styles.unitLabel}>kg</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.selectorButton} onPress={() => openPickerFor(index, 'reps')}>
                            <Text style={styles.selectorText}>{set.reps}</Text>
                            <Text style={styles.unitLabel}>reps</Text>
                        </TouchableOpacity>

                        {sets.length > 1 && (
                            <TouchableOpacity onPress={() => removeSet(index)} style={styles.removeBtn}>
                                <Text style={styles.removeBtnText}>−</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListFooterComponent={
                    <View>
                        <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
                            <Text style={styles.addSetText}>+ Add Set</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={saveWorkout}>
                            <LinearGradient colors={['#6C63FF', '#4834d4']} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <Text style={styles.saveBtnText}>Save Workout</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );

    const renderPicker = () => {
        if (!pickerConfig) return null;
        const isWeight = pickerConfig.type === 'weight';
        const data = isWeight ? weightOptions : repOptions;
        const title = isWeight ? "Select Weight (kg)" : "Select Reps";

        return (
            <View style={styles.pickerView}>
                <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setLoggerStep('form')} style={styles.pickerBackBtn}>
                        <Text style={styles.pickerBackText}>‹ Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerViewTitle}>{title}</Text>
                    <View style={{ width: 60 }} />
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.pickerItem} onPress={() => handlePickerSelect(item)}>
                            <Text style={styles.pickerItemText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            </View>
        );
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategorySelect(item)}>
            <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.cardGradient}>
                <View style={styles.categoryIcon}>
                    <Text style={styles.categoryInitial}>{item.charAt(0)}</Text>
                </View>
                <Text style={styles.categoryTitle}>{item}</Text>
                <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>›</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderExerciseItem = ({ item }) => (
        <TouchableOpacity style={styles.exerciseCard} onPress={() => openLogger(item)}>
            <View style={styles.exIconContainer}>
                {item.image ? (
                    <ImageBackground source={{ uri: item.image }} style={styles.exImage} imageStyle={{ borderRadius: 12 }} />
                ) : (
                    <LinearGradient colors={['#e0e0e0', '#c0c0c0']} style={styles.placeholderIcon}>
                        <Text style={styles.iconText}>{item.name.charAt(0)}</Text>
                    </LinearGradient>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.exName}>{item.name}</Text>
                <Text style={styles.exTarget}>{item.target}</Text>
            </View>
            <TouchableOpacity style={styles.plusBtn} onPress={() => openLogger(item)}>
                <LinearGradient colors={['#6C63FF', '#4834d4']} style={styles.plusTarget}>
                    <Text style={styles.plusIcon}>+</Text>
                </LinearGradient>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6C63FF', '#f0f2f5', '#f0f2f5']}
                style={styles.background}
            />
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

                <View style={styles.headerRow}>
                    {viewMode === 'exercises' ? (
                        <TouchableOpacity onPress={handleBackToCategories} style={styles.backButton}>
                            <Text style={styles.backButtonText}>‹ Categories</Text>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <Text style={styles.headerTitle}>Workouts</Text>
                            <Text style={styles.headerSubtitle}>Choose a muscle group</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.historyBtn}
                        onPress={() => navigation.navigate("WorkoutHistory")}
                    >
                        <Text style={styles.historyBtnText}>History</Text>
                    </TouchableOpacity>
                </View>

                {viewMode === 'exercises' && (
                    <Text style={styles.pageTitle}>{selectedCategory}</Text>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 50 }} />
                ) : (
                    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                        {viewMode === 'categories' ? (
                            <FlatList
                                data={categories}
                                keyExtractor={(item, index) => item + index}
                                renderItem={renderCategoryItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <FlatList
                                data={filteredExercises}
                                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                                renderItem={renderExerciseItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={<Text style={styles.emptyText}>No exercises found.</Text>}
                            />
                        )}
                    </Animated.View>
                )}

                {/* Main Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {loggerStep === 'form' ? renderForm() : renderPicker()}
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    background: {
        position: 'absolute', left: 0, right: 0, top: 0, height: 300,
    },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 20, marginBottom: 15 },

    backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    backButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },

    historyBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    historyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    content: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },

    // Cards
    categoryCard: {
        marginBottom: 15, borderRadius: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
        overflow: 'hidden'
    },
    cardGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    categoryIcon: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F2F5',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    categoryInitial: { fontSize: 20, fontWeight: 'bold', color: '#6C63FF' },
    categoryTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },
    arrowContainer: { width: 30, alignItems: 'center' },
    arrow: { fontSize: 20, color: '#ccc', fontWeight: 'bold' },

    exerciseCard: {
        backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 15,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    exIconContainer: { width: 60, height: 60, marginRight: 15 },
    exImage: { width: '100%', height: '100%' },
    placeholderIcon: { flex: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    iconText: { fontSize: 24, fontWeight: 'bold', color: '#888' },

    cardContent: { flex: 1 },
    exName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    exTarget: { fontSize: 13, color: '#888', textTransform: 'capitalize' },

    plusBtn: { marginLeft: 10 },
    plusTarget: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    plusIcon: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginTop: -2 },

    emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: 24, height: '75%',
        shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1 },
    closeBtn: { padding: 5, backgroundColor: '#f0f2f5', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    closeText: { fontSize: 18, color: '#666', fontWeight: 'bold' },
    modalSubtitle: { fontSize: 16, color: '#888', marginBottom: 20 },

    setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' },
    setBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    setBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    selectorButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
        paddingVertical: 12, paddingHorizontal: 15, width: 110, backgroundColor: '#F8F9FA',
    },
    selectorText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    unitLabel: { fontSize: 12, color: '#888', marginLeft: 4 },

    removeBtn: { padding: 10 },
    removeBtnText: { fontSize: 24, color: '#FF6584' },

    addSetBtn: { alignSelf: 'center', padding: 15, marginBottom: 10 },
    addSetText: { color: '#6C63FF', fontWeight: 'bold', fontSize: 16 },

    saveBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 18, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    // Picker View
    pickerView: { flex: 1 },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    pickerBackBtn: { padding: 10 },
    pickerBackText: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
    pickerViewTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    pickerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9', alignItems: 'center' },
    pickerItemText: { fontSize: 22, color: '#333' }
});
