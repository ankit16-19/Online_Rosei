import * as express from "express";
import * as jwt from "jsonwebtoken";
import {model} from "mongoose";
import {Response} from "../models/restful";
import {UserSchema} from "../schemas";
import {Config} from "../shared";

const User = model("User", UserSchema);

export const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {

  const token = req.headers["x-access-token"];
  if (!token) {
    return res.send(new Response(403, "auth token missing", {
      success: false,
    }));
  } else {
        // verifies secret and checks expiration
    jwt.verify(token, Config.secretKeys.jwtSecret, function(err, decoded) {
      if (err) {
        return res.send(new Response(500, "Unable to Authenticate User", {
          success: false,
        }));
      } else {
        User.findById(decoded.id).select("password").then((user) => {
          req.user = user;
          next();
        }).catch((err) => {
          return res.send(new Response(500, "Unable to Authenticate User", {
            success: false,
          }));
        });
      }
    });
  }
};
