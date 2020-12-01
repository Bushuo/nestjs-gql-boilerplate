import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { REDIS_SESS_PREFIX, USER_SESS_ID_PREFIX } from "../app.constants";
import { Context } from "../app.module";
import { User } from "../user/user.model";
import { UserService } from "../user/user.service";
import { InvalidLogin, LockedUser, UnconfirmedUser } from "./auth.model";

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    /**
     * checks if the user is falsy, confirmed, locked, and the password is correct.
     * if any checks do not pass it throws an appropriate error
     * otherwise returns null
     * @param user the user to authenticate from the database
     * @param password the password of the user in plaintext
     */
    async authenticate(
        user: User,
        password: string,
    ): Promise<UnconfirmedUser | LockedUser | InvalidLogin | null> {
        if (!user)
            return new InvalidLogin(
                "login",
                "",
                //messages.invalidLogin[DEFAULT_LANG],
            );

        if (!user.isConfirmed)
            return new UnconfirmedUser(
                "usernameOrEmail",
                "",
                // messages.unconfirmedEmail[DEFAULT_LANG],
            );

        if (user.isLocked) return new LockedUser("usernameOrEmail", "");

        const isValidCombination = await argon2.verify(user.password, password);
        if (!isValidCombination) {
            return new InvalidLogin(
                "login",
                "",
                //messages.invalidLogin[DEFAULT_LANG],
            );
        }
        return null;
    }

    /**
     * loggs user in
     * @param user to login
     * @param context request context
     * @returns the sessionID
     */
    async login(user: User, { req, redis }: Context) {
        // login successful
        req.session.userId = user.id;
        if (req.sessionID) {
            await redis.lpush(
                `${USER_SESS_ID_PREFIX}${user.id}`,
                req.sessionID,
            );
        }
        return req.sessionID;
    }

    /**
     * destroys all current user sessions
     */
    async logout(userId: string, { req, redis }: Context) {
        const sessionIds = await redis.lrange(
            `${USER_SESS_ID_PREFIX}${userId}`,
            0,
            -1,
        );
        const promises: Promise<number>[] = [];
        sessionIds.forEach((s) => {
            promises.push(redis.del(`${REDIS_SESS_PREFIX}${s}`));
        });
        await Promise.all(promises);
        req.session.destroy((err) => {
            if (err) {
                throw err;
            }
        });
    }
}
