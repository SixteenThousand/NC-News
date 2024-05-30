const models = require("./api.models");

async function getTopics(request,response,next) {
  const topicData = await models.getAllTopics();
  response.status(200).send(topicData);
}

async function getApiHelp(request,response,next) {
  response.status(200).send(require("./endpoints.json"));
}

async function getArticlesParamId(request,response,next) {
  if(request.params.article_id.match(/^\d+$/) !== null) {
    models.getArticleById(request.params.article_id)
      .then((articleData) => {
        response.status(200).send(articleData);
      })
      .catch((err) => {
        next({ status: 404, msg: "Not Found"});
      });
  } else {
    next({ status: 400, msg: "Bad Request" });
  }
}

async function getArticles(request,response,next) {
  models.getAllArticles()
    .then((data) => {
      response.status(200).send(data);
    });
}

// error handlers
async function handleErrors(err,request,response,next) {
  if(err.msg && err.status) {
    response.status(err.status).send({ msg: err.msg });
  } else {
    next(err,request,response,next);
  }
}


module.exports = {
  getTopics,
  getApiHelp,
  getArticlesParamId,
  handleErrors,
  getArticles,
};
