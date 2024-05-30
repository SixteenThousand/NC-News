const express = require("express");
const controllers = require("./api.controllers");


const app = express();

app.get("/api/topics", controllers.getTopics);
app.get("/api", controllers.getApiHelp);
app.get("/api/articles/:article_id", controllers.getArticlesParamId);
app.get("/api/articles", controllers.getArticles);

// error handlers
app.use(controllers.handleErrors);


module.exports = app;
