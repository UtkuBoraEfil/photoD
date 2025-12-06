import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import { requireAuth } from "./middlewares/auth";

const app = express();

// Middlewares
app.use(express.json()); // JSON body parser
app.use(cookieParser()); // Cookie parser
app.use(
  cors({
    origin: "http://localhost:3000", // allow requests from this origin
    credentials: true,
  })
);

app.use("/auth", authRoutes); //public
app.use("/user", requireAuth, userRoutes); //protected

export default app;

