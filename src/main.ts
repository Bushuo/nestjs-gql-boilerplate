import "dotenv-safe/config";
import { NestFactory } from "@nestjs/core";
import * as session from "express-session";
import * as connectRedis from "connect-redis";

import { AppModule } from "./app.module";
import { redis } from "./app.redis";
import { COOKIE_NAME, REDIS_SESS_PREFIX, __prod__ } from "./app.constants";

const RedisStore = connectRedis(session);

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(
        session({
            name: COOKIE_NAME,
            secret: process.env.SESSION_SECRET,
            saveUninitialized: false,
            resave: false,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
                prefix: REDIS_SESS_PREFIX,
            }),
            cookie: {
                sameSite: "lax",
                maxAge: __prod__
                    ? 1000 * 60 * 60 * 24 * 4 /* 4 days*/
                    : 1000 * 60 * 60 * 24 * 365 * 10 /* 10 years */,
            },
        }),
    );

    await app.listen(4000);
}
bootstrap();
