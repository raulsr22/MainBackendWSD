import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  const config = new DocumentBuilder() // Parece que esto sirve para poder ver los endpoints en Swagger
    .setTitle('Time Bank API')
    .setDescription('Documentación oficial del backend para el Time Bank (Sprint 1)')
    .setVersion('1.0')
    .addBearerAuth() // Le dice a Swagger que usamos tokens JWT
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
