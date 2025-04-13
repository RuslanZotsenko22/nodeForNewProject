import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

//  Отримуємо абсолютний шлях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
    description: 'Форма збереження та email-розсилки',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local dev server',
    },
  ],
};

//  Шлях до всіх .js файлів у routes, включаючи вкладені
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, './routes/**/*.js')],
};

//  Перевірка, чи Swagger бачить файли
console.log('🔍 Swagger шукає в:', path.join(__dirname, './routes/**/*.js'));

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📚 Swagger доступний на: http://localhost:5000/api-docs');
};
