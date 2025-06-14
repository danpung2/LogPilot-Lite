import path from "path";
import dotenv from "dotenv";

dotenv.config({
	path: path.resolve(__dirname, "../../.env"),
});

import express from "express";
import logsRoute from "./routes/logs";

const app = express();
app.use(express.json());

app.use("/logs", logsRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`🚀 LogPilot Rest Server listening on port ${PORT}`);
});
