const express = require("express");
const controllers = require("./api.controllers");


const app = express();

app.get("/api/topics", controllers.getTopics);
app.get("/api", controllers.getApiHelp);


module.exports = app;
