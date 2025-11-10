# Настройка Strapi для работы с пользователями, избранным и рецензиями

## 1. Настройка пользователей

Strapi уже имеет встроенную систему пользователей через плагин `users-permissions`. Нужно только добавить дополнительные поля:

### Добавление полей в User (через админ-панель Strapi):

1. Зайдите в **Content-Type Builder**
2. Найдите **User** (в разделе Users & Permissions)
3. Добавьте следующие поля:
   - `firstName` (Text)
   - `lastName` (Text)
   - `bio` (Rich Text или Text)
   - `avatar` (Media - Single)
   - `favorites` (Relation - Many-to-Many с Performance)

## 2. Создание Content Type для рецензий

1. В **Content-Type Builder** создайте новый Collection Type:
   - Display name: `Review`
   - API ID: `review`

2. Добавьте поля:
   - `title` (Text) - обязательное
   - `text` (Rich Text) - обязательное
   - `rating` (Number) - опциональное
   - `performance` (Relation - Many-to-One с Performance) - обязательное
   - `user` (Relation - Many-to-One с User) - обязательное
   - `likes` (Relation - Many-to-Many с User) - для лайков

## 3. Настройка прав доступа

### Для Users:
1. Зайдите в **Settings → Users & Permissions Plugin → Roles**
2. Выберите роль **Authenticated**
3. В разделе **User** разрешите:
   - `find` - найти пользователей
   - `findOne` - найти одного пользователя
   - `update` - обновить свой профиль
   - `me` - получить свои данные

### Для Reviews:
1. В той же роли **Authenticated** в разделе **Review** разрешите:
   - `find` - найти рецензии
   - `findOne` - найти одну рецензию
   - `create` - создать рецензию
   - `update` - обновить свою рецензию
   - `delete` - удалить свою рецензию

2. Для роли **Public** разрешите:
   - `find` - найти рецензии
   - `findOne` - найти одну рецензию

### Для Performance:
1. Для роли **Public** разрешите:
   - `find` - найти спектакли
   - `findOne` - найти один спектакль

## 4. Настройка CORS (если нужно)

В `config/middlewares.ts` убедитесь, что CORS настроен правильно:

```typescript
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'], // URL вашего фронтенда
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

## 5. Проверка работы

После настройки проверьте:

1. Регистрация работает: `/api/auth/local/register`
2. Вход работает: `/api/auth/local`
3. Получение данных пользователя: `/api/users/me` (с токеном)
4. Создание рецензии: `/api/reviews` (с токеном)
5. Получение рецензий: `/api/reviews` (публично)

## Примечания

- Убедитесь, что в Strapi включен плагин `users-permissions`
- Для работы с медиа (аватарки) убедитесь, что права на загрузку файлов настроены
- В production обязательно настройте CORS правильно

