import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as path from 'path';
import * as fs from 'fs-extra';
import { fastifyCompress } from '@fastify/compress';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { IoAdapter } from '@nestjs/platform-socket.io';

// ❌ เลิกแก้ global.__dirname (เสี่ยงพัง libs อื่น)
// ✅ ใช้ BASE_DIR แบบปลอดภัยแทน
const BASE_DIR = path.resolve(__dirname, '..'); // เมื่อ build แล้ว == /app
const UPLOADS_DIR = path.join(BASE_DIR, 'uploads');

async function bootstrap() {
  process.env.TZ = 'Asia/Bangkok';
  await fs.ensureDir(UPLOADS_DIR);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 100 * 1024 * 1024,
      logger: {
        level: 'error', // จะโชว์เฉพาะ error/warn
      },
      maxParamLength: 1000,
    }),
  );

  // WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // -------- Middlewares/Plugins Order แนะนำ --------
  // 1) CORS ก่อน
  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      const allowed = ['https://thunderbolt.shop', 'http://localhost:3001'];
      if (!origin || allowed.includes(origin)) callback(null, true);
      else callback(null, false);
    },
    methods: ['POST', 'PUT', 'DELETE', 'GET', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  });

  // 2) Rate limit
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  });

  // 3) Compression (ตั้ง threshold ป้องกันไปยุ่งกับ binary เล็ก ๆ)
  await app.register(fastifyCompress, {
    encodings: ['br', 'gzip', 'deflate'],
    threshold: 1024, // bytes; < 1KB จะไม่บีบอัด
  });

  // 4) Multipart upload
  await app.register(multipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 100 * 1024 * 1024,
      fieldSize: 1024 * 1024,
    },
  });

  // 5) Static files (หลัง compress เพื่อให้ static ได้ประโยชน์จากการบีบอัดสำหรับ text)
  app.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: '/api/uploads/',
    // maxAge: '1d', // จะเปิด cache ก็ได้
  });

  // Prefix
  app.setGlobalPrefix('/api');

  // -------- Health endpoints (ช่วยเรื่อง restart/healthcheck) --------
  const fastify = app.getHttpAdapter().getInstance();
  fastify.get('/health', async (_req, reply) => {
    // อย่าตรวจ DB หนัก ๆ ตรงนี้ ให้เป็น check เบา ๆ
    reply.type('text/plain').send('ok');
  });
  fastify.get('/api/health', async (_req, reply) => {
    reply.type('application/json').send({ ok: true });
  });

  // -------- Hook ป้องกัน Content-Type mismatch ที่พบบ่อย --------
  fastify.addHook('onSend', (req, reply, payload, done) => {
    try {
      const ct = (
        reply.getHeader('content-type') as string | undefined
      )?.toLowerCase();

      // ถ้า payload เป็น Buffer/stream แต่ content-type เป็น JSON -> แก้ให้เป็น octet-stream เพื่อกัน warning
      // (fastify จะส่ง stream/Buffer ผ่าน hook นี้ด้วย)
      const looksLikeJson = ct?.includes('application/json');
      const isBuffer = Buffer.isBuffer(payload);
      // NOTE: สำหรับ stream จริง ๆ payload จะเป็น null/undefined ใน hook นี้ แต่เผื่อกรณีส่ง Buffer
      if (isBuffer && looksLikeJson) {
        reply.header('content-type', 'application/octet-stream');
      }
    } catch (e) {
      // noop
    }
    done(null, payload as any);
  });

  // -------- Graceful shutdown (กัน SIGTERM กลายเป็น crash loop) --------
  app.enableShutdownHooks();
  ['SIGTERM', 'SIGINT'].forEach((sig) => {
    process.on(sig as NodeJS.Signals, async () => {
      try {
        // ปิด server และ ws/microservices อย่างเรียบร้อย
        await app.close();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });
  });

  // (ถ้าไม่มีไมโครเซอร์วิสจริง ๆ ตัดบรรทัดนี้ออกได้)
  // await app.startAllMicroservices();

  // ฟังพอร์ต
  await app.listen(4001, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
