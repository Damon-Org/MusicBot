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
        "db": {
            "prod": {
                "connectionLimit": 5000,
                "host": "home.damon.sh",
                "user": "db_admin",
                "password": "s7E1$EA41%$vu6",
                "database": "damon_new",
                "debug": false,
                "supportBigNumbers": true,
                "bigNumberStrings": true
            },
            "dev": {
                "connectionLimit": 100,
                "host": "home.damon.sh",
                "user": "db_admin",
                "password": "s7E1$EA41%$vu6",
                "database": "damon_new",
                "debug": false,
                "supportBigNumbers": true,
                "bigNumberStrings": true
            }
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
