// index.js
import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 5000;

app.on("error", (err) => {
  console.log("Server Error:", err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await ConnectDB();
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  } catch (error) {
    console.log("Startup Error:", error);
    process.exit(1);
  }
};

startServer();
