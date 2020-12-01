import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FilledErrorType {
    constructor(field?: string, message?: string) {
        this.field = field;
        this.message = message;
    }

    @Field()
    field: string;

    @Field()
    message: string;
}

export class ErrorType {}
