import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import { authRoutes } from "./routes/auth.routes";
import { meRoutes } from "./routes/me.routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "kd1-dev-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true, // レスポンスのたびに有効期限を延長（最終操作から maxAge）
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, maxAge: 30 * 60 * 1000 }, // 30分
  })
);

app.use("/api", authRoutes);
app.use("/api", meRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
