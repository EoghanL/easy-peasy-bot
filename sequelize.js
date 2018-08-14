var constants = require('./constants.js')

const Sequelize = require('sequelize');
const sqlize = new Sequelize(constants.ENV.DATABASE_URL);

module.exports = {
  sqlize
}