import axios from 'axios';

// Базовый URL Strapi
export const BASE_URL =
  process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

// Общий axios клиент
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Вспомогательные функции для распаковки ответов Strapi v4/v5
const getMediaUrl = (mediaNode) => {
  if (!mediaNode) return undefined;
  const attrs = mediaNode.attributes || mediaNode;
  let url = attrs.url;
  if (!url && attrs.formats) {
    const preferredOrder = ['large', 'medium', 'small', 'thumbnail'];
    for (const key of preferredOrder) {
      const fmtUrl = attrs.formats?.[key]?.url;
      if (fmtUrl) {
        url = fmtUrl;
        break;
      }
    }
  }
  if (!url) return undefined;
  return String(url).startsWith('http') ? url : `${BASE_URL}${url}`;
};

const getSingleMedia = (imageField) => {
  if (!imageField) return null;
  if (typeof imageField === 'string') {
    return imageField.startsWith('http') ? imageField : `${BASE_URL}${imageField}`;
  }
  if (imageField.url) {
    return imageField.url.startsWith('http')
      ? imageField.url
      : `${BASE_URL}${imageField.url}`;
  }
  if (imageField.data) return getMediaUrl(imageField.data);
  return null;
};

const getMultipleMedia = (galleryField) => {
  if (!galleryField) return [];
  if (Array.isArray(galleryField)) {
    return galleryField.map((g) => getSingleMedia(g)).filter(Boolean);
  }
  if (Array.isArray(galleryField.data)) {
    return galleryField.data.map(getMediaUrl).filter(Boolean);
  }
  return [];
};

const unwrapEntry = (entry) => {
  if (entry && typeof entry === 'object' && 'attributes' in entry) {
    return { id: entry.id, ...entry.attributes };
  }
  return entry;
};

const unwrapCollection = (data) => (Array.isArray(data) ? data.map(unwrapEntry) : []);

// Slider
export const fetchSliderData = async () => {
  try {
    const { data } = await apiClient.get('/api/sliders?populate=*');
    return unwrapCollection(data.data)
      .map((item) => {
        let images = [];
        if (Array.isArray(item.image?.data)) {
          images = item.image.data.map(getMediaUrl).filter(Boolean);
        } else if (Array.isArray(item.image)) {
          images = item.image.map(getMediaUrl).filter(Boolean);
        } else if (item.image?.url) {
          images = [getMediaUrl(item.image)];
        }
        return {
          id: item.id,
          // В схеме опечатка: tetle → используем как title
          title: item.tetle || 'No Title',
          imageUrl: images[0] || null,
          order: item.order ?? 0,
        };
      })
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Ошибка при получении данных слайдера:', error);
    throw error;
  }
};

// News
export const fetchNewsData = async () => {
  try {
    // В схеме pluralName: "newsp" → эндпоинт: /api/newsp
    const { data } = await apiClient.get('/api/newsp?populate=*');
    return unwrapCollection(data.data).map((item) => ({
      id: item.id,
      title: item.title || 'Без названия',
      date: item.date || null,
      text: item.text || '',
      image: getSingleMedia(item.image),
      gallery: getMultipleMedia(item.gallery),
    }));
  } catch (error) {
    console.error('Ошибка при получении данных новостей:', error);
    throw error;
  }
};

// Пагинация новостей с сервера
export const fetchNewsPage = async (page = 1, pageSize = 5) => {
  try {
    const { data } = await apiClient.get(
      `/api/newsp?populate=*&sort=date:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
    );
    const items = unwrapCollection(data.data).map((item) => ({
      id: item.id,
      title: item.title || 'Без названия',
      date: item.date || null,
      text: item.text || '',
      image: getSingleMedia(item.image),
      gallery: getMultipleMedia(item.gallery),
    }));
    return { items, pagination: data.meta?.pagination };
  } catch (error) {
    console.error('Ошибка при пагинации новостей:', error);
    throw error;
  }
};

// Performances
export const fetchPerformancesData = async () => {
  try {
    const { data } = await apiClient.get(
      '/api/performances?populate=*&pagination[page]=1&pagination[pageSize]=100&sort[0]=createdAt:asc'
    );
    return unwrapCollection(data.data).map((item) => ({
      id: item.id,
      title: item.title || 'Без названия',
      description: item.description || 'Описание недоступно',
      creators: item.creators || '',
      cast: item.cast || '',
      image: getSingleMedia(item.image),
      gallery: getMultipleMedia(item.gallery),
      dates: Array.isArray(item.dates) ? item.dates : [],
    }));
  } catch (error) {
    console.error('Ошибка при получении данных спектаклей:', error);
    throw error;
  }
};

// Artists
export const fetchArtistsData = async () => {
  try {
    const { data } = await apiClient.get(
      '/api/artists?populate=*&pagination[page]=1&pagination[pageSize]=100&sort[0]=createdAt:asc'
    );
    return unwrapCollection(data.data).map((item) => ({
      id: item.id,
      name: item.name || 'Без имени',
      title: item.title || 'Звание не указано',
      photo: getSingleMedia(item.photo),
      bio: item.bio || 'Информация недоступна',
      gallery: getMultipleMedia(item.gallery),
    }));
  } catch (error) {
    console.error('Ошибка при получении данных артистов:', error);
    throw error;
  }
};

// Teams
export const fetchTeamsData = async () => {
  try {
    const { data } = await apiClient.get(
      '/api/teams?populate=*&pagination[page]=1&pagination[pageSize]=100&sort[0]=createdAt:asc'
    );
    return unwrapCollection(data.data).map((item) => ({
      id: item.id,
      name: item.name || 'Без имени',
      title: item.title || 'Звание не указано',
      photo: getSingleMedia(item.photo),
      bio: item.bio || 'Информация недоступна',
    }));
  } catch (error) {
    console.error('Ошибка при получении данных команды:', error);
    throw error;
  }
};

// Repertoire months
export const fetchRepertoireMonths = async () => {
  try {
    const { data } = await apiClient.get('/api/repertoire-months?populate=*');
    return unwrapCollection(data.data).map((item) => ({
      id: item.id,
      name: item.name || '',
      image: getSingleMedia(item.image),
    }));
  } catch (error) {
    console.error('Ошибка при получении данных репертуара:', error);
    return [];
  }
};

// About
export const fetchAboutData = async () => {
  const endpoints = [
    '/api/about?populate=images',     // если About = Single Type
    '/api/abouts?populate=images',    // если About = Collection Type
    '/api/abouts?populate=*',         // запасной вариант
    '/api/about?populate=*',          // запасной вариант
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const { data } = await apiClient.get(endpoint);

      // Single Type: data.data = { id, attributes }
      // Collection Type: data.data = [ { id, attributes }, ... ]
      const raw = data?.data;
      const entry = Array.isArray(raw) ? unwrapEntry(raw[0]) : unwrapEntry(raw);

      if (!entry) continue;

      return {
        TextP1: entry.TextP1 ?? '',
        // images: Multiple Media
        images: getMultipleMedia(entry.images),
      };
    } catch (error) {
      lastError = error;
    }
  }

  console.error('Ошибка при получении данных "О театре":', lastError);
  return { TextP1: '', images: [] };
};

// Универсальные статические страницы (например: услуги, контакты и т.п.)
export const fetchStaticPage = async (slug) => {
  try {
    if (!slug) throw new Error('Не передан slug страницы');
    const { data } = await apiClient.get(
      `/api/site-pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
    );
    const items = unwrapCollection(data.data);
    const page = items[0];
    if (!page) return null;
    return {
      id: page.id,
      title: page.title || '',
      content: page.content || '',
    };
  } catch (error) {
    console.error(`Ошибка при получении статической страницы (${slug}):`, error);
    throw error;
  }
};

// SingleType для Services
export const fetchServiceData = async () => {
  const endpoints = ['/api/service?populate=*', '/api/services?populate=*', '/api/services?populate=*'];
  const fieldCandidates = ['Services', 'content', 'text', 'body', 'richtext'];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const { data } = await apiClient.get(endpoint);
      const service = unwrapEntry(data.data);
      if (!service) continue;
      const contentField =
        fieldCandidates
          .map((k) => service?.[k])
          .find((v) => typeof v === 'string' && v.trim().length > 0) || '';
      return {
        id: service.id,
        title: service.title || 'Услуги',
        content: contentField,
      };
    } catch (error) {
      lastError = error;
    }
  }
  console.error('Ошибка при получении данных услуг:', lastError);
  return null;
};

// SingleType для Contacts
export const fetchContactData = async () => {
  const endpoints = ['/api/contact?populate=*', '/api/contacts?populate=*', '/api/constact?populate=*'];
  const fieldCandidates = ['Contact', 'content', 'text', 'body', 'richtext'];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const { data } = await apiClient.get(endpoint);
      const contact = unwrapEntry(data.data);
      if (!contact) continue;
      const contentField =
        fieldCandidates
          .map((k) => contact?.[k])
          .find((v) => typeof v === 'string' && v.trim().length > 0) || '';
      return {
        id: contact.id,
        title: contact.title || 'Контакты',
        content: contentField,
      };
    } catch (error) {
      lastError = error;
    }
  }
  console.error('Ошибка при получении данных контактов:', lastError);
  return null;
};

// Documents list (PDF и др. файлы)
export const fetchDocumentsList = async () => {
  const endpoints = ['/api/docs?populate=*', '/api/documents?populate=*', '/api/doc?populate=*'];
  const titleFields = ['doc_name', 'title', 'name'];
  const fileFields = ['document', 'file'];
  try {
    for (const endpoint of endpoints) {
      try {
        const { data } = await apiClient.get(endpoint);
        const items = unwrapCollection(data.data).map((doc) => {
          const title =
            titleFields
              .map((k) => doc?.[k])
              .find((v) => typeof v === 'string' && v.trim()) || 'Документ';
          const fileNode = fileFields.map((k) => doc?.[k]).find((v) => v);
          const fileUrl = getSingleMedia(fileNode);
          return {
            id: doc.id,
            title,
            url: fileUrl || null,
            description: doc.description || '',
            date: doc.date || null,
          };
        });
        const withUrl = items.filter((d) => !!d.url);
        if (withUrl.length) return withUrl;
      } catch (e) {
        // пробуем следующий endpoint
      }
    }
  } catch (error) {
    console.error('Ошибка при получении списка документов:', error);
  }
  return [];
};

// SingleType для Touring
export const fetchTouringData = async () => {
  const endpoints = ['/api/touring?populate=*', '/api/tourings?populate=*'];
  const fieldCandidates = ['Touring', 'touring', 'content', 'text', 'body', 'richtext'];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const { data } = await apiClient.get(endpoint);
      const touring = unwrapEntry(data.data);
      if (!touring) continue;
      const contentField =
        fieldCandidates
          .map((k) => touring?.[k])
          .find((v) => typeof v === 'string' && v.trim().length > 0) || '';
      return {
        id: touring.id,
        title: touring.title || 'Гастролёрам',
        content: contentField,
      };
    } catch (error) {
      lastError = error;
    }
  }
  console.error('Ошибка при получении данных Touring:', lastError);
  return null;
};
