import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

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
    console.log("Auth middleware failed");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Access Denied");
    }
    req.params.userId = (payload as Payload)._id;
    next();
  });
};

type Payload = {
  _id: string;
};
