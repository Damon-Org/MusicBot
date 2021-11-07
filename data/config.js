import { Permissions } from 'discord.js'
const { ADD_REACTIONS, STREAM, VIEW_CHANNEL, SEND_MESSAGES, EMBED_LINKS, USE_EXTERNAL_EMOJIS, CONNECT, SPEAK, DEAFEN_MEMBERS } = Permissions.FLAGS;

export default {
    development: true,
    generate_command_json: true,

    creator: "243072972326305798",
    permission_bit: ADD_REACTIONS | STREAM | VIEW_CHANNEL | SEND_MESSAGES | EMBED_LINKS | USE_EXTERNAL_EMOJIS | CONNECT | SPEAK | DEAFEN_MEMBERS,

    allow_mention_prefix: true,
    default_prefix: {
        dev: 's!',
        prod: 'd!'
    },

    presence_settings: {
        switch_interval: 25e3,
        activities: [
            {
                type: "WATCHING",
                name: "s!help"
            },
            {
                type: "WATCHING",
                name: "version ${version}"
            },
            {
                type: "WATCHING",
                name: "us on spyral.gg"
            },
            {
                type: "PLAYING",
                name: "with all the commands on commands.spyral.gg"
            },
            {
                type: "WATCHING",
                name: "over ${serverCount} guilds"
            }
        ]
    }
};
