import axios from 'axios';
import CryptoJS from 'crypto-js';

// Базовый URL API QuickTickets
const BASE_URL = 'https://api2.quicktickets.ru/afisha/v2';
// Прокси (Strapi): если указан, все запросы пойдут через него без подписи на клиенте
const PROXY_BASE = process.env.REACT_APP_QT_PROXY_URL || null;

// Получаем токены из переменных окружения
const API_TOKEN = process.env.REACT_APP_QUICKTICKETS_API_TOKEN || '';
const API_SALT = process.env.REACT_APP_QUICKTICKETS_API_SALT || '';

// Кэширование ответов (простое, в памяти)
const CACHE_TTL = 5 * 60 * 1000; // 5 минут
const cache = {
  organisations: { data: null, expiresAt: 0, key: null },
  eventsByOrg: new Map(), // key -> { data, expiresAt }
  sessionsByOrgEvent: new Map(), // key -> { data, expiresAt }
};

// Создаем axios клиент: либо на прямой API, либо на прокси
const quickTicketsClient = axios.create({
  baseURL: PROXY_BASE || BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(PROXY_BASE ? {} : (API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {})),
  },
});

// Вспомогательный билдер строки параметров (в алфавитном порядке ключей)
const buildParamString = (params) => {
  const paramsWithoutSignature = { ...params };
  delete paramsWithoutSignature.signature;
  const sortedKeys = Object.keys(paramsWithoutSignature).sort();
  if (sortedKeys.length === 0) return '';
  return sortedKeys
    .map((key) => `${key}=${paramsWithoutSignature[key]}`)
    .join('&');
};

// Создать подпись по выбранному варианту конкатенации
const createSignatureByVariant = (params, variant = 1) => {
  if (!API_TOKEN || !API_SALT) {
    console.warn('API_TOKEN или API_SALT не настроены');
    return '';
  }
  const paramString = buildParamString(params);
  const parts = {
    params: paramString || '',
    salt: API_SALT,
    token: API_TOKEN,
  };
  let signatureString = '';
  switch (variant) {
    case 1: // params + salt + token
      signatureString = `${parts.params}${parts.salt}${parts.token}`;
      break;
    case 2: // params + token + salt
      signatureString = `${parts.params}${parts.token}${parts.salt}`;
      break;
    case 3: // salt + token + params
      signatureString = `${parts.salt}${parts.token}${parts.params}`;
      break;
    case 4: // token + salt + params
      signatureString = `${parts.token}${parts.salt}${parts.params}`;
      break;
    default:
      signatureString = `${parts.params}${parts.salt}${parts.token}`;
  }
  const signature = CryptoJS.MD5(signatureString).toString();
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Отладка подписи ===');
    console.log('Вариант:', variant);
    console.log('Параметры:', params);
    console.log('Строка параметров:', paramString || '(пусто)');
    console.log('Строка для подписи:', signatureString);
    console.log('Подпись (MD5):', signature);
  }
  return signature;
};

// Выполнить GET с автоматическим перебором вариантов подписи
const getWithSignatureRetry = async (path, params = {}) => {
  // При использовании прокси подпись формируется на сервере — отправляем как есть
  if (PROXY_BASE) {
    return quickTicketsClient.get(path, { params });
  }
  const variants = [1, 2, 3, 4];
  let lastError = null;
  for (const v of variants) {
    try {
      const signature = createSignatureByVariant(params, v);
      const response = await quickTicketsClient.get(path, { params: { ...params, signature } });
      if (process.env.NODE_ENV === 'development') {
        console.log(`[QuickTickets] Успешно с вариантом подписи #${v}: ${path}`);
      }
      return response;
    } catch (e) {
      lastError = e;
      const status = e?.response?.status;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[QuickTickets] Ошибка с вариантом #${v} (${status || 'no status'}) для ${path}`);
      }
      if (status === 403) break; // вероятная блокировка домена — нет смысла перебирать
    }
  }
  throw lastError;
};

const ensureCredentials = () => {
  if (!API_TOKEN || !API_SALT) {
    throw new Error(
      'QuickTickets API credentials are not configured. Please set REACT_APP_QUICKTICKETS_API_TOKEN and REACT_APP_QUICKTICKETS_API_SALT.'
    );
  }
};

const getCacheKey = (organisationId, eventId = null, extra = '') => {
  const orgKey =
    organisationId === null || typeof organisationId === 'undefined'
      ? 'all'
      : typeof organisationId === 'number'
      ? `id:${organisationId}`
      : `alias:${organisationId}`;
  const eventKey =
    eventId === null || typeof eventId === 'undefined' ? 'all' : `event:${eventId}`;
  return [orgKey, eventKey, extra].filter(Boolean).join('|');
};

const readCache = (entry) => {
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    return null;
  }
  return entry.data;
};

const writeCache = (store, key, data, ttl = CACHE_TTL) => {
  store.set(key, { data, expiresAt: Date.now() + ttl });
};

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
  // По умолчанию используем вариант #1 (стандартный по документации)
  return createSignatureByVariant(params, 1);
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
    ensureCredentials();
    const params = {};
    if (cityId) {
      params.cityId = cityId;
    }

    // Используем кэш только если не указан cityId
    const cacheKey = cityId ? `city:${cityId}` : 'all';
    if (!cityId) {
      const cached = readCache(cache.organisations.key === cacheKey ? cache.organisations : null);
      if (cached) {
        return cached;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Запрос к /organisation/list с параметрами:', params);
    }

    const response = await getWithSignatureRetry('/organisation/list', params);
    const data = response.data;

    let result = [];
    if (data && data.organisations) {
      // organisations может быть объектом с ключами-идентификаторами или массивом
      const organisationsArray = Array.isArray(data.organisations)
        ? data.organisations
        : Object.values(data.organisations);

      result = organisationsArray.map((org) => ({
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
    if (!cityId) {
      cache.organisations = {
        data: result,
        expiresAt: Date.now() + CACHE_TTL,
        key: cacheKey,
      };
    }
    return result;
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
    ensureCredentials();
    const cacheKey = getCacheKey(organisationId, eventId, 'sessions');
    const cached = readCache(cache.sessionsByOrgEvent.get(cacheKey));
    if (cached) {
      return cached;
    }

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

    const response = await getWithSignatureRetry('/session/list', params);
    const data = response.data;
    
    let result = [];
    // Универсально распаковываем возможные форматы ответа
    let sessionsArray = [];
    if (data?.sessions) {
      sessionsArray = Array.isArray(data.sessions) ? data.sessions : Object.values(data.sessions);
    } else if (data?.data?.sessions) {
      sessionsArray = Array.isArray(data.data.sessions) ? data.data.sessions : Object.values(data.data.sessions);
    } else if (Array.isArray(data?.data)) {
      sessionsArray = data.data;
    } else if (Array.isArray(data)) {
      sessionsArray = data;
    } else if (data?.result?.sessions) {
      sessionsArray = Array.isArray(data.result.sessions) ? data.result.sessions : Object.values(data.result.sessions);
    } else if (data && typeof data === 'object') {
      // Некоторые ответы могут возвращать объект с ключами-идентификаторами на верхнем уровне
      // Попробуем интерпретировать как словарь сеансов, если значения похожи на объекты сеансов
      const values = Object.values(data);
      if (values.length && typeof values[0] === 'object' && ('timeStart' in values[0] || 'event' in values[0])) {
        sessionsArray = values;
      }
    }

    if (Array.isArray(sessionsArray)) {
      result = sessionsArray.map((session) => ({
        id: session.id,
        eventId: session.event?.id,
        eventName: session.event?.name || session.eventName || session.name,
        timeStart: Number(session.timeStart) || Number(session.start) || Number(session.startTime) || 0,
        timeEnd: session.timeEnd ?? session.end ?? null,
        url: session.url,
        minPrice: session.minPrice ?? session.priceMin ?? null,
        maxPrice: session.maxPrice ?? session.priceMax ?? null,
        countAvailableAnyplaces: session.countAvailableAnyplaces ?? null,
        hall: session.hall ?? null,
        address: session.address ?? null,
        changeEvent: session.changeEvent ?? false,
        changeTimeStart: session.changeTimeStart ?? false,
        pushkincard: session.pushkincard ?? false,
      }));
    }
    cache.sessionsByOrgEvent.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL,
    });
    return result;
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
    ensureCredentials();
    const cacheKey = getCacheKey(organisationId, null, 'events');
    if (cache.eventsByOrg.has(cacheKey)) {
      const cached = readCache(cache.eventsByOrg.get(cacheKey));
      if (cached) {
        return cached;
      }
    }

    const params = {};
    if (organisationId) {
      if (typeof organisationId === 'number' || /^\d+$/.test(organisationId)) {
        params.organisationId = organisationId;
      } else {
        params.organisationAlias = organisationId;
      }
    }

    const response = await getWithSignatureRetry('/event/list', params);
    const data = response.data;
    
    let result = [];
    if (data && data.events) {
      // events может быть объектом с ключами-идентификаторами или массивом
      const eventsArray = Array.isArray(data.events) 
        ? data.events 
        : Object.values(data.events);
      
      result = eventsArray.map((event) => ({
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
    writeCache(cache.eventsByOrg, cacheKey, result);
    return result;
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
/**
 * Найти детализации по названию спектакля
 * @param {string|number|null} organisationId - ID или алиас организации (опционально, если null - ищет по всем)
 * @param {string} performanceTitle - Название спектакля для поиска
 * @returns {Promise<Array>} Массив детализаций, отсортированных по дате
 */
export const findSessionsByPerformanceTitle = async (organisationId, performanceTitle) => {
  try {
    const normalizeTitle = (s) => {
      if (!s) return '';
      return String(s)
        .toLowerCase()
        .replace(/[«»"“”„']/g, '')   // кавычки
        .replace(/[.]/g, '')         // точки
        .replace(/\s*-\s*/g, ' ')    // дефис между словами → пробел
        .replace(/\(.*?\)/g, '')     // вырезать всё в круглых скобках
        .replace(/\s+/g, ' ')        // схлопываем пробелы
        .trim();
    };

    const search = normalizeTitle(performanceTitle);

    // ---------- 1. Попытка через event/list (как раньше) ----------
    let events = [];

    if (organisationId) {
      events = await fetchEvents(organisationId);
    } else {
      const organisations = await fetchOrganisations();
      for (const org of organisations) {
        try {
          const orgEvents = await fetchEvents(org.id);
          events.push(...orgEvents);
        } catch (error) {
          console.warn(`Не удалось получить мероприятия для организации ${org.name}:`, error);
        }
      }
    }

    let matchingEvent = null;
    if (events.length) {
      matchingEvent = events.find((event) => {
        const eventName = normalizeTitle(event.name);
        return (
          eventName === search ||
          eventName.includes(search) ||
          search.includes(eventName)
        );
      });
    }

    const now = Math.floor(Date.now() / 1000);

    if (matchingEvent) {
      // Если нашли событие по имени — получаем его сеансы
      let orgId = organisationId;
      if (!orgId && matchingEvent.organisationId) {
        orgId = matchingEvent.organisationId;
      }

      const sessions = await fetchSessions(orgId, matchingEvent.id);
      const futureSessions = sessions
        .filter((session) => session.timeStart > now)
        .sort((a, b) => a.timeStart - b.timeStart);

      if (futureSessions.length > 0) {
        console.log(
          '[QT findSessionsByPerformanceTitle] найдено через event.list:',
          performanceTitle,
          '→',
          matchingEvent.name,
          'сеансов:',
          futureSessions.length
        );
        return futureSessions;
      }
    } else {
      console.warn(
        `[QT findSessionsByPerformanceTitle] не найдено совпадений в event.list для "${performanceTitle}" (search="${search}")`
      );
    }

    // ---------- 2. Fallback: по session/list (фильтрация по названию события) ----------
    // Здесь мы вообще не используем event/list, а идём сразу по сеансам

    let orgIdForSessions = organisationId || null;
    // если organisationId не передали — можно взять дефолтный из env, если у тебя он есть:
    // if (!orgIdForSessions && process.env.REACT_APP_QUICKTICKETS_ORG_ID) {
    //   orgIdForSessions = process.env.REACT_APP_QUICKTICKETS_ORG_ID;
    // }

    const allSessions = await fetchSessions(orgIdForSessions, null);

    const matchedSessions = allSessions.filter((session) => {
      const rawName =
        session.eventName ||
        session.event?.name ||
        session.name ||
        '';
      const normName = normalizeTitle(rawName);
      return (
        normName === search ||
        normName.includes(search) ||
        search.includes(normName)
      );
    });

    const futureMatched = matchedSessions
      .filter((session) => session.timeStart > now)
      .sort((a, b) => a.timeStart - b.timeStart);

    console.log(
      '[QT findSessionsByPerformanceTitle] fallback через session.list:',
      performanceTitle,
      'совпавших сеансов:',
      futureMatched.length
    );

    return futureMatched;
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

