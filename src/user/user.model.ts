import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { FilledErrorType } from "../util/errortype.model";
import { TrackedEntity } from "../util/tracked-entity.model";

@ObjectType()
@Entity()
export class User extends TrackedEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Field()
    @Column("varchar", { length: 255, unique: true })
    email: string;

    @Field()
    @Column("varchar", { length: 32, unique: true })
    username: string;

    @Column("varchar", { length: 255 })
    password!: string;

    /**
     * ture iff the email account is confirmed
     */
    @Column("boolean", { default: false })
    isConfirmed: boolean;

    @Column("boolean", { default: false })
    isLocked: boolean;
}

@ObjectType()
export class DuplicateUser extends FilledErrorType {}

@ObjectType()
export class InvalidUser extends FilledErrorType {}

@ObjectType()
export class UnkownUser extends FilledErrorType {}
