import express from "express";
import core from "cors";
import helmet from "helmet";
import morgan from "morgan";

import proxyRoutes from "./routes/proxy.routes.js"

const app = express();


app.use(helmet());

app.use(core({
    origin:process.env.CLIENT_URL , credentials:true,
}))


app.use(morgan("dev"))

app.use(proxyRoutes)

app.get("/health",(_req,res)=>{
    res.status(200).json({
        success:true,
        service:"hireloop-gateway",
        status:"healthy"
    })
})

export default app;