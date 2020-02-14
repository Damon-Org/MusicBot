const
    fs = require('fs'),

    RecordingDecoder = require('./decoder.js'),
    RecordingRequest = require('./request.js');

/**
 * The glue that holds the entire RecordingSystem together
 * @category RecordingSystem
 */
class RecordingSystem {
    /**
     * @param {MusicBot} musicBot instance
     */
    constructor(musicBot, serverInstance) {
        this.musicBot = musicBot;
        this.serverInstance = serverInstance;

        this.reset();
    }

    /**
     * This method will gracefully close all connections, terminate open file handles and leave the voicechannel afterwards
     */
    closeConnections() {
        this.closingConnections = true;

        const userStreams = this.userStreams.values();

        for (let userStream of userStreams) {
            userStream.audio.destroy();
        }
    }

    /**
     * @param {String} baseDirectory
     */
    createBaseDirIfNotExists(baseDirectory) {
        if (!fs.existsSync(baseDirectory)) {
            fs.mkdirSync(baseDirectory, {recursive: true});
        }
    }

    /**
     *  @param {Discord.User} user
     */
    getFileStreamForUser(user) {
        const baseDirectory = `${this.musicBot.main_dir}/media/recording/${this.serverInstance.id}/${this.voicechannel.id}/${this.startTime}/`;

        this.createBaseDirIfNotExists(baseDirectory);

        const fileName = `${baseDirectory}${Date.now()}-${user.id}.pcm`;

        return fs.createWriteStream(fileName, { flags: 'a+' });
    }

    /**
     * @param {Discord.User}
     */
    async hasUserAcceptedRecording(user) {
        const recordingRequest = this.recordingRequests.get(user.id);

        if (!recordingRequest && !this.userStreams.get(user.id)) {
            const requestInstance = new RecordingRequest(this, user);
            this.recordingRequests.set(user.id, requestInstance);

            await requestInstance.sendRequestEmbed();

            return false;
        }
        else if (this.userStreams.get(user.id)) {
            return true;
        }

        return recordingRequest.accepted;
    }

    /**
     * @param {Number} yesnoOption index of the chosen option
     * @param {Discord.Message} msgObj
     * @param {Discord.User} user
     */
    onRequestAction(yesnoOption, msgObj, user) {
        const recordingRequest = this.recordingRequests.get(user.id);

        if (!yesnoOption) {
            recordingRequest.accepted = true;
        }

        msgObj.delete();
        user.send('Thanks for letting me know.');
    }

    reset() {
        this.closingConnections = false;
        this.decoder = new RecordingDecoder(this);

        this.userStreams = new Map();
        this.recordingRequests = new Map();

        this.recording = false;
        this.startTime = null;
        this.voicechannel = null;
    }

    /**
     * @param {Discord.Message} msgObj
     * @param {Discord.VoiceChannel} voicechannel
     */
    async start(msgObj, voicechannel) {
        this.startTime = Date.now();

        this.shutdownTimer = setTimeout(() => {
            this.closeConnections();

            this.textchannel.send('No user accepted to being recorded within 15 seconds of starting the command.');
        }, 15e3);

        this.textchannel = msgObj.channel;
        this.voicechannel = voicechannel;

        this.conn = await voicechannel.join();

        this.conn.on('speaking', (user, state) => this.userStartSpeaking(user));

        this.recording = true;
    }

    startDecodingLast() {
        this.decoder.start();

        this.voicechannel.leave();

        this.reset();
    }

    /**
    * @param {Discord.User} user
    * @param {fs.WriteStream} outputStream
    */
    userDisconnected(user, outputStream) {
        this.userStreams.delete(user.id);

        outputStream.end();

        if (!this.closingConnections && this.userStreams.size == 0) {
            this.textchannel.send('Last person left the voicechannel, decoding of audio will now begin.');

            this.startDecodingLast();
        }
    }

    /**
     * @param {Discord.User}
     */
    async userStartSpeaking(user) {
        if (this.userStreams.get(user.id) || !await this.hasUserAcceptedRecording(user)) {
            return;
        }

        clearTimeout(this.shutdownTimer);

        const
            outputStream = this.getFileStreamForUser(user),
            audioStream = this.conn.receiver.createStream(user, {
                mode: 'pcm',
                end: 'manual'
            });

        audioStream.pipe(outputStream);

        this.userStreams.set(user.id, { audio: audioStream, output: outputStream });

        audioStream.on('close', () => this.userDisconnected(user, outputStream));
    }
}

module.exports = RecordingSystem;
