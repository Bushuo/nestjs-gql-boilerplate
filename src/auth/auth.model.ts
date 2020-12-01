import { ObjectType } from "@nestjs/graphql";
import { FilledErrorType } from "../util/errortype.model";

@ObjectType()
export class InvalidLogin extends FilledErrorType {}

@ObjectType()
export class UnconfirmedUser extends FilledErrorType {}

@ObjectType()
export class LockedUser extends FilledErrorType {}
