// /* eslint-disable import/no-cycle */
// import crypto from './CryptoManager';
import { defineStore } from 'pinia'
import { useLoggerStore } from '@/stores/LoggerStore'

export const useAPIRequestStore = defineStore('api', () => {

const Logger = useLoggerStore()

const useTLS = import.meta.env.VITE_USE_TLS === 'true' ? 's' : '';
const apiBaseURL = import.meta.env.VITE_API_URL;

const httpBaseURL = `http${useTLS}://${apiBaseURL}/`;
const wsBaseURL = `ws${useTLS}://${apiBaseURL}/`;

let savedUser;
const headers = { 'X-Platform': 'web', 'X-Build': '1', 'Content-Type': 'application/json' };

async function requestAPI(method, url, data) {
    if (savedUser) {
        headers['X-Authorization'] = await crypto.user(savedUser).authHeader();
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

function setAuthHeader(newUser) {
  savedUser = newUser;
}
function openWebsocket(onmessage) {
    const socket = new WebSocket(wsBaseURL, headers['X-Authorization']);
    socket.onmessage = (e) => { onmessage(e.data); };
    socket.onclose = () => { Logger.debug('WebSocket closed'); };
    socket.onopen = () => { Logger.debug('WebSocket opened'); };
    return socket;
}
function createUser(data) {
    return requestAPI('post', 'user/web', data);
}
function getMessages() {
    return requestAPI('get', 'message');
}
function sendMessage(sendMessageRequest) {
    return requestAPI('post', 'message', sendMessageRequest);
}
function user(userId) {
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
}
function group(groupId, groupTag) {
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
}
function groupInternal(groupId, groupTag, serverSignedMembershipCertificate) {
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
}

return { httpBaseURL, setAuthHeader, openWebsocket, createUser, getMessages, sendMessage, user, group, groupInternal }
})