const es = require('elasticsearch');
const esClient = new es.Client({
    host: process.env.ELASTIC_URL,
    log: 'trace'
});
esClient.ping({
    // ping usually has a 3000ms timeout
        requestTimeout: 1000
    }, function (error) {
        if (error) {
            console.trace('Clusterul de Elasticsearch nu răspunde!');
        } else {
            console.log('Conectare la Elasticsearch cu succes!');
        }
    });

//FIXME: Clientul de Elasticsearch se va schimba (vezi `npm install @elastic/elasticsearch` 
// https://www.elastic.co/blog/announcing-the-new-elasticsearch-javascript-client-rc1 și https://www.elastic.co/blog/new-elasticsearch-javascript-client-released)
// Încep readaptarea clientului și în aplicație
const { Client } = require('@elastic/elasticsearch');
const client = new Client({
    node: process.env.ELASTIC_URL,
    log: 'trace'
});
// client.info(console.log);

// module.exports = esClient;
module.exports = client;