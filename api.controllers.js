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
      response.status(200).send({ "articles": data });
    });
}

async function getCommentsByArticle(request,response,next) {
  models.getCommentsByArticle(request.params.article_id)
    .then((data) => {
      response.status(200).send({
        "comments": data
      });
    })
    .catch(next);
}

async function postComment(request,response,next) {
  models.insertComment(request.params.article_id,request.body)
    .then((postedComment) => {
      response.status(201).send({ postedComment });
    })
    .catch(next);
}

async function patchArticle(request,response,next) {
  models.updateVotes(request.params.article_id,request.body.inc_votes)
    .then((article) => {
      response.status(201).send({ article });
    })
    .catch(next);
}

async function deleteComment(request,response,next) {
  models.deleteCommentById(request.params.comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch(next);
}

async function getUsers(request,response,next) {
  models.getAllUsers()
    .then((users) => {
      response.status(200).send({ users });
    });
}


// error handlers
async function handlePostgresErrors(err,request,response,next) {
  if(!err.code) {
    next(err,request,response,next);
  }
  switch(err.code) {
    case "23503": // non-existent foreign key
      response.status(404).send({ msg: "Not Found"});
      break;
    case "23502": // null value
    case "22P02": // type error
      response.status(400).send({ msg: "Bad Request" });
      break;
    default:
      next(err,request,response,next);
  }
}

async function handleCustomErrors(err,request,response,next) {
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
  getArticles,
  getCommentsByArticle,
  postComment,
  patchArticle,
  deleteComment,
  getUsers,
  handleCustomErrors,
  handlePostgresErrors,
};
