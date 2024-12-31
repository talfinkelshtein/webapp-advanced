import { IUser } from "../models/users_model";
import { Document } from "mongoose";

export type jwtToken = {
  accessToken: string;
  refreshToken: string;
};

export type User = Document<unknown, {}, IUser> &
  IUser &
  Required<{
    _id: string;
  }> & {
    __v: number;
  };
