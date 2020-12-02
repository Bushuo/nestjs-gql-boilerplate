import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { INestApplication } from "@nestjs/common";
import { getConnection } from "typeorm";
import * as request from "supertest";

import { testConfig } from "../src/app.database";
import { User } from "../src/user/user.model";
import { UserModule } from "../src/user/user.module";

describe("UserResolver (e2e)", () => {
    let app: INestApplication;

    const USERS_QUERY = `
        query Users {
            users {
                id
                username
            }
        }
    `;

    const USER_QUERY = `
        query User ($id: ID!) {
            user(input: {
                id: $id
            }) {
                id
                username
            }
        }
    `;

    beforeAll(async (done) => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                UserModule,
                TypeOrmModule.forRoot(testConfig),
                GraphQLModule.forRoot({
                    autoSchemaFile: "test/schema.gql",
                }),
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        return done();
    });

    afterEach(async (done) => {
        const con = getConnection();
        const metaData = con.entityMetadatas;
        const runner = con.createQueryRunner();
        runner.connect();
        metaData.forEach(async (e) => {
            await runner.query(`DELETE FROM ${e.tableName}`);
        });
        return done();
    });

    afterAll(async (done) => {
        await app.close();
        return done();
    });

    it("given two users returns two users in an array ordered by createdAt", async (done) => {
        const repo = await getConnection().getRepository(User);
        const user1 = repo.create({
            username: "testuser1",
            email: "test1@example.com",
            password: "testpassword1",
        });

        const user2 = repo.create({
            username: "testuser2",
            email: "test2@example.com",
            password: "testpassword2",
        });
        await repo.save(user1);
        await repo.save(user2);

        await request(app.getHttpServer())
            .post("/graphql")
            .send({
                query: USERS_QUERY,
            })
            .expect(({ body, error }) => {
                const { users } = body.data;
                console.log("error", error);
                expect(error).toBeFalsy();

                expect(users).toMatchObject([
                    { id: user1.id, username: user1.username },
                    { id: user2.id, username: user2.username },
                ]);
            });

        return done();
    });

    describe(".users()", () => {
        it("given no users returns an empty array", async (done) => {
            await request(app.getHttpServer())
                .post("/graphql")
                .send({
                    query: USERS_QUERY,
                })
                .expect(({ body, error }) => {
                    console.log("error", error);
                    expect(error).toBeFalsy();

                    const { users } = body.data;
                    expect(users).toMatchObject([]);
                });

            return done();
        });
    });
});
