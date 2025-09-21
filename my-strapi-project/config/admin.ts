export default ({ env }) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
        salt: env('API_TOKEN_SALT'),
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT'),
        },
    },
    // Добавь эту настройку
    i18n: {
        locales: ['en', 'ru'], // Поддерживаемые языки
        defaultLocale: 'ru',   // Язык по умолчанию
    },
});