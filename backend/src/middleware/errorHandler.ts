import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("[Error]", err.message, err.stack);
  // Handle specific HTTP errors with correct status codes
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({ error: "Request body too large. Maximum size is 1MB." });
  }
  if (err.status === 400 && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body." });
  }
  // Never expose internal error details to clients in production
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: "Internal server error",
    ...(isDev ? { message: err.message } : {}),
  });
}
