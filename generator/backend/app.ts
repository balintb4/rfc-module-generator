import express from "express";
import path from "path";
import generatorRouter from "./router/generator-router";
import bodyParser from "body-parser";
import "express-async-errors";
import { StatusCodes } from "http-status-codes";

const app = express();
const port = 3000;
const dir = path.join(__dirname, 'public')
var morgan = require('morgan')

app.get("/", (req, res) => {
    res.sendFile(path.join(dir, "mendix-generator.html"));
});

app.use(express.static(dir));
app.use(express.json());
app.use(bodyParser.json());

app.use(morgan('combined'));

app.use("https://if200147.cloud.htl-leonding.ac.at/api/generator", generatorRouter);

app.get("/mendix-generator.html", (req, res) => {
    res.sendFile(path.join(dir, "mendix-generator.html"));
});

app.get("/generate-mendix-app.html", (req, res) => {
    res.sendFile(path.join(dir, "generate-mendix-app.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(dir, "index.html"));
});

app.get("/select-entities.html", (req, res) => {
    res.sendFile(path.join(dir, "select-entities.html"));
});

app.get("/download-mpk.html", (req, res) => {
    res.sendFile(path.join(dir, "download-mpk.html"));
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
    res.status(StatusCodes.NOT_FOUND).sendFile(path.join(dir, "404.html"));
});

// Globaler Fehlerhandler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Something went wrong!',
    });
  });

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

