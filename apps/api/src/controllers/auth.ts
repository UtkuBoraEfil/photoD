import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../prisma/client"; // burasi neden hata veriyor??? cunku prisma client yok ama onu yapinca da hata veriyor

import {
  registerSchema,
  RegisterInput,
  loginSchema,
  LoginInput,
} from "@photod/validation";

export const postRegister = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(400).json({ ok: false, fieldErrors });
  }
  const { email, password, confirmPassword } = parsed.data;
  // password ve confirmPassword zaten eşleşiyor burada çünkü zod schema’da refine ile kontrol ettik
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ ok: false, message: "Email already in use" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
      },
    });

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 gün

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        expiresAt,
      },
    });

    // 5) Cookie'yi set et
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

export const postLogin = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(400).json({ ok: false, fieldErrors });
  }
  const { email, password } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email or password" });
    }
    const doesPasswordMatch = await bcrypt.compare(
      password,
      user?.passwordHash
    );
    if (!doesPasswordMatch) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email or password" });
    }
    // --- SESSION TOKEN OLUŞTUR ---
    const sessionToken = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 gün

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        expiresAt,
      },
    });

    // --- COOKIE'YE SET ET ---
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Error during login:", error);
  }
};

export const postLogout = async (req: Request, res: Response) => {
  try {
    // 1) Cookie’de session token var mı?
    const token = req.cookies?.session;

    // 2) Token varsa → DB’de invalidate et. GPT silmek yerine isValid = false yap diyor.????
    if (token) {
      await prisma.session.updateMany({
        where: { sessionToken: token },
        data: { isValid: false },
      });
    }

    // 3) Cookie’yi sil
    res.clearCookie("session");

    // 4) Response
    return res.json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
