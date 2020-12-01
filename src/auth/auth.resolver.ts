import {
    Args,
    createUnionType,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    Query,
    Context as Ctx,
} from "@nestjs/graphql";

import { InvalidLogin, LockedUser, UnconfirmedUser } from "./auth.model";
import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { RegisterInput } from "./dto/register.input";
import {
    DuplicateUser,
    InvalidUser,
    UnkownUser,
    User,
} from "../user/user.model";
import { UserResponse } from "../user/user.resolver";
import { UserService } from "../user/user.service";
import { FilledErrorType } from "../util/errortype.model";
import { __prod__ } from "../app.constants";
import { Context } from "../app.module";

@ObjectType()
class SessionIdResponse {
    constructor(sessionId: string) {
        this.sessionId = sessionId;
    }

    @Field()
    sessionId: string;
}

const LoginResponse = createUnionType({
    name: "LoginResponse",
    types: () => [SessionIdResponse, InvalidLogin, LockedUser, UnconfirmedUser],
});

const RegisterResponse = createUnionType({
    name: "RegisterResponse",
    types: () => [User, InvalidUser, DuplicateUser],
});

@Resolver()
export class AuthResolver {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @Mutation(() => RegisterResponse)
    async register(
        @Args("input") input: RegisterInput,
        @Ctx() context: Context,
    ): Promise<typeof RegisterResponse> {
        const user = await this.userService.create(input);
        if (!(user instanceof User)) {
            return user;
        }

        if (__prod__) {
            // TODO: confirm link
            // const confirmLink = await create;
        }

        if (!__prod__) {
            this.authService.login(user, context);
        }

        return user;
    }

    @Mutation(() => LoginResponse)
    async login(
        // @Ctx() context: Ctxt,
        @Args("input") { usernameOrEmail, password }: LoginInput,
        @Ctx() context: Context,
    ): Promise<typeof LoginResponse> {
        const user = await this.userService.findByEmailOrUsername(
            usernameOrEmail,
        );
        if (user instanceof UnkownUser) {
            return new InvalidLogin(
                "login",
                "",
                //messages.invalidLogin[DEFAULT_LANG]
            );
        }

        const authResult = await this.authService.authenticate(user, password);

        if (authResult) {
            // error
            return authResult;
        }

        return new SessionIdResponse(
            await this.authService.login(user, context),
        );
    }

    @Query(() => UserResponse, { nullable: true })
    async me(@Ctx() context: Context): Promise<typeof UserResponse> {
        const userId = context.req.session.userId;
        if (!userId) {
            // better login guard that handles this case
            return new UnkownUser("me", "not logged in!");
        }

        return this.userService.findById(userId);
    }

    @Mutation(() => FilledErrorType, { nullable: true })
    async logout(@Ctx() context: Context): Promise<FilledErrorType | null> {
        const userId = context.req.session.userId;
        if (!userId) {
            return null;
        }

        try {
            this.authService.logout(userId, context); //, sess, redis);
            return null;
        } catch (err) {
            return new FilledErrorType(
                "error",
                "",
                //messages.logoutFailed[DEFAULT_LANG]
            );
        }
    }
}
