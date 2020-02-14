const
    spawn = require('child_process').spawn,
    fs = require('fs');

/**
 * This class handles decoding of raw PCM files after the bot has finished recording
 * @category RecordingSystem
 */
class RecordingDecoder {
    /**
     * @param {RecordingSystem} recordingSystem
     */
    constructor(recordingSystem) {
        this.recordingSystem = recordingSystem;

        this.busy = false;
        this.filesDone = 0;
        this.fileCount = 0;
    }

    decodingDone(baseDirectory, filename) {
        console.log(`Decoding of ${filename} is done`);

        fs.unlink(`${baseDirectory}${filename}`, () => { return; });

        this.filesDone++;

        if (this.fileCount == this.filesDone) {
            this.busy = 0;
        }
    }

    decodingPercentage() {
        return this.filesDone / this.fileCount * 100;
    }

    start() {
        this.busy = true;

        const baseDirectory = `${this.recordingSystem.musicBot.main_dir}/media/recording/${this.recordingSystem.serverInstance.id}/${this.recordingSystem.voicechannel.id}/${this.recordingSystem.startTime}/`;

        return fs.readdirSync(baseDirectory).forEach(file => {
            const filepath = baseDirectory + file;

            this.fileCount++;

            const child = spawn('ffmpeg', [
                '-f', 's16le',
                '-ar', '48k',
                '-ac', '2',
                `-i`, filepath,
                filepath.replace('.pcm', '.wav')
            ]);

            child.on('exit', () => this.decodingDone(baseDirectory, file));
        });
    }
}

module.exports = RecordingDecoder;
