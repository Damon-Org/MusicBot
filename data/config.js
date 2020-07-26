export default {
    "development": true,
    "generate_command_json": true,

    "creator": "Yimura#6969", 

    "client_options": {
        "disableMentions": "everyone",

        "messageCacheMaxSize": 100,
        "messageCacheLifetime": 86400,
        "messageSweepInterval": 86400,

        "retryLimit": 1,

        "ws": {
            "intents": 13955
        }
    },

    "allow_mention_prefix": true,
    "default_prefix": {
        "prod": "d!",
        "dev": "dev!"
    },

    "permission_bit": 238348632,

    "presence_settings": {
        "switch_interval": 25e3,
        "presences": [
            {
                "activity": {
                    "type": "WATCHING",
                    "name": "version ${version}"
                }
            },
            {
                "activity": {
                    "type": "LISTENING",
                    "name": "d!help"
                }
            },
            {
                "activity": {
                    "type": "WATCHING",
                    "name": "us on https://music.damon.sh"
                }
            },
            {
                "activity": {
                    "type": "PLAYING",
                    "name": "with all the commands on https://music.damon.sh/#/commands"
                }
            },
            {
                "activity": {
                    "type": "WATCHING",
                    "name": "over ${serverCount} guilds"
                }
            }
        ]
    }
}