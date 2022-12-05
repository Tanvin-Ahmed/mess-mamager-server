const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const debug = require("debug")("socketiotest:server");
require("./src/db/db");

const indexRouter = require("./src/routes/index");
const usersRouter = require("./src/routes/users");
const messRouter = require("./src/routes/mess");
const messageRouter = require("./src/routes/chats");
const { socketServerConnetion } = require("./src/socket/socket");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/mess", messRouter);
app.use("/message", messageRouter);

const server = http.createServer(app);
socketServerConnetion(server);

//**********  www file code *****************//

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "5000");
app.set("port", port);

/**
 * Create HTTP server.
 */

/**
 * Listen on provided port, on all network interfaces.
 */
const hostname = "0.0.0.0";

server.listen(port, hostname);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
