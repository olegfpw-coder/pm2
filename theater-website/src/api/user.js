import axios from 'axios';
import { BASE_URL } from './starpi';

// Получить токен из localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Создать axios клиент с авторизацией
const createAuthClient = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// === ИЗБРАННОЕ ===

/**
 * Получить избранные спектакли пользователя (возвращает массив ID)
 */
export const getFavoritePerformances = async () => {
  try {
    const client = createAuthClient();
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    // Получаем данные пользователя с избранными спектаклями
    const { data } = await client.get('/api/users/me?populate[favorites][populate]=*');
    
    // Обрабатываем данные Strapi (может быть массив или объект)
    const favorites = data.favorites || [];
    
    // Если это массив объектов Strapi, распаковываем их
    return Array.isArray(favorites) 
      ? favorites.map(fav => {
          // Если есть attributes, распаковываем
          if (fav.attributes) {
            return { id: fav.id, ...fav.attributes };
          }
          return fav;
        })
      : [];
  } catch (error) {
    console.error('Ошибка при получении избранных спектаклей:', error);
    throw error;
  }
};

/**
 * Добавить спектакль в избранное
 */
export const addToFavorites = async (performanceId) => {
  try {
    const client = createAuthClient();
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    // Получаем текущие избранные
    const { data: userData } = await client.get('/api/users/me?populate[favorites]=*');
    const currentFavorites = userData.favorites?.map(fav => fav.id) || [];
    
    // Добавляем новый ID, если его еще нет
    if (!currentFavorites.includes(performanceId)) {
      currentFavorites.push(performanceId);
    }

    // Обновляем избранное
    await client.put(`/api/users/${userData.id}`, {
      favorites: currentFavorites,
    });

    return { success: true };
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    throw error;
  }
};

/**
 * Удалить спектакль из избранного
 */
export const removeFromFavorites = async (performanceId) => {
  try {
    const client = createAuthClient();
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    // Получаем текущие избранные
    const { data: userData } = await client.get('/api/users/me?populate[favorites]=*');
    const currentFavorites = userData.favorites?.map(fav => fav.id) || [];
    
    // Удаляем ID
    const updatedFavorites = currentFavorites.filter(id => id !== performanceId);

    // Обновляем избранное
    await client.put(`/api/users/${userData.id}`, {
      favorites: updatedFavorites,
    });

    return { success: true };
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    throw error;
  }
};

/**
 * Проверить, находится ли спектакль в избранном
 */
export const checkIsFavorite = async (performanceId) => {
  try {
    const favorites = await getFavoritePerformances();
    return favorites.some(fav => fav.id === performanceId);
  } catch (error) {
    return false;
  }
};

// === РЕЦЕНЗИИ ===

/**
 * Получить рецензии для спектакля
 */
export const getReviews = async (performanceId) => {
  try {
    const client = createAuthClient();
    const { data } = await client.get(
      `/api/reviews?filters[performance][id][$eq]=${performanceId}&populate[user][populate]=*&populate[likes][populate]=*&populate[performance][populate]=*&sort=createdAt:desc`
    );
    
    // Обрабатываем данные Strapi
    const reviews = data.data || [];
    return reviews.map(review => {
      // Распаковываем attributes если есть
      if (review.attributes) {
        return { id: review.id, ...review.attributes };
      }
      return review;
    });
  } catch (error) {
    console.error('Ошибка при получении рецензий:', error);
    return [];
  }
};

/**
 * Создать рецензию
 */
export const createReview = async (performanceId, title, text, rating) => {
  try {
    const client = createAuthClient();
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    // Получаем ID пользователя
    const { data: userData } = await client.get('/api/users/me');

    const { data } = await client.post('/api/reviews', {
      data: {
        title,
        text,
        rating: rating || null,
        performance: performanceId,
        user: userData.id,
      },
    });

    return { success: true, review: data.data };
  } catch (error) {
    console.error('Ошибка при создании рецензии:', error);
    throw error;
  }
};

/**
 * Получить рецензии пользователя
 */
export const getUserReviews = async (userId) => {
  try {
    const client = createAuthClient();
    const { data } = await client.get(
      `/api/reviews?filters[user][id][$eq]=${userId}&populate[performance][populate]=*&populate[likes][populate]=*&sort=createdAt:desc`
    );
    
    // Обрабатываем данные Strapi
    const reviews = data.data || [];
    return reviews.map(review => {
      // Распаковываем attributes если есть
      if (review.attributes) {
        return { id: review.id, ...review.attributes };
      }
      return review;
    });
  } catch (error) {
    console.error('Ошибка при получении рецензий пользователя:', error);
    return [];
  }
};

/**
 * Лайкнуть/убрать лайк с рецензии
 */
export const toggleReviewLike = async (reviewId) => {
  try {
    const client = createAuthClient();
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    // Получаем текущую рецензию
    const { data: reviewData } = await client.get(`/api/reviews/${reviewId}?populate[likes]=*`);
    const currentLikes = reviewData.data.likes?.map(like => like.id) || [];
    
    // Получаем ID пользователя
    const { data: userData } = await client.get('/api/users/me');
    const userId = userData.id;

    // Проверяем, есть ли уже лайк от этого пользователя
    const hasLiked = currentLikes.includes(userId);
    
    let updatedLikes;
    if (hasLiked) {
      // Убираем лайк
      updatedLikes = currentLikes.filter(id => id !== userId);
    } else {
      // Добавляем лайк
      updatedLikes = [...currentLikes, userId];
    }

    // Обновляем рецензию
    const { data } = await client.put(`/api/reviews/${reviewId}`, {
      data: {
        likes: updatedLikes,
      },
    });

    return { success: true, review: data.data, liked: !hasLiked };
  } catch (error) {
    console.error('Ошибка при лайке рецензии:', error);
    throw error;
  }
};

