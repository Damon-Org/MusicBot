export const DisconnectCodes = {
    'MESSAGE_TOO_BIG': 1009,
    'SERVER_RESTART': 1012,

    'UNKNOWN_ERROR': 4000,
    'UNKNOWN_OP': 4001,
    'INVALID_PAYLOAD': 4002,
    'UNAUTHORIZED': 4003,
    'IDENTIFY_FAILED': 4004,
    'ALREADY_IDENTIFIED': 4005
};

export const Events = {
    'RELOAD_COMMANDS': 'reloadCommands',
    'RELOAD_MODULES': 'reloadModules',

    'USER_CREATE': 'userCreate',
    'USER_UPDATE': 'userUpdate'
};

export const OPCodes = {
    'EVENT': 0,
    'HEARTBEAT': 1,
    'IDENTIFY': 2,
    'BONJOUR': 3,
    'COMMUNICATION_CLOSE': 4,
    'REPLY': 5
};

export const TargetTypes = {
    'GLOBAL': 0,
    'GROUP': 1,
    'DIRECT': 2
};

export const Website = 'https://music.damon.sh';
