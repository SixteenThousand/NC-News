const models = require("./api.models");

async function getTopics(request,response,next) {
  const topicData = await models.getAllTopics();
  response.status(200).send(topicData);
}


module.exports = {
  getTopics,
};
