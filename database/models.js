const Sequelize = require('sequelize');
const sequelize = require('../sequelize');
const { sqlize } = sequelize

const User = sqlize.define('user', {
  name: {
    type: Sequelize.STRING
  },
  slack_user_id: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  }
})

User.sync({force: false})

const Todo = sqlize.define('todo', {
  description: {
    type: Sequelize.STRING
  },
  foreign_id: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  }
})

Todo.sync({force: false})

const Topic = sqlize.define('topic', {
  description: {
    type: Sequelize.STRING
  }
})

Topic.sync({force: false})

const Message = sqlize.define('message', {
  channel: {
    type: Sequelize.TEXT
  },
  timestamp: {
    type: Sequelize.STRING
  }
})

Message.sync({force: false})

module.exports = {
  Message,
  Todo,
  Topic,
  User,
}