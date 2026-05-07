import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });

    const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
