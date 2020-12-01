import { Resolver, Query, Args, createUnionType } from "@nestjs/graphql";
import { FindUserInput } from "./inputs/find-user.input";
import { UnkownUser, User } from "./user.model";

import { UserService } from "./user.service";

export const UserResponse = createUnionType({
    name: "UserResponse",
    types: () => [User, UnkownUser],
});

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Query(() => [User])
    async users() {
        return this.userService.findAll();
    }

    @Query(() => UserResponse, { nullable: true })
    async user(
        @Args("input") input: FindUserInput,
    ): Promise<typeof UserResponse> {
        const user = await this.userService.findById(input.id);
        if (user instanceof UnkownUser) {
            user.field = "user";
            user.message = "user not found";
            return user;
        }
        return user;
    }
}
