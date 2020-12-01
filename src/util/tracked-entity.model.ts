import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Field } from "type-graphql";

export class TrackedEntity {
    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
