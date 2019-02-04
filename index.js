var opus = require('node-opus');
const
    Discord = require('discord.js'),
    events = {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    },
    ffmpeg = require('ffmpeg'),
    fs = require('fs'),
    path = require('path'),
    fnc = require('./functions'),
    music = require('./music'),
    bot = new Discord.Client(),
    //token = "NDAyMjQ2NTA5MzEzMzkyNjQw.DT2PIA.W9WqU027YvKV3kLLQbjRaiUdid8"; // Dragon
    //token = "NDAzNjQ4OTMwNTE4NDAxMDI1.DrWsuA.OcUcXuC8IgCwvsXovl0zJgj4tcw"; // QuiltyPleasure
    //token = "NDQzNzgwMTA1OTk1ODEyODY0.DmCY6w.UEF0d9sdHyH8_vm7vsGomf65uWs"; // DragonDev
    token = "NDQ1OTgzNzc1NjQyNDg0NzM3.DrjurA.oOA-W3ASbD_wuyaIuxb8OsUBRtA"; // Team Fortress 2

bot.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	const user = bot.users.get(data.user_id);
	const channel = bot.channels.get(data.channel_id) || await user.createDM();

	if (channel.messages.has(data.message_id)) return;

	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	let reaction = message.reactions.get(emojiKey);

	if (!reaction) {
		const emoji = new Discord.Emoji(bot.guilds.get(data.guild_id), data.emoji);
		reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === bot.user.id);
	}

	bot.emit(events[event.t], reaction, user);
});

bot.on("ready", () => {
    console.log(`Bot logged in as ${bot.user.tag}`);
    global.bot = bot;
});

bot.on("message", msg => {
    // LEAVE
    if (fnc.on_command(msg.content, "leave", cmd => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        if (music.isDragonInVC(voicechannel, bot)) {
            music.destroyQueue(msg.guild.id, () => {
                return voicechannel.leave();
            });
        }
        else
            return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }

    // PAUSE
    if (fnc.on_command(msg.content, "pause", () => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        if (music.isDragonInVC(voicechannel, bot)) {
            music.pausePlayback(msg.guild.id, () => {
                return msg.reply("music has been paused.");
            });
        }
        else
            return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }

    // PLAY
    if (fnc.on_command(msg.content, "play", cmd => {
        const voicechannel = msg.member.voiceChannel;
        // Check if user that does the request is in a voicechannel
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        // Check if the parameter given is a valid url
        if (fnc.IsValidDomain(cmd[0])) {
            var song = cmd[0];
            // Validate the request if the domain is a supported one
            if (!fnc.validateRequest(song, response => {
                // Invalid domain reply to requester
                if (!response) return msg.reply("invalid url given!");
                else {
                    // Check if this server has a queue
                    if (music.serverExistsInQueue(msg.guild.id)) {
                        if (music.isDragonInVC(voicechannel, bot))
                            music.addToQueue(msg.guild.id, response, embed => {
                                return msg.channel.send({embed});
                            });
                        else
                            return msg.reply("you aren't in the bot's channel!");
                    }
                    // else create a queue and add the first request
                    else {
                        music.createQueue(msg.guild.id, response, msg.channel.id, embed => {
                            music.startQueue(msg.guild.id, voicechannel, () => {
                                return msg.channel.send({embed});
                            });
                        });
                    }
                }
            })) {
                // Invalid Youtube url
                return msg.reply("broken link or unsupported link!");
            }
        }
        // Otherwise try a search on it on youtube
        else {
            var searchFor = cmd.join(" ");
            if (searchFor.length > 0) {
                console.log(searchFor);
                console.log(msg.guild.id);
            }
            else {
                return msg.reply("please give a valid url or a music title to search for.");
            }
        }
    }) != false) { return ; }

    // PLAYNEXT
    if (fnc.on_command(msg.content, "playnext", cmd => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        // Check if the parameter given is a valid url
        if (fnc.IsValidDomain(cmd[0])) {
            var song = cmd[0];
            // Validate the request if the domain is a supported one
            if (!fnc.validateRequest(song, response => {
                // Invalid domain reply to requester
                if (!response) return msg.reply("invalid url given!");
                else {
                    // Check if this server has a queue
                    if (music.serverExistsInQueue(msg.guild.id)) {
                        if (music.isDragonInVC(voicechannel, bot))
                            music.playNextInQueue(msg.guild.id, response, embed => {
                                return msg.channel.send({embed});
                            });
                        else
                            return msg.reply("you aren't in the bot's channel!");
                    }
                    // else create a queue and add the first request
                    else {
                        music.createQueue(msg.guild.id, response, embed => {
                            music.startQueue(msg.guild.id, voicechannel, () => {
                                return msg.channel.send({embed});
                            });
                        });
                    }
                }
            })) {
                // Invalid Youtube url
                return msg.reply("broken link or unsupported link!");
            }
        }
        // Otherwise try a search on it on youtube
        else {
            var searchFor = cmd.join(" ");
            if (searchFor.length > 0) {
                console.log(searchFor);
                console.log(msg.guild.id);
            }
            else {
                return msg.reply("please give a valid url or a music title to search for.");
            }
        }
    }) != false) { return ; }

    // PREVIOUS
    if (fnc.on_command(msg.content, "previous", () => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        if (music.isDragonInVC(voicechannel, bot)) {
            music.playPrevious(msg.guild.id, voicechannel, bool => {
                if (!bool)
                    return msg.reply("no previous songs to be played!");
            });
        }
        else
            return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }

    // REPEAT
    if (fnc.on_command(msg.content, "repeat", () => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        if (music.isDragonInVC(voicechannel, bot)) {
            music.repeat(msg.guild.id, bool => {
                if (bool)
                    return msg.reply("repeat **ON**.")
                else
                    return msg.reply("repeat **OFF**.")
            });
        }
        else
            return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }

    // RESUME
    if (fnc.on_command(msg.content, "resume", () => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel) {
            return msg.reply("you aren't in a channel!");
        }
        if (music.isDragonInVC(voicechannel, bot)) {
            music.resumePlayback(msg.guild.id, () => {
                return msg.reply("music has been resumed.");
            });
        }
        else
            return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }

    // SKIP
    if (fnc.on_command(msg.content, "skip", () => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel)
            return msg.reply("you aren't in a channel!");
        if (music.isDragonInVC(voicechannel, bot)) {
            return music.playNext(msg.guild.id, voicechannel);
        }
        return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }

    // VOLUME
    if (fnc.on_command(msg.content, "volume", cmd => {
        const voicechannel = msg.member.voiceChannel;
        if (!voicechannel)
            return msg.reply("you aren't in a channel!");
        if (music.isDragonInVC(voicechannel, bot)) {
            if (parseInt(cmd[0], 10) <= 200 && parseInt(cmd[0], 10) >= 0)
                return music.setVolume(msg.guild.id, cmd[0]);
            else
                return msg.reply("invalid volume, please give a value between 0 and 200");
        }
        return msg.reply("you aren't in the bot's channel!");
    }) != false) { return ; }
});

bot.login(token);

process.on('SIGINT', () => {
    console.log("\nBot shutdown requested logging out...");
    console.log("Removing all cached music");
    fs.readdir("audio", (err, files) => {
        if (err) throw err;
        for (const file of files) {
            console.log("Removing file: ./"+ path.join("audio", file));
            fs.unlink(path.join("audio", file), err => {
                if (err) throw err;
            });
        }
        console.log("All audio files removed!");
    });
    setTimeout(function () {
        bot.destroy();
        console.log("Bot logout done!");
        process.exit();
    }, 1000);
});
