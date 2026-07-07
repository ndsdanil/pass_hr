/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем standalone output только если указана переменная окружения
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Настройки для TypeScript и ESLint в зависимости от переменных окружения
  typescript: {
    ignoreBuildErrors: process.env.NEXT_IGNORE_TS_ERRORS === 'true'
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_IGNORE_ESLINT === 'true'
  },
  
  // Настройки вебпака с алиасами для canvas и encoding
  webpack: (config, { isServer }) => {
    // Правильно обрабатываем canvas и encoding для Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false
    };

    // Если в production, добавляем дополнительную оптимизацию
    if (process.env.NODE_ENV === 'production') {
      // Оптимизируем размер бандла
      config.optimization = {
        ...config.optimization,
        minimize: true
      };
    }

    return config;
  },
  
  // Настройки экспериментальных функций
  experimental: {
    // Поддержка turbo если включен соответствующий флаг
    turbo: process.env.ENABLE_TURBO === 'true' ? {
      resolveAlias: {
        canvas: '',
        encoding: ''
      }
    } : undefined
  }
};

module.exports = nextConfig; 