const
    { AddSongToQueue, AddGuildToDB, HasCoolDown } = require('./functions'),
    MusicBot = require('./musicbot'),
    { HandleCmd } = require('./commands');
let API;

setTimeout(function () {
    API = global.api;
}, 1);

/*
 * BotEvents
 * @type CLASS
 * @extends MusicBot
 */
class BotEvents extends MusicBot {
    /* @class constructor
     *  Class the super() to init the MusicBot internally
     */
    constructor(startTime) {
        super();

        this.startTime = startTime;
        // Calls StartListeners if after the super is done.
        this.StartListeners();
    }

    /* @class method
     *  Contains all event listeners of the client
     */
    StartListeners() {
        // The bot is connected to the Discord API and ready to receive requests
        this.client.on('ready', () => {
            console.log('Client is ready\nSetup took: ' + (new Date - this.startTime) + 'ms');

            this.client.user.setPresence({
                game: {
                    name: 'some music 🎵',
                    type: 'STREAMING',
                    url: 'https://www.twitch.tv/yimura_'
                }
            });

            // TODO: remove this thing, it's useless
            global.creator = this.client.users.get('243072972326305798');

            global.stats = {};
            global.stats.serverCount = this.client.guilds.size;
            global.stats.userCount = this.client.users.size;
        });

        // Bot receives a message, this event is directly passed to the HasCommand function to check for a valid command syntax
        this.client.on('message', msg => {
            this.HasCommand(msg, this.RunCommand);
        });

        // On a voicechannel update, user leave/joining we check if Damon is the only one remaining and break the queue.
        this.client.on('voiceStateUpdate', (oldMember, newMember) => {
            const voicechannel = this.client.channels.get(oldMember.voiceChannelID);
            if (voicechannel != undefined) {
                if (voicechannel.members.get(this.client.user.id)) {
                    if (voicechannel.members.size == 1) {
                        global.MusSys.destroyQueue(voicechannel.guild.id, () => {
                            voicechannel.leave();
                        });
                    }
                }
            }

            return;
        });

        // Pass this event to the ReactionAction
        this.client.on('messageReactionAdd', (msgReaction, userObj) => {
            this.ReactionAction(msgReaction, userObj);
        });

        // Pass this event to the ReactionAction
        this.client.on('messageReactionRemove', (msgReaction, userObj) => {
            this.ReactionAction(msgReaction, userObj);
        });

        // Will setup a new guild in the database when needed
        this.client.on('guildCreate', guild => {
            AddGuildToDB(guild);
        });
    }

    CheckChoice(msgReaction, userObj) {
        const
            choices = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'],
            emoji = msgReaction.emoji.name,
            userId = userObj.id,
            serverId = msgReaction.message.guild.id,
            music = global.MusSys;

        if (music.servers[serverId] != undefined && music.servers[serverId].choiceObj != undefined && music.servers[serverId].choiceObj[userId] != undefined) {
            const
                choiceObj = music.servers[serverId].choiceObj[userId],
                exception = choiceObj.exception,
                songs = choiceObj.choices,
                msgObj = choiceObj.msgObj;

            for (var i = 0; i < (choices.length - 1); i++) {
                if (choices[i] == emoji) {
                    playSong(msgObj, songs[i], exception);
                    // Set to undefined to prevent execution of code multiple times
                    music.servers[serverId].choiceObj = undefined;
                }
            }

            if (emoji == '🚫') {
                msgObj.delete();
                music.servers[serverId].choiceObj[userId] = undefined;
            }

            function playSong(msgObj, song, exception) {
                let choiceObj = music.servers[serverId].choiceObj[userId];

                if (music.hasQueue(serverId)) {
                    if (exception) {
                        music.playNextInQueue(serverId, song, userId, title => {
                            return msgObj.channel.send('Playing song **'+ title +'** next up');
                        });
                    }
                    else {
                        music.addToQueue(serverId, song, userId, title => {
                            msgObj.channel.send('Added song **'+ title +'**');
                            msgObj.delete(50);
                        });
                    }
                }
                else {
                    music.createQueue(serverId, song, msgObj.channel.id, userId, title => {
                        music.startQueue(msgObj.guild.id, choiceObj.voicechannel, () => {
                            msgObj.channel.send('Playback starting with **'+ title +'**');
                            msgObj.delete(50);
                        });
                    });
                }
            }
        }
    }

    CheckUserControlls(msgReaction, userObj) {
        const
            serverId = msgReaction.message.guild.id,
            serverObj = global.MusSys.servers[serverId];

        if (serverObj != undefined && userObj.id != this.client.user.id) {
            let msgObj = serverObj.msgObj;

            if (msgReaction.message.id == msgObj.id) {
                const
                    voicechannel = this.client.voiceConnections.get(serverId).channel;

                if (voicechannel.members.get(userObj.id) && voicechannel.members.get(this.client.user.id)) {
                    this.HandleReaction(userObj, msgReaction, serverId, voicechannel);
                }
            }
        }
    }

    CheckYesNo(msgReaction, userObj) {
        if (userObj.id == this.client.user.id) {
            return;
        }

        const
            yesNoEmojis = ['✔', '✖'],
            music = global.MusSys,
            serverId = msgReaction.message.guild.id,
            serverObj = music.servers[serverId];

        if (music.servers[serverId].playlistObj == undefined) {
            return;
        }

        const playlistObj = music.servers[serverId].playlistObj[userObj.id];

        // if the playlistObj is empty that must mean someone pressed the :check: butten without having done a request
        if (playlistObj == undefined) {
            return;
        }

        const
            voicechannel = playlistObj.voicechannel,
            msgObj = playlistObj.msgObj,
            embed = msgReaction.message.embeds[0];

        if (playlistObj.message.id != msgReaction.message.id) {
            return;
        }

        let yes = false;

        const questionType = embed.footer.text;

        if (yesNoEmojis[0] == msgReaction.emoji) {
            yes = true;
        }

        if (questionType == 'playlist_detected') {
            if (yes) {
                return API.getYoutubePlaylist(playlistObj.song.list, playlistItems => {
                    playlistObj.message.delete(50);
                    music.servers[serverId].playlistObj[userObj.id] = undefined;

                    let responseText = 'Added the following songs in order to the queue: ```';

                    addToQueue();
                    function addToQueue(i = 0) {
                        if (i < playlistItems.length) {
                            let response = {
                                source: 'yt',
                                id: playlistItems[i].snippet.resourceId.videoId
                            };

                            AddSongToQueue(msgObj, voicechannel, msgObj.channel.id, response, userObj.id, (string) => {
                                addToQueue(i + 1);

                                if (string != undefined) {
                                    responseText += string + '\n';
                                }

                                if (i == (playlistItems.length - 1)) {
                                    msgObj.channel.send(responseText + '```');
                                }
                                else {
                                    responseText += '- ';
                                }
                            }, false);
                        }
                    }

                    msgObj.channel.send('Adding songs from playlist to queue, please wait...');
                });
            }

            playlistObj.song.list = undefined;

            AddSongToQueue(msgObj, voicechannel, msgObj.channel.id, playlistObj.song, userObj.id);

            playlistObj.message.delete(50);
            music.servers[serverId].playlistObj[userObj.id] = undefined;
        }
    }

    HasCommand(msg, callback) {
        let
            content = msg.content,
            valid = false,

            cmds = this.config.commands;

        if (content != undefined && content.startsWith(this.config.prefix)) {
            for (let category in cmds) {
                if (cmds.hasOwnProperty(category)) {
                    for (let i = 0; i < cmds[category].length; i++) {
                        const command = cmds[category][i];
                        if (content.substring(this.config.prefix.length).split(' ')[0] == command.name) {
                            return callback(command.name, msg, content.substring(this.config.prefix.length + command.name.length + 1).split(' '), category);
                        }

                        if (command.aliases != undefined) {
                            for (let x = 0; x < command.aliases.length; x++) {
                                if (content.substring(this.config.prefix.length).split(' ')[0] == command.aliases[x]) {
                                    return callback(command.name, msg, content.substring(this.config.prefix.length + command.aliases[x].length + 1).split(' '), category);
                                }
                            }
                        }
                    }
                }
            }
        }

        return valid;
    }

    HandleReaction(userObj, msgReaction, serverId, voicechannel) {
        const
            emoji = msgReaction.emoji.name,
            channel = msgReaction.message.channel,
            music = global.MusSys;

        if (emoji == '⏮') {
            HasCoolDown(userObj, 'reactionPrevious', 1, bool => {
                if (bool) {
                    return channel.send('<@'+ userObj.id +'>, button "previous" is still on cooldown...')
                        .then(msg => {
                            msg.delete(5*1000);
                        });
                }

                return music.playPrevious(serverId, voicechannel);
            });
        }

        if (emoji == '⏸') {
            HasCoolDown(userObj, 'reactionPauseToggle', 1, bool => {
                if (bool) {
                    return channel.send('<@'+ userObj.id +'>, button "pause toggle" is still on cooldown...')
                        .then(msg => {
                            msg.delete(5*1000);
                        });
                }

                return music.pauseToggle(serverId);
            });
        }

        if (emoji == '⏭') {
            HasCoolDown(userObj, 'reactionSkip', 1, bool => {
                if (bool) {
                    return channel.send('<@'+ userObj.id +'>, button "skip" is still on cooldown...')
                        .then(msg => {
                            msg.delete(5*1000);
                        });
                }

                return music.playNext(serverId, voicechannel);
            });
        }

        if (emoji == '🔁') {
            HasCoolDown(userObj, 'reactionRepeat', 1, bool => {
                if (bool) {
                    return channel.send('<@'+ userObj.id +'>, button "repeat" is still on cooldown...')
                        .then(msg => {
                            msg.delete(5*1000);
                        });
                }

                return music.repeatToggle(serverId);
            });
        }
    }

    ReactionAction(msgReaction, userObj) {
        const
            emoji = msgReaction.emoji.name,
            yesNoEmojis = ['✔', '✖'],
            choiceEmojis = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'],
            playerControls = ['⏮', '⏸', '⏭', '🔁'];

        // Order for loops from small/most frequently used to biggest/less frequently used
        for (let i = 0; i < yesNoEmojis.length; i++) {
            if (emoji == yesNoEmojis[i]) {
                return this.CheckYesNo(msgReaction, userObj);
            }
        }

        for (let i = 0; i < playerControls.length; i++) {
            if (emoji == playerControls[i]) {
                return this.CheckUserControlls(msgReaction, userObj);
            }
        }

        for (let i = 0; i < choiceEmojis.length; i++) {
            if (emoji == choiceEmojis[i]) {
                return this.CheckChoice(msgReaction, userObj);
            }
        }
    }

    /*
     *  @type function
     *  Expects:
     *  - msg: Discord.Message
     *  - context: array{ 0: command, 1+: text }
     */
    RunCommand(cmd, msg, context, category) {
        HandleCmd(cmd, msg, context, category);
    }
}

module.exports = {
    BotEvents: BotEvents
};
