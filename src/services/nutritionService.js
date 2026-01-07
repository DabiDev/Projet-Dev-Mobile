// src/services/nutritionService.js
import axios from 'axios';
import { EDAMAM_APP_ID, EDAMAM_APP_KEY } from './apiConfig';

const BASE_URL = 'https://api.edamam.com/api/food-database/v2/parser';

export const searchFood = async (query) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                app_id: EDAMAM_APP_ID,
                app_key: EDAMAM_APP_KEY,
                ingr: query,
                nutrition_type: 'logging'
            }
        });
        return response.data.hints;
    } catch (error) {
        console.error("Error fetching food data:", error);
        throw error;
    }
};
