import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import * as argon2 from "argon2";

import { __prod__ } from "../app.constants";
import { CreateUserDto } from "./dtos/create-user.dto";
import { DuplicateUser, InvalidUser, UnkownUser, User } from "./user.model";

@Injectable()
export class UserService {
    constructor(
        private readonly connection: Connection,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * returns a list of all users
     */
    findAll() {
        return this.userRepository.find({ order: { username: "ASC" } });
    }

    /**
     *
     * @param attributes
     */
    async create(
        createUserDto: CreateUserDto,
    ): Promise<User | InvalidUser | DuplicateUser> {
        try {
            // await validUserSchema(DEFAULT_LANG).validate(attributes, {
            //     abortEarly: false,
            // });
        } catch (err) {
            // return new InvalidUser(...err)
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        try {
            await queryRunner.startTransaction();

            const { email, username, password } = createUserDto;
            const duplicate = await this.checkForDuplicateUsernameOrEmail(
                username,
                email,
            );
            if (duplicate) {
                return duplicate;
            }

            const hashedPassword = await argon2.hash(password);
            const user = queryRunner.manager.create(User, {
                username,
                email,
                password: hashedPassword,
                isConfirmed: !__prod__,
                //TODO: nativeLanguage to createUser,
            });
            await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();

            return user;
        } catch (errors) {
            await queryRunner.rollbackTransaction();
            throw errors;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * returns an User or an UnkownUser if not found
     * @param id of the user to find
     */
    async findById(id: string): Promise<User | UnkownUser> {
        const user = await this.userRepository.findOne(id);
        return user ? user : new UnkownUser();
    }

    /**
     * returns an User or an UnkownUser if not found
     * @param usernameOrEmail username or email to search for
     */
    async findByEmailOrUsername(
        usernameOrEmail: string,
    ): Promise<User | UnkownUser> {
        const user = await this.userRepository.findOneOrFail({
            where: usernameOrEmail.includes("@")
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail },
        });
        return user ? user : new UnkownUser();
    }

    /**
     * checks for a duplicate username or email and returns a DuplicateUser
     * or null if no duplicates are found
     * @param username the username to check
     * @param email the email to check
     */
    async checkForDuplicateUsernameOrEmail(
        username: string,
        email: string,
    ): Promise<null | DuplicateUser> {
        try {
            const emailUser = await this.findByEmailOrUsername(email);
            if (emailUser) {
                return new DuplicateUser(
                    "email",
                    "", //messages.duplicateEmail[DEFAULT_LANG],
                );
            }
        } catch (err) {
            /** ignore - means we have no dupe */
        }
        try {
            const usernameUser = await this.findByEmailOrUsername(username);
            if (usernameUser) {
                return new DuplicateUser(
                    "username",
                    "", //messages.duplicateUsername[DEFAULT_LANG],
                );
            }
        } catch (err) {
            /** ignore - means we have no dupe */
        }
        return null;
    }
}
