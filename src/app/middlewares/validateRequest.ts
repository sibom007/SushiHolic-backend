// import { NextFunction, Request, Response } from "express";
// import { AnyZodObject, ZodSchema } from "zod";

// const validateRequest =
//   (schema: ZodSchema) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await schema.parseAsync(req.body);
//       return next();
//     } catch (err) {
//       next(err);
//     }
//   };

// export default validateRequest;

import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RequestSchemas = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
  headers?: z.ZodType;
};

const validateRequest =
  (schemas: RequestSchemas) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        res.locals.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params) {
        await schemas.params.parseAsync(req.params);
      }

      if (schemas.headers) {
        await schemas.headers.parseAsync(req.headers);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
