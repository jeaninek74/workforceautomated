import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("[Error]", err.message, err.stack);
  // Never expose internal error details to clients in production
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: "Internal server error",
    ...(isDev ? { message: err.message } : {}),
  });
}
