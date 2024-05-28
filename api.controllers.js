const models = require("./api.models");

async function getTopics(request,response,next) {
  const topicData = await models.getAllTopics();
  response.status(200).send(topicData);
}

async function getApiHelp(request,response,next) {
  response.status(200).send(require("./endpoints.json"));
}


module.exports = {
  getTopics,
  getApiHelp,
};
