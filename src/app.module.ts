import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Redis } from "ioredis";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { redis } from "./app.redis";
import { Session as ExpressSession } from "express-session";
import { Request as ExpressRequest } from "express";
import { devConfig } from "./app.database";

interface Session extends ExpressSession {
    userId?: string;
}

interface Request extends ExpressRequest {
    session: Session;
}

export type Context = {
    req: Request;
    res: Response;
    redis: Redis;
};

@Module({
    imports: [
        AuthModule,
        UserModule,
        GraphQLModule.forRoot({
            autoSchemaFile: "schema.gql",
            context: ({ req, res }): Context => ({ req, res, redis }),
        }),
        TypeOrmModule.forRoot(devConfig),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
