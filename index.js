var constants = require('./constants.js')
var utils = require('./utils.js')

const {
  MSGS,
  NUMBERS,
  MSG_TYPES,
  QUERIES,
} = constants

const {
  showTopics,
  getVotingTotals,
  formatVoteResults,
  clearLessonTopics
} = utils
/**
 * A Bot for Slack!
 */

const ENV = require('dotenv').config({path: __dirname + '/.env'}).parsed

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}

/**
 * Configure the persistence options
 */
var config = {};
if (ENV.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: ENV.MONGOLAB_URI, tables: ['topics', 'votes']}),
    };
} else {
    config = {
        json_file_store: ((ENV.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (ENV.TOKEN || ENV.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (ENV.TOKEN) ? ENV.TOKEN : ENV.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);

} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}

/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});

/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

controller.hears(QUERIES.HELP, MSG_TYPES.ALL, function (bot, message) {
  bot.reply(message, MSGS.HELP_MSG)
})

controller.hears(QUERIES.BAD_KEYWORDS, MSG_TYPES.DIRECT, function(bot, message) {
    bot.reply(message, "I won't fall for that one.")
});


controller.hears(QUERIES.ADD_TOPIC, MSG_TYPES.ALL, function(bot, message) {
  const topic = message.text.split('opic ')[1].trim()
  if (topic.length) {
    bot.startConversation(message, function (err, convo) {
      if (err) {
        console.log(err)
        convo.stop()
      } else {
        convo.addQuestion(`Would you like to add ${topic} to the list of learning options?(Y/N)`, (response, convo) => {
          if (['Y', 'YES'].includes(response.text.toUpperCase())) {
            let topicID = response.client_msg_id.replace(/-/g, "").slice(0, 24)
            controller.storage.topics.save({id: topicID, name: topic}).then(function(correct) {
              bot.api.reactions.add({
                timestamp: response.ts,
                channel: response.channel,
                name: 'heavy_check_mark'
              }, function (err) {
                  if (err) {
                    console.log(err)
                  }
                  bot.reply(response, `Thank you for the submission of your topic - ${topic}!`)
                  convo.stop()
              })
            }).catch(function(error) {
                console.log(error);
            });
          } else {
            convo.stop()
          }
        })
      }
    })
  } else {
    bot.reply(message, 'It looks like you forgot to add a topic!')
  }
})

controller.hears(QUERIES.GET_TOPICS, MSG_TYPES.ALL, (bot, message) =>
  showTopics(bot, message, 'The current topics are:\n ', controller)
)

controller.hears(QUERIES.START_VOTE, MSG_TYPES.ALL, (bot, message) => {
  showTopics(bot, message, MSGS.INSTRUCT_VOTE, controller, true)
})

controller.hears(QUERIES.CLOSE_VOTE, MSG_TYPES.ALL, function(bot, message) {
  const totals = getVotingTotals(controller, bot, message, function(totalVotes) {
    const voteResults = formatVoteResults(totalVotes)
    console.log(message, totalVotes, voteResults)
    bot.reply(message, voteResults)
  })
})

controller.hears('Hello there.', MSG_TYPES.DIR_MSG, function (bot, message) {
  bot.reply(message, 'https://lh3.googleusercontent.com/-xv1hKxae6hE/WJvjnHjKuEI/AAAAAAAABvE/kZTbR_iH9iEewYpFeWfd2UpeEGB6tS-RACJoC/w500-h150/general.gif')
})

controller.hears(QUERIES.GREETING, MSG_TYPES.ALL, function(bot,message) {
  bot.reply(message, 'Hello!');
});

controller.hears(QUERIES.CLEAR_TOPICS, MSG_TYPES.ALL, function (bot, message) {
  bot.startConversation(message, function(err, convo) {
    if (err) {
      console.log(`Error: ${err}`)
    } else {
      convo.addQuestion('Are you sure you want to clear the current list of topics?(Y/N)', (response, convo) => {
        if (['Y', 'YES'].includes(response.text.toUpperCase())) {
            clearLessonTopics(bot, message, response, controller)
            convo.stop()
        } else {
          convo.stop()
        }
      })
    }
  })
})

/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
controller.on(MSG_TYPES.ALL, function (bot, message) {
   bot.api.reactions.add({
       timestamp: message.ts,
       channel: message.channel,
       name: 'robot_face',
   }, function (err) {
       if (err) {
           console.log(err)
       }
       bot.reply(message, "I don't know that command, type 'help' to see a list of available ones!");
   });
});
