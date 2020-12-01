import { ObjectType, Field } from "@nestjs/graphql";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
export class TrackedEntity {
    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
