import { Response } from "express";

/**
 * Safely parse an integer route parameter.
 * Returns the parsed integer, or sends a 400 response and returns null.
 * Usage: const id = parseIntParam(req.params.id, res); if (id === null) return;
 */
export function parseIntParam(param: string, res: Response): number | null {
  const id = parseInt(param, 10);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID parameter" });
    return null;
  }
  return id;
}
