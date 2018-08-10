var constants = require('./constants.js')
var models = require('./database/models.js')

const {
  Message,
  Todo,
  Topic,
  User,
} = models

const {
  ENV,
  MSGS,
  NUMBERS,
  MSG_TYPES,
  QUERIES,
} = constants

function showTopics(bot, message, initString='', controller, saveMsgCallback=false) {
  let responseString = initString

  Topic.all().then(function (topics) {
    for (var i = 0; i < topics.length; i++) {
      responseString += `${i}.) ${topics[i].description}\n`
    }
    if (responseString.length > initString.length) {
      bot.reply(message, `${responseString}`, function (err, resp) {
        if (err) {
          console.log(err)
        } else {
          if (saveMsgCallback) {
            Message.create({
              channel: resp.channel,
              timestamp: resp.ts
            }).then(function(correct) {
              return
            }).catch(function(err) {
                console.log(err)
            })
          }
        }
      })
    } else {
      bot.reply(message, 'Looks like there are no topics at the moment!')
    }
  }).catch(function (error) {
      console.log(error)
  })
}

async function getVotingTotals(controller, bot, message, callback, token) {
  Message.all().then(function(messages, err) {
    if (err) {
      console.log(`Error: ${err}`)
    } else {
      tallyMsg = messages[messages.length - 1]
      const { channel, timestamp } = tallyMsg.dataValues

      bot.api.reactions.get({token: token, channel: channel, timestamp: timestamp}, function (err, resp) {
        if (err) {
          console.log(err)
        } else {
          const { reactions } = resp.message
          const voteTotals = {}

          reactions.forEach(reaction => voteTotals[reaction['name']] = reaction['count'])
          callback(voteTotals)
        }
      })
    }
  })
}

async function formatVoteResults(votesObj) {
  topics = await Topic.all()
  console.log(topics)
  return Object.keys(votesObj).reduce((output, voteIdx) => {
    return output += `${topics[NUMBERS[voteIdx]].description}: ${votesObj[voteIdx]}\n`
  }, 'The voting results are: \n')
}

function clearLessonTopics(bot, message, response, controller) {
  Topic.all().then(function (topics, error) {
    if (error) {
      console.log(error)
    } else {
      for (var i = 0; i < topics.length; i++) {
        controller.storage.topics.delete(topics[i], function(err, topic) {
          console.log(`Deleted: ${topic}`)
        })
      }
      bot.api.reactions.add({
        timestamp: response.ts,
        channel: response.channel,
        name: 'put_litter_in_its_place'
      }, function (err) {
          if (err) {
            console.log(err)
          }
          bot.reply(response, `Topics list cleared!`)
      })
    }
  })
}

module.exports = {
  showTopics,
  getVotingTotals,
  formatVoteResults,
  clearLessonTopics
}