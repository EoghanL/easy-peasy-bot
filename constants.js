const ENV = require('dotenv').config({path: __dirname + '/.env'}).parsed

const NUMBERS = {
  'zero': 0,
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7
}

const QUERIES = {
  ADD_TOPIC: ['add topic', 'Add topic', 'Add Topic'],
  BAD_KEYWORDS: ['NULL', 'Null', 'null', "'null'", '"null"', 'drop table'],
  CLEAR_TOPICS: ['clear topics', 'Clear Topics', 'Clear topics'],
  CLOSE_VOTE: ['Close voting', 'Close Voting', 'close voting'],
  GET_TOPICS: ['Get Topics', 'get topics', 'Get topics'],
  GREETING: ['hello', 'hi', 'greetings'],
  HELP: ['HELP', 'help', 'Help'],
  START_VOTE: ['Start Voting', 'start voting', 'Start voting'],
}

const MSG_TYPES = {
  ALL: ['direct_mention', 'mention', 'direct_message'],
  MENTIONS: ['direct_mention', 'mention'],
  DIRECT: ['direct_mention', 'direct_message'],
  DIR_MSG: 'direct_message',
  DIR_MNTN: 'direct_mention'
}

const MSGS = {
  INSTRUCT_VOTE: 'React with the number emoji that corresponds to the topic you want to learn about!\n',
  HELP_MSG: "You can either mention me in an exisiting channel or chat with me directly by adding me under the Apps section of your Slack app. \n Here are a list of my preset commands: \n `Add Topic - Add a topic to the weekly list of topics that will be voted on` \n `Get Topics - Show the current list of learning topics` \n `Clear Topics - Clear the current list of topics` \n `Start Vote - Open up the voting process to select a topic for our next learning session` \n `Close Voting - Close voting and tally up the results` \n"
}

module.exports = {
  ENV,
  MSGS,
  NUMBERS,
  QUERIES,
  MSG_TYPES
}