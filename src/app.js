import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();
const limit = "30kb";

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// ✅ DO NOT duplicate json middleware
// ✅ Only once
app.use(express.json({ limit }));

// ✅ For form fields (NOT files)
app.use(express.urlencoded({
  extended: true,
  limit,
}));

app.use(express.static(path.join(process.cwd(), "public")));
app.use(cookieParser());

// ✅ ROUTES (multer is inside routes, PERFECT)
import router from "./routes/user.routes.js";
app.use("/api/v1/users", router);

export { app };
