import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import authRoute from "./routes/userRoute.ts";
import projectRoute from "./routes/projectRoute.ts";
import { auth } from "./lib/auth.ts";
import { stripeWebhook } from "./controllers/stripeWebhook.ts";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "50mb",
  })
);

app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/user", authRoute);
app.use("/api/project", projectRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("server is Live!");
});

app.listen(port, () =>
  console.log(`Server running on port http://localhost:${port}`)
);
