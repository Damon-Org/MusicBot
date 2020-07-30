import Discord from 'discord.js'
import log from '../../../util/Log.js'
import EmbedUtils from '../../../util/Embed.js'

import MusicQueue from './Queue.js'
import MusicShutdown from './Shutdown.js'
import MusicUtil from './Util.js'

import LavaTrack from './track/LavaTrack.js'
import SpotifyTrack from './track/SpotifyTrack.js'

import DJManager from './dj/Manager.js'

export default class MusicSystem {
    /**
     * @param {MainClient} mainClient
     * @param {Server} server
     */
    constructor(mainClient, server) {
        this.mainClient = mainClient;

        this.server = server;

        this.queue = new MusicQueue();
        this.shutdown = new MusicShutdown(this);
        this.util = new MusicUtil(this);

        this.djManager = new DJManager(this);

        this.reset();
    }

    get lavalink() {
        return this.getModule('lavaLink').conn;
    }

    get node() {
        return this.lavalink.getNode();
    }

    getModule(moduleName) {
        return this.mainClient.moduleManager.get(moduleName);
    }

    /**
     * Adds a song to the queue together with its requester
     * @param {LavaTrack|SpotifyTrack} track Data found by the LavaLink REST APi
     * @param {GuildMember} serverMember A Discord.GuildMember instance
     * @param {Boolean} [exception=false] If the song should be played next up or handled normally
     * @returns {Boolean} Returns the result of MusicQueue#add
     */
    addToQueue(track, requester, exception = false) {
        track.requester = requester;

        if (exception) {
            this.cacheSongIfNeeded(track);

            return this.queue.addOnPosition(track, 2);
        }
        this.cacheSongIfNeeded();

        return this.queue.add(track);
    }

    async cacheSongIfNeeded(track = null) {
        if (track == null) {
            track = this.queue.getFromPosition(2);

            if (track == null) return;
        }

        if (track instanceof SpotifyTrack && !track.cached)
            await track.getYouTubeEquiv();
    }

    /**
     * Will pass on to the next song
     * @param {VoiceChannel} [voiceChannel=null] A Discord.VoiceChannel instance
     */
    async continueQueue(voiceChannel = null) {
        if (await this.playSong(voiceChannel)) {
            this.ended = false;

            await this.createNewPlayer();

            return true;
        }

        return false;
    }

    /**
     * Will create a nice embed that looks like a player interface
     */
    async createNewPlayer() {
        this.updateSongState();

        const track = this.queue.active();
        if (this.lastMsg && this.channel.lastMessageID == this.lastMsg.id) {
            EmbedUtils.editEmbed(this.lastMsg, {
                author: { name: track.full_author },
                color: this.songState.color,
                description: `Requested by: **${track.requester}**`,
                thumbnail: track.image ?? track.image,
                title: track.title,
                footer: {
                    text: this.songState.footer
                }
            });

            return;
        }

        this.disableOldPlayer(true);

        const
            richEmbed = new Discord.MessageEmbed()
                .setAuthor(track.author)
                .setTitle(track.title)
                .setThumbnail(track.image ? track.image : null)
                .setColor(this.songState.color)
                .setDescription(`Requested by: **${track.requester}**`)
                .setFooter(this.songState.footer),
            newMsg = await this.channel.send(richEmbed),
            emojis = ['⏮️', '⏸', '⏭', '🔁'];

        this.lastMsg = newMsg;

        emojis.forEach(async emoji => {
            if (!newMsg.deleted) {
                await newMsg.react(emoji)
                .catch(e => {
                    if (e.message != 'Unknown Message') {
                        console.log(e.stack);
                    }
                });
            }
        });
    }

    /**
     * Sets the dedicated TextChannel and then passes the Song to MusicSystem#AddToQueue
     * @param {LavaTrack|SpotifyTrack} track Data found by the LavaLink REST APi
     * @param {GuildMember} requester
     * @param {TextChannel} textChannel A Discord.TextChannel instance
     */
    async createQueue(track, requester, textChannel) {
        this.startTime = Date.now();

        this.channel = textChannel;

        track.requester = requester;
        await this.cacheSongIfNeeded(track);

        this.addToQueue(track, requester);
    }

    /**
     * Will disable the last musicPlayer of our bot
     * @param {Boolean} force If the old player should be forcefully disabled no matter what
     */
    disableOldPlayer(force = false) {
        if (this.lastMsg && !this.lastMsg.deleted && (this.channel.lastMessageID != this.lastMsg.id || force)) {
            EmbedUtils.editEmbed(this.lastMsg, {
                color: '#4f545c'
            });

            this.lastMsg.reactions.removeAll()
            .catch(err => {
                this.channel.send(`Unknown error occured\nThis generated the following error: \`\`\`js\n${err.stack}\`\`\`Contact ${this.mainClient.config.creator} on Discord if this keeps occuring.`);
            });
        }
    }

    /**
     * Disconnects the player if one exists
     */
    disconnect() {
        if (this.player) this.player.disconnect();
    }

    /**
     * @param {VoiceChannel} voiceChannel
     * @returns {Promise<LavaPlayer>|LavaPlayer}
     */
    getPlayer(voiceChannel) {
        const player = this.lavalink.getPlayer(voiceChannel.guild.id);
        if (player && this.isDamonInVC(voiceChannel))
            return player;

        if (player) player.disconnect();

        return this.node.joinVoiceChannel({
            guildID: voiceChannel.guild.id,
            voiceChannelID: voiceChannel.id
        });
    }

    /**
     * Checks if our bot is in the channel of that user doing the request if not return false
     * @param {VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     * @returns {Boolean} True if Damon is in a voiceChannel, false if not
     */
    isDamonInVC(voiceChannel) {
        if (!voiceChannel) return false;
        return voiceChannel.members.has(this.mainClient.user.id);
    }

    /**
     * @param {Number} index The index of the song in the Choice instance
     * @param {Message} msgObj
     * @param {User} user
     */
    async onChoiceEmbedAction(index, msgObj, user) {
        const choice = this.server.localUsers.getProp(user.id, 'choice');
        if (!choice || choice.listener.id != msgObj.id || choice.handled) {
            return;
        }

        if (index > 4) {
            msgObj.delete();

            return;
        }

        choice.handled = true;

        const
            requester = choice.requester,
            videoId = choice.ids[index],
            voiceChannel = choice.voiceChannel;

        if (!videoId) {
            return;
        }

        let
            data = null,
            attempt = 0;

        do {
            data = await this.node.rest.resolve(`https://youtu.be/${videoId}`);

            attempt++;
        } while ((!data || data.tracks.length == 0) && attempt < 3);

        if (!data || data.length == 0) {
            msgObj.channel.send(`${requester}, failed to queue song, perhaps the song is limited in country or age restricted?`)
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        data = new LavaTrack(data.tracks[0]);

        if (!voiceChannel.members.get(user.id)) {
            msgObj.channel.send(`${requester}, you've left your original voicechannel, request ignored.`)
                .then(msg => msg.delete({timeout: 5e3}));

            msgObj.delete();

            return;
        }

        this.util.handleSongData(data, requester, msgObj, voiceChannel, null, choice.shouldPlayNext);

        msgObj.delete();
        this.server.localUsers.removeProp(user.id, 'choice');
    }

    /**
     * @param {Number} yesnoOption
     * @param {Message} msgObj
     * @param {User} user
     */
    async onPlaylistAction(yesnoOption, msgObj, user) {
        const playlistObj = this.server.localUsers.getProp(user.id, 'playlist');

        if (!playlistObj) return;
        if (playlistObj.msgObj.id != msgObj.id) return;

        msgObj.delete();

        const
            exception = playlistObj.exception,
            serverMember = playlistObj.requester,
            textchannel = msgObj.channel,
            voiceChannel = playlistObj.voicechannel;

        if (!voiceChannel.members.get(user.id)) {
            const newMsg = await msgObj.channel.send(`${serverMember}, you've left your original voicechannel, request ignored.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        if (yesnoOption) {
            if (!playlistObj.videoId) {
                const richEmbed = new Discord.MessageEmbed()
                    .setTitle('Playlist Exception.')
                    .setDescription(`Playlist link did not contain a song to select.`)
                    .setColor('#ed4337');

                msgObj.channel.send(richEmbed);

                return;
            }

            const data = await this.node.rest.resolve(`https://youtube.com/watch?v=${playlistObj.videoId}`);
            if (!data) {
                const richEmbed = new Discord.MessageEmbed()
                    .setTitle('No results returned.')
                    .setDescription(`I could not find the track you requested or access to this track is limited.\nPlease try again with something other than what you tried to search for.`)
                    .setColor('#ed4337');

                msgObj.channel.send(richEmbed);

                return;
            }

            data = new LavaTrack(data);

            this.util.handleSongData(data, serverMember, msgObj, voiceChannel, null, exception);

            return;
        }


        for (let i = 0; i < playlistObj.playlist.length; i++) {
            const song = new LavaTrack(playlistObj.playlist[i]);
            if (!await this.util.handleSongData(song, serverMember, msgObj, voiceChannel, null, false, false)) break;
        }

        msgObj.channel.send('Successfully added playlist!');
    }

    nodeError(err) {
        this.shutdown.instant();
    }

    /**
     * Will handle any action on MusicPlayer Reactions
     * @param {String} emoji A unicode string of the emoji
     * @param {Message} msgObj
     * @param {User} user
     */
    async onMusicPlayerAction(emoji, msgObj, user) {
        if (!this.lastMsg || this.lastMsg.id != msgObj.id || !this.voiceChannel.members.get(user.id)) {
            return;
        }

        switch (emoji) {
            case '⏮️': {
                this.playPrevious();
                break;
            }
            case '⏸': {
                this.pauseToggle();
                break;
            }
            case '⏭': {
                this.player.stopTrack();
                break;
            }
            case '🔁': {
                if (!this.playerRepeatToggle()) {
                    const newMsg = await msgObj.channel.send('The currently playing song was removed and repeat has been disabled.');

                    newMsg.delete({timeout: 5000});
                }
                break;
            }
        }
    }

    /**
     * Method pauses music playback
     */
    pausePlayback() {
        if (!this.paused) {
            this.player.setPaused(true);

            this.paused = true;

            this.updateSongState();

            EmbedUtils.editEmbed(this.lastMsg, {
                color: this.songState.color,
                footer: {
                    text: this.songState.footer
                }
            });

            return true;
        }

        return false;
    }

    /**
     * Will toggle resume/pause depending on the state of the active song
     */
    pauseToggle() {
        if (this.paused) {
            this.resumePlayback();

            return;
        }

        this.pausePlayback();
    }

    /**
     * Will go through several checks of things that have to get updated before moving on to the next song
     */
    async playNext() {
        const activeSong = this.queue.active();

        if (activeSong == null) {
            this.queue.remove(null);
        }
        else if (activeSong.repeat) {
            this.continueQueue();

            return;
        }

        if (!this.doNotSkip && this.queue.getFromPosition(2) == null) {
            if (this.queue.repeat) {
                this.queue.rewind();

                this.continueQueue();
                return;
            }

            this.disableOldPlayer(true);
            this.channel.send(`Queue has been concluded and the bot will leave in 5 minutes, type the \`restart\` command to requeue your the old queue (only if within those same 5 minutes).`);
            this.shutdown.delay('leave', 3e5);

            return;
        }

        if (!this.doNotSkip) {
            this.queue.shift();
        }
        this.doNotSkip = false;

        this.continueQueue();
    }

    /**
     * This will put the queue back to the previous song and then play the next song
     * @returns {Boolean} True on success, false when no more previous songs
     */
    async playPrevious() {
        this.doNotSkip = true;

        if (this.queue.active() == null) {
            // Remove the current active song
            this.queue.remove(null);

            this.queue.unshift(null);

            if (!await this.player.stopTrack()) this.soundEnd();
        }
        else if ((this.queue.active()).repeat) {
            (this.queue.active()).repeat = false;
        }

        if (this.queue.getFromPosition(-1) != null) {
            this.queue.unshift(null);

            if (!await this.player.stopTrack()) this.soundEnd();

            return true;
        }

        this.doNotSkip = false;

        return false;
    }

    /**
     * Toggles through all the repeat modes
     */
    playerRepeatToggle() {
        if (this.queue.active() == null) {
            return false;
        }

        const
            queueRepeat = this.queue.repeat,
            songRepeat = (this.queue.active()).repeat;

        if (!songRepeat) {
            if (!queueRepeat) {
                (this.queue.active()).repeat = true;
            }
            else {
                (this.queue.active()).repeat = false;
            }
            this.queue.repeat = false;
        }
        else {
            this.queue.repeat = true;
            (this.queue.active()).repeat = false;
        }

        this.updateSongState();

        EmbedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return true;
    }

    /**
     * @param {VoiceChannel} [voiceChannel=null] A Discord.VoiceChannel instance
     */
    async playSong(voiceChannel = null) {
        if (!this.voiceChannel) {
            if (!this.isDamonInVC(voiceChannel)) {
                if (voiceChannel.full && !voiceChannel.guild.me.hasPermission('ADMINISTRATOR')) {
                    const richEmbed = new Discord.MessageEmbed()
                        .setTitle('Channel Full')
                        .setColor('#ff0033')
                        .setDescription('Voicechannel is full, try kicking someone or make the voicechannel size larger.');

                    this.channel.send(richEmbed);

                    this.shutdown.instant();
                    return false;
                }

                if (!voiceChannel.joinable) {
                    const richEmbed = new Discord.MessageEmbed()
                        .setTitle('Insufficient permissions')
                        .setColor('#ff0033')
                        .setDescription('I do not have permission to join your channel.');

                    this.channel.send(richEmbed);

                    this.shutdown.instant();
                    return false;
                }
            }

            this.player = await this.getPlayer(voiceChannel);

            //this.player.on('closed', this.playerListener['closed'] = (reason) => this.playerDisconnected(reason));

            this.voiceChannel = voiceChannel;
        }

        const currentSong = this.queue.active();
        if (currentSong.broken) {
            this.channel.send(`No equivalent video could be found on YouTube for **${currentSong.title}**`);

            this.playNext();

            return false;
        }

        await this.cacheSongIfNeeded(currentSong);

        if (!await this.player.playTrack(currentSong.track)) {
            log.warn('MUSIC_SYSTEM', 'Failed to playTrack, the instance might be broken:', currentSong.track ?? currentSong);

            this.playNext();

            return false;
        }
        await this.player.setVolume(this.volume);

        this.player.on('start', this.playerListener['start'] = () => this.soundStart());

        this.cacheSongIfNeeded();

        //this.player.on('closed', () => this.soundEnd(end));
        //this.player.on('nodeDisconnect', endFunction);

        return true;
    }

    /**
     * Will return true if a valid queue exists
     * @returns {Boolean}
     */
    queueExists() {
        return this.queue.active() != null;
    }

    /**
     * @param {Number} queueNumber A number that exists in queue
     */
    removeSong(queueNumber) {
        if (!queueNumber || queueNumber == '' || queueNumber.length == 0) {
            queueNumber = 1;
        }
        else if (isNaN(queueNumber) || queueNumber < -this.queue.maxPrequeue || queueNumber == 0) return false;

        queueNumber = parseInt(queueNumber);

        if (!this.queue.hasOnPosition(queueNumber)) return false;

        return this.queue.removeOnPosition(queueNumber);
    }

    /**
     * Enables entire queue repeat
     * @returns {Boolean} Returns the new boolean state of the queue
     */
    repeatQueueToggle() {
        const queueRepeat = this.queue.repeat;

        if (this.queue.active() != null) {
            (this.queue.active()).repeat = false;
        }

        this.queue.repeat = !queueRepeat;

        this.updateSongState();
        embedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return this.queue.repeat;
    }

    /**
     * Repeat toggle for the command
     * @returns {Boolean}
     */
    repeatToggle() {
        const songRepeat = (this.queue.active()).repeat;

        (this.queue.active()).repeat = !songRepeat;

        this.updateSongState();
        EmbedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return (this.queue.active()).repeat;
    }

    /**
     * Will reset all variables so our system is ready for a request
     */
    reset(disconnect = true) {
        if (disconnect) this.disconnect();

        this.disableOldPlayer(true);

        this.djManager.reset(true);
        this.shutdown.reset();
        this.queue.reset();

        if (this.player) this.player.removeAllListeners();

        this.playerListener = {};

        /**
         * @type {TextChannel}
         */
        this.channel = null;
        /**
         * @type {Message}
         */
        this.lastMsg = null;

        /**
         * @type {Boolean}
         */
        this.doNotSkip = false;
        /**
         * @type {VoiceChannel}
         */
        this.voiceChannel = null;

        /**
         * @type {Boolean}
         */
        this.paused = false;
        /**
         * @type {Number}
         */
        this.startTime = 0;
        /**
         * @type {Number}
         */
        this.volume = 30;

        this.updateSongState();
    }

    /**
     * Resumes the music
     */
    resumePlayback() {
        if (this.paused) {
            this.player.setPaused(false);

            this.paused = false;

            this.updateSongState();

            EmbedUtils.editEmbed(this.lastMsg, {
                color: this.songState.color,
                footer: {
                    text: this.songState.footer
                }
            });
        }

        return;
    }

    /**
     * @param {Number} queueNumber A number that exists in queue
     * @returns {Boolean} False if invalid queueNumber was given, true on success
     */
    async skipTo(queueNumber) {
        if (queueNumber == 1) return true;
        if (isNaN(queueNumber) || queueNumber < -this.queue.maxPrequeue || queueNumber == 0) return false;

        queueNumber = parseInt(queueNumber);

        if (!this.queue.hasOnPosition(queueNumber)) return false;

        const loopCount = queueNumber < 0 ? (queueNumber*-1) : queueNumber - 1;
        this.doNotSkip = true;
        this.paused = false;

        const nextSong = this.queue.getFromPosition(queueNumber);
        await this.cacheSongIfNeeded(nextSong);

        for (let i = 0; i < loopCount; i++) {
            if (queueNumber < 0) this.queue.unshift(null);
            else this.queue.shift(null);
        }

        if (!await this.player.stopTrack()) this.soundEnd();

        return true;
    }

    /**
     * Sets the volume on the active stream
     * @param {Number} volume
     * @returns False if unchanged, true otherwise
     */
    setVolume(volume) {
        if (this.volume == volume) {
            return false;
        }

        this.player.setVolume(volume);
        this.volume = volume;

        return true;
    }

    /**
     * @param {external:String} end A string end reason
     */
    soundEnd(end) {
        this.player.removeListener('error', this.playerListener['error']);
        this.playerListener['error'] = null;
        this.player.removeListener('end', this.playerListener['end']);
        this.playerListener['end'] = null;

        if (end.type == 'TrackStuckEvent') return;
        if (end.reason == 'LOAD_FAILED') {
            this.playSong();

            return;
        }

        const currentSong = this.queue.active();

        log.info('MUSIC_SYSTEM', `Finished track: ${currentSong ? currentSong.title : '{ REMOVED SONG }'}`);

        this.playNext();
    }

    soundStart() {
        const currentSong = this.queue.active();

        log.info('MUSIC_SYSTEM', 'Started track: ' + currentSong ? currentSong.title : '{ REMOVED SONG }');

        this.player.removeListener('start', this.playerListener['start']);
        this.playerListener['start'] = null;

        this.player.on('error', this.playerListener['error'] = (error) => this.nodeError(error));

        this.player.on('end', this.playerListener['end'] = (end) => this.soundEnd(end));
    }

    /**
     * Will start the queue in the given voicechannel
     * @param {VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async startQueue(voiceChannel) {
        return await this.continueQueue(voiceChannel);
    }

    /**
     * This method dynamically updates the active music player embed, calling this will update the embed based on the most recent internal checks
     */
    updateSongState() {
        this.songState = {
            footer: 'Repeat: Off',
            color: '#32cd32'
        };

        if (this.queue.active() == null) {
            this.songState.footer = 'Song has been removed and repeat has been disabled.';
        }
        else if ((this.queue.active()).repeat) {
            this.songState.footer = 'Repeat: On';
            this.songState.color = '#cccccc';
        }

        if (this.queue.repeat && this.queue.active() && !(this.queue.active()).repeat) {
            this.songState.footer += ' | Playlist repeat: On';
        }

        if (this.paused) {
            this.songState.footer = `Paused | ${this.songState.footer}`;
            this.songState.color = '#dd153d';
        }
    }
}
