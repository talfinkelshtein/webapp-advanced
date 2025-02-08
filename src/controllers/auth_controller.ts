import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import userModel from "../models/users_model";
import { jwtToken, User } from "../types/auth.types";

const client = new OAuth2Client();

const register = async (req: Request, res: Response) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(StatusCodes.OK).send(user);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err);
  }
};

const googleSignin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload?.email;
      if (email) {
        let user = await userModel.findOne({ email: email });
        if (!user) {
          user = await userModel.create({
            email: email,
            password: "",
          });
        }
        const tokens = generateToken(user._id);
        res.status(200).send(tokens);
      }
      console.log(payload);
    } catch (err) {
      res.sendStatus(400).send("Missing email or password");
    }
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err);
  }
};

export const generateToken = (userId: string): jwtToken | null => {
  if (!process.env.TOKEN_SECRET) {
    return null;
  }

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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).send("wrong username or password");
      return;
    }
    const userId = user._id.toString();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(StatusCodes.BAD_REQUEST).send("wrong username or password");
      return;
    }

    const tokens = generateToken(userId);

    if (!tokens || !process.env.TOKEN_SECRET) {
      console.log("Token generation in login failed -", tokens);
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
      _id: user._id.toString(),
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err);
  }
};

export const verifyRefreshToken = (refreshToken: string | undefined) => {
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
          reject("expired");
          return;
        }

        const { _id } = payload;
        try {
          const user = await userModel.findById(_id);

          if (!user) {
            reject("unauthorized");
            return;
          }

          if (
            !user.refreshToken ||
            !user.refreshToken.length ||
            !user.refreshToken.includes(refreshToken)
          ) {
            reject("expired");
            return;
          }

          user.refreshToken = user.refreshToken.filter(
            (token) => token !== refreshToken
          );

          resolve(user);
        } catch (err) {
          reject("fail");
        }
      }
    );
  });
};

const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);

    if (user) {
      user.refreshToken = [];
      await user.save();
    }

    res.status(StatusCodes.OK).send("Logged out successfully");
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send("fail");
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);

    if (!user) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Session expired, please log in again");
      return;
    }

    const tokens = generateToken(user._id);
    if (!tokens) {
      console.log("Token generation in refresh failed");
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
      return;
    }

    user.refreshToken = [tokens.refreshToken];

    await userModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: [tokens.refreshToken] } }
    );

    res.status(StatusCodes.OK).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
  } catch (err) {
    if (err === "expired") {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Refresh token expired, please log in again");
    } else if (err === "unauthorized") {
      res.status(StatusCodes.UNAUTHORIZED).send("Invalid refresh token");
    } else {
      res.status(StatusCodes.BAD_REQUEST).send("fail");
    }
  }
};

type Payload = {
  _id: string;
};

export default {
  register,
  googleSignin,
  login,
  refresh,
  logout,
};
