import axios from 'axios';

// Базовый URL вашего Strapi сервера
export const BASE_URL = 'http://192.168.0.45:1337'; // Убедитесь, что это соответствует вашему локальному или удаленному серверу

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Функция для получения данных слайдера
export const fetchSliderData = async () => {
    try {
        const response = await apiClient.get('/api/sliders?populate=*');
        return response.data.data;
    } catch (error) {
        console.error('Ошибка при получении данных слайдера:', error);
        throw error;
    }
};

// Функция для получения данных новостей
export const fetchNewsData = async () => {
    try {
        const response = await apiClient.get('/api/newsp?populate=*'); // Исправленное имя коллекции
        console.log('Ответ от API (новости):', response.data); // Временный вывод для проверки
        return response.data.data;
    } catch (error) {
        console.error('Ошибка при получении данных новостей:', error);
        throw error;
    }
};

// Функция для получения данных спектаклей
export const fetchPerformancesData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/performances?populate=*`);
        console.log('Ответ от API (спектакли):', response.data); // Временный вывод для проверки

        if (!Array.isArray(response.data.data)) {
            console.error('Полученные данные не являются массивом:', response.data);
            throw new Error('Неверный формат данных');
        }

        return response.data.data.map((item) => ({
            id: item.id,
            title: item.title || 'Без названия', // Защита от undefined
            description: item.description || 'Описание недоступно', // Защита от undefined
            image: item.image?.url ? `${BASE_URL}${item.image.url}` : '/images/default.jpg', // Значение по умолчанию для изображения
            gallery: item.gallery?.map((image) => `${BASE_URL}${image.url}`) || [], // Галерея изображений
            dates: item.dates || [], // Массив дат (по умолчанию пустой)
        }));
    } catch (error) {
        console.error('Ошибка при получении данных спектаклей:', error);
        throw error;
    }
};

// Функция для получения данных об артистах
export const fetchArtistsData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/artists?populate=*`);
        console.log('Данные артистов:', response.data); // Временный вывод для проверки

        if (!Array.isArray(response.data.data)) {
            console.error('Полученные данные не являются массивом:', response.data);
            throw new Error('Неверный формат данных');
        }

        return response.data.data.map((item) => ({
            id: item.id,
            name: item.name || 'Без имени', // Защита от undefined
            title: item.title || 'Звание не указано', // Защита от undefined
            photo: item.photo?.url ? `${BASE_URL}${item.photo.url}` : '/images/default.jpg',
            bio: item.bio || 'Информация недоступна', // Защита от undefined
            gallery: item.gallery?.map((image) => `${BASE_URL}${image.url}`) || [], // Галерея изображений
        }));
    } catch (error) {
        console.error('Ошибка при получении данных артистов:', error);
        throw error;
    }
};

// Функция для получения данных об команде
export const fetchTeamsData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/teams?populate=*`);
        console.log('Данные команды:', response.data); // Временный вывод для проверки

        if (!Array.isArray(response.data.data)) {
            console.error('Полученные данные не являются массивом:', response.data);
            throw new Error('Неверный формат данных');
        }

        return response.data.data.map((item) => ({
            id: item.id,
            name: item.name || 'Без имени', // Защита от undefined
            title: item.title || 'Звание не указано', // Защита от undefined
            photo: item.photo?.url ? `${BASE_URL}${item.photo.url}` : '/images/default.jpg',
            bio: item.bio || 'Информация недоступна', // Защита от undefined
            
        }));
    } catch (error) {
        console.error('Ошибка при получении данных артистов:', error);
        throw error;
    }
};



// Функция для получения данных о репертуаре
export const fetchRepertoireMonths = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/repertoire-months?populate=*`);
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные о репертуаре');
        }
        const data = await response.json();
        console.log('Данные из Strapi:', data); // Логируем данные из Strapi
        return data.data.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image?.url ? `${BASE_URL}${item.image.url}` : '/images/default.jpg'
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
};


/**
 * Функция для получения данных страницы "О театре"
 */
export const fetchAboutData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/abouts?populate=*`);
        
        console.log('Ответ от API ("О театре"):', response.data);

        if (response.ok) {
            const firstItem = response.data.data[0];
            const attributes = firstItem.attributes || firstItem;

            return {
                textP1: attributes.textP1,
                textP2: attributes.textP2
            };
        } else {
            console.warn('Запись "О театре" не найдена в Strapi');
            return { textP1: null, textP2: null };
        }

    } catch (error) {
        console.error('Ошибка при получении данных "О театре":', error);
        throw error;
    }
};