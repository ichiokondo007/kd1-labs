import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import { connectMongo } from "@kd1-labs/document-db";
import { authRoutes } from "./routes/auth.routes";
import { meRoutes } from "./routes/me.routes";
import { storageRoutes } from "./routes/storage.routes";
import { usersRoutes } from "./routes/users.routes";
import { canvasRoutes } from "./routes/canvas.routes";
import { svglibraryRoutes } from "./routes/svglibrary.routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "kd1-dev-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, maxAge: 30 * 60 * 1000 },
  })
);

app.use("/api", authRoutes);
app.use("/api", meRoutes);
app.use("/api", storageRoutes);
app.use("/api", usersRoutes);
app.use("/api", canvasRoutes);
app.use("/api", svglibraryRoutes);

async function start() {
  await connectMongo();
  console.log("MongoDB connected");
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
