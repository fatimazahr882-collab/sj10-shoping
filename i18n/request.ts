// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async (params: any) => {
  const locale = params.locale || 'en';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});