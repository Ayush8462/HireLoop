import express from "express";
import core from "cors";
import helmet from "helmet";
import morgan from "morgan";
const app = express();
app.use(helmet());
app.use(core({
    origin: process.env.CLIENT_URL, credentials: true,
}));
app.use(morgan("dev"));
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        service: "hireloop-gateway",
        status: "healthy"
    });
});
export default app;
//# sourceMappingURL=app.js.map