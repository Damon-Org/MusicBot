export default {
    "token": {
        "prod": "NTQ0NTIyMDU0OTMwNzkyNDQ5.XdExdA.-j0hmybYVhANIqhK6GPIY0BVXn4",
        "dev": "NTY3NzM2ODE5MzA3NzczOTYy.XQP_2w.nIbgKE5z8Lul5fEDXM3_askeMJY"
    },
    "credentials": {
        "api": {
            "spotify": {
                "clientId": "fda3b967e9e545a691cb359f933b52aa",
                "clientSecret": "4de0243f5d864a3dbbfb81af5901a57d"
            }
        },

        "casalink": [
            {
                "name": "CasaLink_Test",
                "host": "127.0.0.1",
                "port": 13333,
                "token": "DsBEHzSssAc8oOEwZdRk7UM374c8KZM0"
            }
        ],

        "mongodb": {
            "prod": {
                "auth": {
                    "host": "home.damon.sh",
                    "user": "db_chirp_user",
                    "password": "ZuayQE6x7WJM97I8CxrpuSmpSgFC0cJO",
                    "database": "chirp",
                    "port": "27017"
                },
                "options": {
                    "useNewUrlParser": true,
                    "useUnifiedTopology": true,
                    "useFindAndModify": false,
                    "useCreateIndex": true
                }
            },
            "dev": {
                "auth": {
                    "host": "home.damon.sh",
                    "user": "db_chirp_user",
                    "password": "ZuayQE6x7WJM97I8CxrpuSmpSgFC0cJO",
                    "database": "chirp",
                    "port": "27017"
                },
                "options": {
                    "useNewUrlParser": true,
                    "useUnifiedTopology": true,
                    "useFindAndModify": false,
                    "useCreateIndex": true
                }
            },
        },

        "lavalink": [
            {
                "name": "Damon_LavaLink",
                "host": "lavalink.damon.sh",
                "port": 6978,
                "auth": "3s^l82aZ2i8p^1X%"
            }
        ],

        "ws": {
            "group": "damon",
            "host": "home.damon.sh",
            "port": 8080,
            "token": "JN&VNZkH4UkWbC25RVT^LE0LligJY8*73t8@HkW1@UT!jg0Z0PjiczVBRhH@5kX$"
        }
    }
}
