import axios from 'axios';
import CryptoJS from 'crypto-js';

// Базовый URL API QuickTickets
const BASE_URL = 'https://api2.quicktickets.ru/afisha/v2';

// Получаем токены из переменных окружения
const API_TOKEN = process.env.REACT_APP_QUICKTICKETS_API_TOKEN || '';
const API_SALT = process.env.REACT_APP_QUICKTICKETS_API_SALT || '';

// Создаем axios клиент для QuickTickets API
const quickTicketsClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Создать подпись (signature) для запроса
 * @param {Object} params - Параметры запроса
 * @returns {string} Подпись
 */
const createSignature = (params) => {
  if (!API_TOKEN || !API_SALT) {
    console.warn('API_TOKEN или API_SALT не настроены');
    return '';
  }

  // Сортируем параметры по ключам (без signature)
  const paramsWithoutSignature = { ...params };
  delete paramsWithoutSignature.signature;
  
  const sortedKeys = Object.keys(paramsWithoutSignature).sort();
  
  // Создаем строку параметров
  let paramString = '';
  if (sortedKeys.length > 0) {
    paramString = sortedKeys
      .map((key) => `${key}=${paramsWithoutSignature[key]}`)
      .join('&');
  }

  // Пробуем разные варианты формата подписи
  // Вариант 1: параметры + salt + token (стандартный)
  // Вариант 2: параметры + token + salt
  // Вариант 3: salt + token + параметры
  // Вариант 4: token + salt + параметры
  
  // Начинаем с варианта 1 (наиболее распространенный)
  // Формат: параметры + salt + token (без разделителей между ними)
  let signatureString = '';
  if (paramString) {
    // Если есть параметры: param1=value1&param2=value2 + salt + token
    signatureString = `${paramString}${API_SALT}${API_TOKEN}`;
  } else {
    // Если параметров нет: salt + token
    signatureString = `${API_SALT}${API_TOKEN}`;
  }

  // Создаем MD5 hash
  const signature = CryptoJS.MD5(signatureString).toString();

  // Отладочная информация
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Отладка подписи ===');
    console.log('Параметры:', paramsWithoutSignature);
    console.log('Строка параметров:', paramString);
    console.log('Строка для подписи:', signatureString);
    console.log('Подпись (MD5):', signature);
  }

  return signature;
};

/**
 * Добавить подпись к параметрам запроса
 * @param {Object} params - Параметры запроса
 * @returns {Object} Параметры с подписью
 */
const addSignature = (params) => {
  const signature = createSignature(params);
  if (signature) {
    return { ...params, signature };
  }
  return params;
};

/**
 * Получить список организаций
 * @param {number} cityId - ID города (опционально)
 * @returns {Promise<Array>} Массив организаций
 */
export const fetchOrganisations = async (cityId = null) => {
  try {
    if (!API_TOKEN || !API_SALT) {
      throw new Error('API_TOKEN и API_SALT должны быть настроены в .env файле');
    }

    const params = {};
    if (cityId) {
      params.cityId = cityId;
    }

    const paramsWithSignature = addSignature(params);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Запрос к /organisation/list с параметрами:', paramsWithSignature);
    }
    
    const response = await quickTicketsClient.get('/organisation/list', { params: paramsWithSignature });
    const data = response.data;

    if (data && data.organisations) {
      // organisations может быть объектом с ключами-идентификаторами или массивом
      const organisationsArray = Array.isArray(data.organisations)
        ? data.organisations
        : Object.values(data.organisations);

      return organisationsArray.map((org) => ({
        id: org.id,
        alias: org.alias,
        name: org.name,
        urlAvatar: org.urlAvatar,
        urlAvatarSmall: org.urlAvatarSmall,
        urlAfisha: org.urlAfisha,
        address: org.address,
        phones: org.phones || [],
        city: org.city,
        district: org.district,
        area: org.area,
      }));
    }
    return [];
  } catch (error) {
    console.error('Ошибка при получении списка организаций из QuickTickets:', error);
    throw error;
  }
};

/**
 * Получить список детализаций (сеансов) для организации
 * @param {string|number} organisationId - ID или алиас организации
 * @param {number} eventId - ID мероприятия (опционально)
 * @returns {Promise<Array>} Массив детализаций
 */
export const fetchSessions = async (organisationId, eventId = null) => {
  try {
    const params = {};
    if (organisationId) {
      // Проверяем, это число или строка (алиас)
      if (typeof organisationId === 'number' || /^\d+$/.test(organisationId)) {
        params.organisationId = organisationId;
      } else {
        params.organisationAlias = organisationId;
      }
    }
    if (eventId) {
      params.eventId = eventId;
    }

    const paramsWithSignature = addSignature(params);
    const response = await quickTicketsClient.get('/session/list', { params: paramsWithSignature });
    const data = response.data;
    
    if (data && data.sessions) {
      // sessions может быть объектом с ключами-идентификаторами или массивом
      const sessionsArray = Array.isArray(data.sessions) 
        ? data.sessions 
        : Object.values(data.sessions);
      
      return sessionsArray.map((session) => ({
        id: session.id,
        eventId: session.event?.id,
        eventName: session.event?.name,
        timeStart: session.timeStart, // Unix timestamp
        timeEnd: session.timeEnd,
        url: session.url, // Ссылка на продажу билетов
        minPrice: session.minPrice,
        maxPrice: session.maxPrice,
        countAvailableAnyplaces: session.countAvailableAnyplaces,
        hall: session.hall,
        address: session.address,
        changeEvent: session.changeEvent,
        changeTimeStart: session.changeTimeStart,
        pushkincard: session.pushkincard,
      }));
    }
    return [];
  } catch (error) {
    console.error('Ошибка при получении детализаций из QuickTickets:', error);
    throw error;
  }
};

/**
 * Получить список мероприятий для организации
 * @param {string|number} organisationId - ID или алиас организации
 * @returns {Promise<Array>} Массив мероприятий
 */
export const fetchEvents = async (organisationId) => {
  try {
    const params = {};
    if (organisationId) {
      if (typeof organisationId === 'number' || /^\d+$/.test(organisationId)) {
        params.organisationId = organisationId;
      } else {
        params.organisationAlias = organisationId;
      }
    }

    const paramsWithSignature = addSignature(params);
    const response = await quickTicketsClient.get('/event/list', { params: paramsWithSignature });
    const data = response.data;
    
    if (data && data.events) {
      // events может быть объектом с ключами-идентификаторами или массивом
      const eventsArray = Array.isArray(data.events) 
        ? data.events 
        : Object.values(data.events);
      
      return eventsArray.map((event) => ({
        id: event.id,
        name: event.name,
        ageRestriction: event.ageRestriction,
        shortDescription: event.shortDescription,
        urlAvatar: event.urlAvatar,
        urlAvatarSmall: event.urlAvatarSmall,
        url: event.url,
        organisationId: organisationId, // Сохраняем ID организации для дальнейшего использования
      }));
    }
    return [];
  } catch (error) {
    console.error('Ошибка при получении мероприятий из QuickTickets:', error);
    throw error;
  }
};

/**
 * Найти детализации по названию спектакля
 * @param {string|number|null} organisationId - ID или алиас организации (опционально, если null - ищет по всем)
 * @param {string} performanceTitle - Название спектакля для поиска
 * @returns {Promise<Array>} Массив детализаций, отсортированных по дате
 */
export const findSessionsByPerformanceTitle = async (organisationId, performanceTitle) => {
  try {
    let events = [];
    
    if (organisationId) {
      // Если указан organisationId, ищем только в этой организации
      events = await fetchEvents(organisationId);
    } else {
      // Если organisationId не указан, получаем список всех организаций и ищем по всем
      const organisations = await fetchOrganisations();
      
      // Ищем мероприятия во всех организациях
      for (const org of organisations) {
        try {
          const orgEvents = await fetchEvents(org.id);
          events.push(...orgEvents);
        } catch (error) {
          console.warn(`Не удалось получить мероприятия для организации ${org.name}:`, error);
        }
      }
    }
    
    // Ищем мероприятие по названию (нечеткое совпадение)
    const matchingEvent = events.find((event) => {
      const eventName = event.name.toLowerCase().trim();
      const searchName = performanceTitle.toLowerCase().trim();
      // Проверяем точное совпадение или вхождение
      return eventName === searchName || eventName.includes(searchName) || searchName.includes(eventName);
    });

    if (!matchingEvent) {
      console.warn(`Мероприятие "${performanceTitle}" не найдено в QuickTickets`);
      return [];
    }

    // Определяем organisationId для получения сеансов
    let orgId = organisationId;
    if (!orgId && matchingEvent.organisationId) {
      orgId = matchingEvent.organisationId;
    }

    // Получаем детализации для найденного мероприятия
    const sessions = await fetchSessions(orgId, matchingEvent.id);
    
    // Фильтруем только будущие сеансы и сортируем по дате
    const now = Math.floor(Date.now() / 1000); // Текущее время в Unix timestamp
    const futureSessions = sessions
      .filter((session) => session.timeStart > now)
      .sort((a, b) => a.timeStart - b.timeStart);

    return futureSessions;
  } catch (error) {
    console.error('Ошибка при поиске детализаций по названию:', error);
    return [];
  }
};

/**
 * Форматировать дату и время из Unix timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {Object} Объект с отформатированной датой и временем
 */
export const formatSessionDateTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return {
    date: date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    fullDate: date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

