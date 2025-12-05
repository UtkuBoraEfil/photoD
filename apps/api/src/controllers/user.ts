import { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
  const user = (req as any).user;

  res.json({ ok: true, user });
};

export const isProtected = (req: Request, res: Response) => {
  res.json({ ok: true, message: "You have accessed a protected route." });
};
