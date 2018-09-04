import * as express from "express";
import * as jwt from "jsonwebtoken";
import { model } from "mongoose";
import { Response } from "../models/restful";
import { AdminSchema } from "../schemas";
import { Config } from "../shared";

const Admin = model("Admin", AdminSchema);

interface Authenticated {
  user;
}

export const isAdminOrUser = (req: express.Request & Authenticated,
                              res: express.Response, next: express.NextFunction) => {

  const token: any = req.headers["x-access-token"];
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
        Admin.findById(decoded.id).select("userType password").then((user: any) => {
          if (user.userType !== "admin") {
            return res.send(new Response(500, "You don't have admin access", {
              success: false,
            }));
          } else {
            req.user = user;
            next();
          }
        }).catch((err) => {
          return res.send(new Response(500, "Unable to Authenticate Admin", {
            success: false,
          }));
        });
      }
    });
  }
};
