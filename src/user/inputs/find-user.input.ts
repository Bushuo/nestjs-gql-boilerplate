import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class FindUserInput {
    @Field(() => ID)
    id: string;
}
