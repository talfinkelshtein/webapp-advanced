import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import userModel from "../models/users_model";
import { jwtToken, User } from "../types/auth.types";

const register = async (req: Request, res: Response) => {
  try {
    const { password, email } = req.body;
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: email,
      password: hashedPassword,
    });
    res.status(StatusCodes.OK).send(user);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err);
  }
};

const generateToken = (userId: string): jwtToken | null => {
  if (!process.env.TOKEN_SECRET) return null;

  const randomNum = Math.random().toString();

  const accessToken = jwt.sign(
    {
      _id: userId,
      random: randomNum,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      _id: userId,
      random: randomNum,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );

  return {
    accessToken,
    refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).send("wrong username or password");
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(StatusCodes.BAD_REQUEST).send("wrong username or password");
      return;
    }
    const tokens = generateToken(user._id);
    if (!tokens || !process.env.TOKEN_SECRET) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
      return;
    }
    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(StatusCodes.OK).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err);
  }
};

const verifyRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<User>((resolve, reject) => {
    if (!refreshToken || !process.env.TOKEN_SECRET) {
      reject("fail");
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET,
      async (err: any, payload: any) => {
        if (err) {
          reject("fail");
          return;
        }
        const { _id } = payload;
        try {
          const user = await userModel.findById(_id);
          if (!user) {
            reject("fail");
            return;
          }
          if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
            user.refreshToken = [];
            await user.save();
            reject("fail");
            return;
          }
          const tokens = user.refreshToken!.filter(
            (token) => token !== refreshToken
          );
          user.refreshToken = tokens;

          resolve(user);
        } catch (err) {
          reject("fail");
          return;
        }
      }
    );
  });
};

const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    await user.save();
    res.status(StatusCodes.OK).send("success");
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send("fail");
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).send("fail");
      return;
    }
    const tokens = generateToken(user._id);

    if (!tokens) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
      return;
    }
    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(StatusCodes.OK).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send("fail");
  }
};

type Payload = {
  _id: string;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");
  const token = authorization && authorization.split(" ")[1];

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).send("Access Denied");
    return;
  }

  if (!process.env.TOKEN_SECRET) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      res.status(StatusCodes.UNAUTHORIZED).send("Access Denied");
      return;
    }
    req.params.userId = (payload as Payload)._id;
    next();
  });
};

export default {
  register,
  login,
  refresh,
  logout,
};
