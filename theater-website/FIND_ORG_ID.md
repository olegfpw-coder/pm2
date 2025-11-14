# Как найти свой Organisation ID

## Способ 1: Через консоль браузера (рекомендуется)

1. Откройте ваш сайт в браузере
2. Откройте консоль разработчика (F12)
3. Перейдите на вкладку Console
4. Вставьте и выполните следующий код:

```javascript
// Импортируем функцию (если используете модули)
// Или создайте временный скрипт

// Если у вас есть доступ к API напрямую, используйте:
fetch('https://api2.quicktickets.ru/afisha/v2/organisation/list?signature=ваша_подпись')
  .then(res => res.json())
  .then(data => {
    console.log('Список организаций:', data);
    if (data.organisations) {
      const orgs = Array.isArray(data.organisations) 
        ? data.organisations 
        : Object.values(data.organisations);
      orgs.forEach(org => {
        console.log(`ID: ${org.id}, Алиас: ${org.alias}, Название: ${org.name}`);
      });
    }
  });
```

## Способ 2: Через код в проекте

Создайте временный файл `find-org-id.js` в корне проекта `theater-website`:

```javascript
require('dotenv').config();
const axios = require('axios');
const CryptoJS = require('crypto-js');

const API_TOKEN = process.env.REACT_APP_QUICKTICKETS_API_TOKEN;
const API_SALT = process.env.REACT_APP_QUICKTICKETS_API_SALT;

const createSignature = (params) => {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const signatureString = `${paramString}${API_SALT}${API_TOKEN}`;
  return CryptoJS.MD5(signatureString).toString();
};

const params = {};
const signature = createSignature(params);
const url = `https://api2.quicktickets.ru/afisha/v2/organisation/list?signature=${signature}`;

axios.get(url)
  .then(response => {
    const data = response.data;
    if (data && data.organisations) {
      const orgs = Array.isArray(data.organisations) 
        ? data.organisations 
        : Object.values(data.organisations);
      
      console.log('\n=== Список организаций ===\n');
      orgs.forEach(org => {
        console.log(`ID: ${org.id}`);
        console.log(`Алиас: ${org.alias || 'не указан'}`);
        console.log(`Название: ${org.name}`);
        console.log(`Адрес: ${org.address || 'не указан'}`);
        console.log('---');
      });
    }
  })
  .catch(error => {
    console.error('Ошибка:', error.response?.data || error.message);
  });
```

Запустите:
```bash
node find-org-id.js
```

## Способ 3: Обратиться в поддержку QuickTickets

Напишите в поддержку QuickTickets и запросите ваш `organisationId` или `organisationAlias`.

## Важно

После того как вы найдете свой `organisationId`, добавьте его в `.env`:

```env
REACT_APP_QUICKTICKETS_ORG_ID=ваш_id_здесь
```

Но помните: **это не обязательно!** Система может работать и без указания `organisationId` - она будет искать мероприятия по всем организациям автоматически.





