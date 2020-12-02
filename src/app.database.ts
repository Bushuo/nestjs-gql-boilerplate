import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const devConfig: TypeOrmModuleOptions = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "nest_server",
    synchronize: true,
    autoLoadEntities: true,
};

export const testConfig: TypeOrmModuleOptions = {
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    autoLoadEntities: true,
};
