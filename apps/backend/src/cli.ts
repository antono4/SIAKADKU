import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.close();
  // eslint-disable-next-line no-console
  console.log('Prisma seed complete.');
  process.exit(0);
}
bootstrap();
