const
    Discord = require('discord.js'),
    EMBED_COLOR = 0xf84647,
    fs = require('fs'),
    fnc = require('./functions')
    musicData = require('music-metadata'),
    yt = require('./youtube'),
    ytMp3Dl = require('youtube-mp3-downloader'),
    YD = new ytMp3Dl({
        "ffmpegPath": "ffmpeg",
        "outputPath": "audio/",
        "youtubeVideoQuality": "highest",
        "queueParallelism": 1,
        "progressTimeout": 2000
    }),
    MaxPreQueue = global.config.maxprequeue;

global.servers = {};

exports.addToQueue = async function (guild, response, callback) {
    var
        length = global.servers[guild].queue.length,
        songdata = await GetSongData(response);

    global.servers[guild].queue[length - 1] = Object.assign(response, {repeat: 0, songdata: songdata});
    // Set last in array to null to mark the end of queue
    global.servers[guild].queue[length] = null;

    PreloadNextSong(guild);

    const embed = SongFoundEmbed(global.servers[guild].queue[length - 1]);
    return callback(embed);
};

exports.createQueue = async function (guild, response, channel, callback) {
    global.servers[guild];
    global.servers[guild] = {queue: [], volume: 0.15, playing: false, stream: null, paused: false, channel: channel, timer: null};

    for (var i = 0; i < MaxPreQueue; i++) {
        global.servers[guild].queue[i] = null;
    }

    var songdata = await GetSongData(response);

    global.servers[guild].queue[i] = Object.assign(response, {repeat: 0, songdata: songdata});
    // By assigning the last in the queue to be null we say this is the end of our queue
    global.servers[guild].queue[i+1] = null;

    const embed = SongFoundEmbed(global.servers[guild].queue[i]);
    return callback(embed);
};
exports.destroyQueue = function (guild, callback) {
    global.servers[guild].stream.end("End of playtime");
    global.servers[guild] = undefined;

    return callback();
};
exports.isDragonInVC = function (voicechannel, bot) {
    return isDragonInVC(voicechannel, bot);
};
exports.pausePlayback = function (guild, callback) {
    if (!global.servers[guild].paused) {
        global.servers[guild].stream.pause();
        global.servers[guild].paused = true;

        return callback();
    }
    return;
};
exports.playNext = function (guild, voicechannel) {
    return PlayNext(guild, voicechannel);
};
exports.playNextInQueue = function (guild, response, callback) {
    global.servers[guild].queue.splice(MaxPreQueue + 1, 0, Object.assign(response, {repeat: 0}));

    PreloadNextSong(guild);

    const embed = SongFoundEmbed(global.servers[guild].queue[MaxPreQueue + 1]);
    return callback(embed);
};
exports.playPrevious = function (guild, voicechannel, callback) {
    return callback(PlayPrevious(guild, voicechannel));
};
exports.repeat = function (guild, callback) {
    return callback(Repeat(guild));
};
exports.resumePlayback = function (guild, callback) {
    if (global.servers[guild].paused) {
        global.servers[guild].stream.resume();
        global.servers[guild].paused = false;
        return callback();
    }
    return;
};
exports.serverExistsInQueue = function (guild) {
    if (global.servers[guild] != undefined)
        return true;
    return false;
};
exports.setVolume = function (guild, vol) {
    var volume = vol / 100;
    // Save volume in our global var
    global.servers[guild].volume = volume;
    // Set the volume on the player
    global.servers[guild].stream.setVolume(volume);
};

exports.startQueue = function (guild, voicechannel, callback) {
    ContinueQueue(guild, voicechannel);
    return callback();
};

function ContinueQueue(guild, voicechannel) {
    const queue = global.servers[guild].queue;
    console.log(queue[MaxPreQueue]);
    if (fs.existsSync(__dirname + '/audio/'+ queue[MaxPreQueue].id +'.mp3')) {
        musicData.parseFile(__dirname + '/audio/'+ queue[MaxPreQueue].id +'.mp3', {native: true})
        .then(metadata => {
            console.log("Song exists, playing...");
            return PlaySound(guild, voicechannel, metadata.format.duration);
        });
    }
    else {
        console.log("Song needs to be downloaded, downloading...");
        Preload(queue[MaxPreQueue], () => {
            musicData.parseFile(__dirname + '/audio/'+ queue[MaxPreQueue].id +'.mp3', {native: true})
            .then(metadata => {
                console.log("Downloading finished, playing...");
                return PlaySound(guild, voicechannel, metadata.format.duration);
            });
        });
    }
}

async function GetSongData(response) {
    if (response.source == "youtube") {
        return await yt.getSongInfoById(response.id);
    }
}

function isDragonInVC(voicechannel, bot) {
    if (voicechannel.members.get(bot.user.id))
        return true;
    return false;
}

function PlaySound(guild, voicechannel, duration) {
    // for some reason when a file got Preloaded in the background it would request a playsound when it finished downloading
    if (!global.servers[guild].player) {
        var queue = global.servers[guild].queue;
        voicechannel.join().then(conn => {
            SongMonitor(guild, duration, () => {
                const audioStream = conn.playFile(__dirname + '/audio/'+ queue[MaxPreQueue].id +".mp3");

                // Set our player and datastream
                global.servers[guild].player = true;
                global.servers[guild].stream = audioStream;

                audioStream.setVolume(global.servers[guild].volume);

                PreloadNextSong(guild);

                SendSongPlayingMsg(guild);
            })
            // End of song should be called
            .then(() => {
                console.log("End of song detected");
                // global.servers[guild].stream.end("Manual end of song got called!");
                return PlayNext(guild, voicechannel);
            });
        }).catch(console.error);
    }
    return console.log("A song is still playing, request ignored...");
}

function PlayPrevious(guild, voicechannel, callback) {
    if (global.servers[guild].queue != undefined) {
        const queue = global.servers[guild].queue;
        // Disable repeat to prevent a mess
        if (queue[MaxPreQueue].repeat == 1)
            queue[MaxPreQueue].repeat = 0;
        if (queue[MaxPreQueue - 1] != null) {
            global.servers[guild].queue.unshift(null);
            PlayNext(guild, voicechannel, true);
            return true;
        }
        else
            return false;
    }
    return console.log("Queue no longer exists for this server");
}

function PlayNext(guild, voicechannel, exception=false) {
    if (global.servers[guild].queue != undefined) {
        const queue = global.servers[guild].queue;
        global.servers[guild].player = false;
        console.log(queue)
        console.log("-- QUEUE length: "+ queue.length);
        if (queue[MaxPreQueue].repeat == 1)
            return ContinueQueue(guild, voicechannel);
        else {
            // Otherwise we stop and leave voicechannel
            if (queue[MaxPreQueue + 1] == null) {
                console.log("End of queue");
                // Set queue to undefined for performance
                global.servers[guild] = undefined;
                setTimeout(function () {
                    return voicechannel.leave();
                }, 1000);
            }
            // if the next in queue isn't null we can continue our play
            else {
                if (!exception)
                    global.servers[guild].queue.shift();
                console.log("Play next song");
                return ContinueQueue(guild, voicechannel);
            }
        }
    }
    return console.log("Queue has been ended by leave command!");
}

function Preload(response, callback) {
    if (!fs.existsSync('./audio/'+ response.id + ".mp3")) {
        if (response.source == "youtube") {
            YD.download(response.id, response.id + ".mp3");
            YD.on("finished", function functionName(err, data) {
                return callback();
            });
        }
    }
}

function PreloadNextSong(guild) {
    const song = global.servers[guild].queue[MaxPreQueue + 1];
    if (song != null) {
        if (!fs.existsSync('./audio/'+ song.id + ".mp3")) {
            Preload(song, () => {
                return console.log("PreloadNextSong of song '" + song.id +"' done...");
            });
        }
        else
            return console.log("File exists no need to Preload");
    }
    return console.log("End of queue nothing to load!");
}

function Repeat(guild) {
    var repeat = global.servers[guild].queue[MaxPreQueue].repeat;
    if (repeat == 0) {
        global.servers[guild].queue[MaxPreQueue].repeat = 1;
        return true;
    }
    else {
        global.servers[guild].queue[MaxPreQueue].repeat = 0;
        return false;
    }
}

function SendSongPlayingMsg(guild) {
    const
        bot = global.bot,
        channel = bot.channels.get(global.servers[guild].channel),
        response = global.servers[guild].queue[MaxPreQueue];

    if (response.source == "youtube") {
        const embed = new Discord.RichEmbed()
            .setTitle("▶    Now Playing")
            .setColor(EMBED_COLOR)
            .setThumbnail(response.songdata.thumbnail)
            .setDescription("**Title:** ["+ response.songdata.title + "](https://youtube.com/watch?v=" + response.id + ")\n**Uploaded by:** "+ response.songdata.uploader)
            .setFooter("Dragon Music: Empowered by the blessing of the fire gods!");

        channel
            .send({embed})
            .then(msg => {
                const emojis = ['⏮', '⏸', '⏭', '🔂'];

                react();
                function react(i=0) {
                    setTimeout(() => {
                        if (i < emojis.length) {
                            msg.react(emojis[i]);
                            react(i+1);
                        }
                    }, 500);
                }

                for (var i = 0; i < emojis.length; i++) {
                    fnc.on_reaction(msg, emojis[i]);
                }
            });
    }
}

function SongFoundEmbed(response) {
    if (response.source == "youtube") {
        return new Discord.RichEmbed()
            .setTitle("Found song!")
            .setColor(EMBED_COLOR)
            .setDescription("**Title:** ["+ response.songdata.title + "](https://youtube.com/watch?v=" + response.id + ")\n**Uploaded by:** "+ response.songdata.uploader)
            .setFooter("Dragon Music: Empowered by the blessing of the fire gods!");
    }
}

function SongMonitor(guild, duration, callback) {
    callback();
    return new Promise(function(resolve, reject) {
        if (global.servers[guild].timer != null)
            clearTimeout(timer);
        global.servers[guild].timer = setTimeout(function () {
                resolve();
                global.servers[guild].timer = null;
        }, duration * 1000);
    });
}
