const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
require("./src/db/db");

const indexRouter = require("./src/routes/index");
const usersRouter = require("./src/routes/users");
const messRouter = require("./src/routes/mess");
const { socketServerConnetion } = require("./src/socket/socket");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/mess", messRouter);

const server = http.createServer(app);
socketServerConnetion(server);

module.exports = { app: app, server: server };
