import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";

const server = http.createServer(app);

server.listen(process.env.PORT || 3000 , ()=>{
    console.log(`server is running on port ${process.env.PORT || 3000}`);
})