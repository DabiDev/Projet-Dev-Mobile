// src/screens/NutritionScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, SafeAreaView, StatusBar, ScrollView, Animated, Dimensions, ImageBackground } from 'react-native';
import { searchFood } from '../services/nutritionService';
import { addMealToLog } from '../services/logService';
import { theme } from '../constants/theme';
import useDebounce from '../hooks/useDebounce';
import { LinearGradient } from 'expo-linear-gradient';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const { width } = Dimensions.get('window');

export default function NutritionScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState('Breakfast');

    const debouncedQuery = useDebounce(query, 1000);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 3) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const hints = await searchFood(searchQuery);
            setResults(hints);
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.warn("Rate limit exceeded.");
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => {
        handleSearch(debouncedQuery);
    }, [debouncedQuery, handleSearch]);

    const handleAddFood = async (item) => {
        try {
            const foodItem = {
                label: item.food.label,
                nutrients: item.food.nutrients,
                foodId: item.food.foodId,
                image: item.food.image
            };

            await addMealToLog(foodItem, selectedMealType);
            Alert.alert("Success", `Added to ${selectedMealType}!`);
        } catch (error) {
            Alert.alert("Error", "Could not add food");
        }
    };

    const renderItem = ({ item, index }) => {
        return (
            <Animated.View style={[styles.itemCard, { opacity: fadeAnim }]}>
                <View style={styles.imageContainer}>
                    {item.food.image ? (
                        <Image source={{ uri: item.food.image }} style={styles.foodImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>{item.food.label.charAt(0)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.foodName} numberOfLines={1}>{item.food.label}</Text>
                    <View style={styles.macroRow}>
                        <Text style={styles.macroText}><Text style={{ fontWeight: 'bold', color: '#FF6584' }}>{Math.round(item.food.nutrients.ENERC_KCAL)}</Text> kcal</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.macroText}>{Math.round(item.food.nutrients.PROCNT)}g P</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.addButton} onPress={() => handleAddFood(item)}>
                    <LinearGradient colors={['#6C63FF', '#4834d4']} style={styles.addBtnGradient}>
                        <Text style={styles.addButtonText}>+</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6C63FF', '#f0f2f5', '#f0f2f5']}
                style={styles.background}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Nutrition</Text>
                    <Text style={styles.subHeader}>What are you eating?</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Search food (e.g., Apple)..."
                            placeholderTextColor="#999"
                            value={query}
                            onChangeText={setQuery}
                        />
                    </View>
                </View>

                {/* Meal Type Selector */}
                <View style={styles.mealSelectorContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {MEAL_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.mealTypePill,
                                    selectedMealType === type && styles.mealTypePillActive
                                ]}
                                onPress={() => setSelectedMealType(type)}
                            >
                                {selectedMealType === type && (
                                    <LinearGradient
                                        colors={['#6C63FF', '#4834d4']}
                                        style={StyleSheet.absoluteFillObject}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    />
                                )}
                                <Text style={[
                                    styles.mealTypeText,
                                    selectedMealType === type && styles.mealTypeTextActive
                                ]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => (item.food.foodId ? item.food.foodId + index : index.toString())}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            results.length === 0 && query.length >= 3 ? (
                                <Text style={styles.emptyText}>No food found.</Text>
                            ) : null
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    background: {
        position: 'absolute', left: 0, right: 0, top: 0, height: 300,
    },
    headerContainer: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 20 },
    header: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subHeader: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, height: 50, paddingHorizontal: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5
    },
    searchIcon: { fontSize: 18, marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#333', height: '100%' },

    mealSelectorContainer: { marginBottom: 10, height: 50 },
    mealTypePill: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.8)', marginRight: 10,
        height: 40, justifyContent: 'center', overflow: 'hidden'
    },
    mealTypePillActive: { backgroundColor: 'transparent' },
    mealTypeText: { fontSize: 14, fontWeight: '600', color: '#666' },
    mealTypeTextActive: { color: '#fff' },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },

    // Cards
    itemCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    imageContainer: { marginRight: 15 },
    foodImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f0f0f0' },
    placeholderImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 24, fontWeight: 'bold', color: '#ccc' },

    infoContainer: { flex: 1, justifyContent: 'center' },
    foodName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    macroRow: { flexDirection: 'row', alignItems: 'center' },
    macroText: { fontSize: 13, color: '#888' },
    dot: { marginHorizontal: 6, color: '#ccc' },

    addButton: { marginLeft: 10 },
    addBtnGradient: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    addButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: -2 },

    emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});
