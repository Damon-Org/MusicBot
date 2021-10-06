export default {
    development: true,
    generate_command_json: true,

    creator: "243072972326305798",
    permission_bit: 238348632,

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
                type:  "WATCHING",
                name: "us on spyral.gg"
            },
            {
                type:  "PLAYING",
                name: "with all the commands on commands.spyral.gg"
            },
            {
                type:  "WATCHING",
                name: "over ${serverCount} guilds"
            }
        ]
    }
};
