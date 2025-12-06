import { prisma } from "../../prisma/client";
import { Request, Response, NextFunction } from "express";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.session;

  if (!token) return res.status(401).json({ ok: false, message: "No session" });

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  if (!session || !session.isValid || session.expiresAt < new Date()) {
    return res.status(401).json({ ok: false, message: "Invalid session" });
  }

  // kullanıcı bilgisini request’e ekle
  (req as any).user = session.user;

  next();
};
