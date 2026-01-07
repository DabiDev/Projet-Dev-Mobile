// src/services/logService.js
import { db, auth } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

// Helper to get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export const addMealToLog = async (foodItem, mealType) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const logData = {
            userId: user.uid,
            date: getTodayDateString(),
            timestamp: Timestamp.now(),
            mealType: mealType, // e.g., 'Breakfast', 'Lunch'
            foodName: foodItem.label,
            calories: foodItem.nutrients.ENERC_KCAL,
            protein: foodItem.nutrients.PROCNT,
            fat: foodItem.nutrients.FAT,
            carbs: foodItem.nutrients.CHOCDF,
            quantity: 1, // Default to 1 serving for now
            sourceId: foodItem.foodId,
            image: foodItem.image || null
        };

        const docRef = await addDoc(collection(db, "dailyLogs"), logData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding meal:", error);
        throw error;
    }
};

export const getDailyLog = async (date = getTodayDateString()) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const q = query(
            collection(db, "dailyLogs"),
            where("userId", "==", user.uid),
            where("date", "==", date)
        );

        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        return logs;
    } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
    }
};
