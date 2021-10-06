import crypto from '@/utils/CryptoManager';
import Logger from '@/utils/Logger';

const useTLS = process.env.VUE_APP_USE_TLS === 'true' ? 's' : '';
const apiBaseURL = process.env.VUE_APP_API_URL;

const httpBaseURL = `http${useTLS}://${apiBaseURL}/`;
const wsBaseURL = `ws${useTLS}://${apiBaseURL}/`;

let user;
const headers = { 'X-Platform': 'web', 'X-Build': '1', 'Content-Type': 'application/json' };

async function requestAPI(method, url, data) {
    if (user) {
        headers['X-Authorization'] = await crypto.user(user).authHeader();
    }
    const init = {
        method,
        headers,
        body: JSON.stringify(data),
    };
    const res = await fetch(httpBaseURL + url, init);
    const body = await res.json();
    if (body.success === true) {
        return body.result;
    } if (res.ok === true) {
        throw new Error(`${body.error.type}:${body.error.description}`);
    } else {
        throw new Error(`Unknown error: ${JSON.stringify(body)}`);
    }
}

export default {
    httpBaseURL,
    setAuthHeader(newUser) {
        user = newUser;
    },
    openWebsocket(onmessage) {
        const socket = new WebSocket(wsBaseURL, headers['X-Authorization']);
        socket.onmessage = (e) => { onmessage(e.data); };
        socket.onclose = () => { Logger.debug('WebSocket closed'); };
        socket.onopen = () => { Logger.debug('WebSocket opened'); };
        return socket;
    },
    createUser(data) {
        return requestAPI('post', 'user/web', data);
    },
    getMessages() {
        return requestAPI('get', 'message');
    },
    sendMessage(sendMessageRequest) {
        return requestAPI('post', 'message', sendMessageRequest);
    },
    user(userId) {
        return {
            getInfo() {
                return requestAPI('get', `user/${userId}`);
            },
            update(data) {
                return requestAPI('put', `user/${userId}`, data);
            },
            getPublicKeys() {
                return requestAPI('post', `user/${userId}/keys`);
            },
        };
    },
    group(groupId, groupTag) {
        headers['X-GroupTag'] = groupTag;
        return {
            create(data) {
                return requestAPI('post', 'group', data);
            },
            getInfo() {
                return requestAPI('get', `group/${groupId}`);
            },
            join(selfSignedMembershipCertificate) {
                return requestAPI('post', `group/${groupId}/request`, { selfSignedMembershipCertificate });
            },
        };
    },
    groupInternal(groupId, groupTag, serverSignedMembershipCertificate) {
        headers['X-GroupTag'] = groupTag;
        headers['X-ServerSignedMembershipCertificate'] = serverSignedMembershipCertificate;
        return {
            getInternals() {
                return requestAPI('get', `group/${groupId}/internals`);
            },
            addMember(data) {
                return requestAPI('post', `group/${groupId}/member`, data);
            },
            delete(data) {
                return requestAPI('delete', `group/${groupId}`, data);
            },
        };
    },
};
