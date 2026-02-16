import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRoutes } from "./routes/auth.routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
