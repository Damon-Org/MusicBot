const SocketMessage = require('../socket/message.js');

class SocketUtils {
    constructor() {

    }

    /**
     * This will construct a basic socket message
     * @param {Number} identifier Internal identifier, if a response comes from the target this identifier will be emitted
     * @param {String} client The client that made the request
     * @param {String} target The target type that should receive the message
     * @param {String} request The message to give to the target
     * @param {String} type The type of message "full" or "part"
     */
    createBasicRequestMessage(client, target, request, type = 'full', timeout = 150) {
        const
            identifier = Date.now().toString(16),
            socketMessage = new SocketMessage({
                identifier: identifier,
                client_id: null, // This is for the socket server to find

                client: client,
                target: target,

                metrics: {
                    client_sent: Date.now(),

                    socket_received_from_client: null,
                    socket_sent_to_target: null,

                    target_received: null,
                    target_sent: null,

                    socket_received_from_target: null,
                    socket_sent_to_client: null,

                    client_received: null
                },

                request: request,
                rejected: null,

                target_count: null, // Only applied to part type, shows the amount of targets that should've been reached, counting messages will show how many actually responded
                timeout: timeout, // Only applied to part messages
                type: type, // full is a full message, part means that there are more messages that need to be added to form one answer

                message: null
            });

        return [identifier, socketMessage];
    }
}

module.exports = SocketUtils;
