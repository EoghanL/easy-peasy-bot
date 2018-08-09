function showTopics(bot, message, initString='', controller, saveMsgCallback=false) {
  let responseString = initString

  controller.storage.topics.all().then(function (topics) {
    for (var i = 0; i < topics.length; i++) {
      responseString += `${i}.) ${topics[i].name}\n`
    }
    if (responseString.length > initString.length) {
      bot.reply(message, `${responseString}`, function (err, resp) {
        if (err) {
          console.log(err)
        } else {
          if (saveMsgCallback) {
            let topicID = message.client_msg_id.replace(/-/g, "").slice(0, 24)
            controller.storage.votes.save({id: topicID, message: resp}).then(function(correct) {
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

async function getVotingTotals(controller, bot, message, callback) {
  controller.storage.votes.all(function(err, votes) {
    if (err) {
      console.log(`Error: ${err}`)
    } else {
      tallyMsg = votes[votes.length - 1].message

      bot.api.reactions.get({token: token, channel: tallyMsg.channel, timestamp: tallyMsg.ts}, function (err, resp) {
        if (err) {
          console.log('hit')
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

function formatVoteResults(votesObj) {
  return Object.keys(votesObj).reduce((output, voteIdx) => {
    return output += `${voteIdx}: ${votesObj[voteIdx]}\n`
  }, 'The voting results are: \n')
}

function clearLessonTopics(bot, message, response, controller) {
  controller.storage.topics.all().then(function (topics, error) {
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