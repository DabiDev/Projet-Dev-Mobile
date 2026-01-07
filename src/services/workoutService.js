// src/services/workoutService.js
import axios from 'axios';
import { WORKOUT_API_TOKEN, WORKOUT_API_BASE_URL, RAPIDAPI_HOST } from './apiConfig';

export const getExercises = async () => {
    try {
        const response = await axios.get(`${WORKOUT_API_BASE_URL}/exercises`, {
            headers: {
                'x-rapidapi-key': WORKOUT_API_TOKEN,
                'x-rapidapi-host': RAPIDAPI_HOST
            },
            params: {
                limit: 50
            }
        });

        // Debug: Log structure to see what we get
        // console.log("API Response:", response.data);

        let data = response.data;
        if (!Array.isArray(data)) {
            if (data && Array.isArray(data.results)) {
                data = data.results;
            } else if (data && Array.isArray(data.data)) {
                data = data.data;
            } else {
                console.warn("Unexpected API response structure:", data);
                // Return empty or throw to trigger fallback
                throw new Error("Invalid API response format");
            }
        }

        // Debug: Log structure to see what we get
        if (data.length > 0) {
            console.log("DEBUG: First item from API:", JSON.stringify(data[0], null, 2));
        }

        // Map ExerciseDB structure to our app structure
        return data.map(item => ({
            id: item.exerciseId || item.id || item._id || Math.random().toString(),
            name: item.name ? (item.name.charAt(0).toUpperCase() + item.name.slice(1)) : "Exercise",
            // Fix: bodyParts is an array, take the first one
            muscle: (item.bodyParts && item.bodyParts.length > 0 ? item.bodyParts[0] : (item.bodyPart || "General")).replace(/\b\w/g, c => c.toUpperCase()),
            image: item.imageUrl || item.gifUrl || item.image || null,
            target: (item.targetMuscles && item.targetMuscles.length > 0) ? item.targetMuscles[0] : (item.target || "Target")
        }));

    } catch (error) {
        console.error("Error fetching exercises:", error);
        // Fallback mock data
        return [
            { id: '1', name: 'Bench Press', muscle: 'Chest' },
            { id: '2', name: 'Squat', muscle: 'Legs' },
            { id: '3', name: 'Deadlift', muscle: 'Back' },
            { id: '4', name: 'Pull Up', muscle: 'Back' },
            { id: '5', name: 'Dumbbell Curl', muscle: 'Biceps' },
            { id: '6', name: 'Tricep Dip', muscle: 'Triceps' },
            { id: '7', name: 'Lunges', muscle: 'Legs' },
            { id: '8', name: 'Shoulder Press', muscle: 'Shoulders' }
        ];
    }
};
