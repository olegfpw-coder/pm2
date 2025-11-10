import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['ru', 'en'],
  },
  bootstrap(app: StrapiApp) {
    try {
      if (!localStorage.getItem('strapi-admin-language')) {
        localStorage.setItem('strapi-admin-language', 'ru');
      }
    } catch (_) {}
  },
};
