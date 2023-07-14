import { defineStore } from 'pinia'
import _sodium from 'libsodium-wrappers';
import { DoubleRatchet, Header } from 'double-ratchet-ts';
import { deriveHKDFKey } from 'sodium-hkdf';
import { X3DH } from 'x3dh';
import { ec as EC } from 'elliptic';
import KeyEncoder from 'key-encoder';
// /* eslint-disable import/no-cycle */
import api from '../utils/APIRequestManager';
import Logger from '../utils/Logger';

export const useCryptoStore = defineStore('crypto', () => {
const info = 'TICE';
const maxSkip = 5000;
const maxCache = 100;
let cookiesAllowed = false;

let groupId;

let handshake; // X3DH
let signingKey; // JWK.Key
const ec = new EC('p521');

function generateUUID() {
    let d = new Date().getTime();
    let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    /* eslint-disable no-bitwise, no-mixed-operators */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    /* eslint-enable no-bitwise, no-mixed-operators */
}

const sessionCollapseId = generateUUID();

const encoderOptions = {
    curveParameters: [1, 3, 132, 0, 35],
    privatePEMOptions: { label: 'EC PRIVATE KEY' },
    publicPEMOptions: { label: 'PUBLIC KEY' },
    curve: ec,
};
const keyEncoder = new KeyEncoder(encoderOptions);

function stringifyKeyPair(keyPair) {
    const item = { publicKey: Array.from(keyPair.publicKey), privateKey: Array.from(keyPair.privateKey), keyType: keyPair.keyType };
    return JSON.stringify(item);
}
function parseKeyPair(stringified) {
    const item = JSON.parse(stringified);
    return { publicKey: Uint8Array.from(item.publicKey), privateKey: Uint8Array.from(item.privateKey), keyType: item.keyType };
}
function saveHandshake() {
    if (cookiesAllowed) {
        const handshakeStore = {
            identityKeyPair: stringifyKeyPair(handshake.keyMaterial.identityKeyPair),
            signedPrekeyPair: stringifyKeyPair(handshake.keyMaterial.signedPrekeyPair),
            oneTimePrekeyPairs: handshake.keyMaterial.oneTimePrekeyPairs.map((otp) => stringifyKeyPair(otp)),
        };
        localStorage.setItem(`tice.handshake.${groupId}`, JSON.stringify(handshakeStore));
    }
}

function addOrUpdateDR(senderId, collapsing, userDR) {
    const conversationId = collapsing ? 0 : 1;
    const sessionState = DoubleRatchet.sessionStateBlob(userDR.sessionState);
    localStorage.setItem(`tice.doubleratchet.${conversationId}${senderId}`, sessionState);
}
function getDR(senderId, collapsing) {
    const conversationId = collapsing ? 0 : 1;
    const storedItem = localStorage.getItem(`tice.doubleratchet.${conversationId}${senderId}`);
    if (storedItem === null) { return undefined; }
    return DoubleRatchet.initSessionStateBlob(storedItem);
}

function addSeenConversationInvitations(senderId, collapsing, ciFingerprint, timestamp) {
    const conversationId = collapsing ? 0 : 1;
    localStorage.setItem(`tice.seenconversation.${conversationId}${senderId}`, JSON.stringify({ fingerprint: ciFingerprint, timestamp }));
}
function getSeenConversationInvitations(senderId, collapsing) {
    const conversationId = collapsing ? 0 : 1;
    const item = localStorage.getItem(`tice.seenconversation.${conversationId}${senderId}`);
    return item === null ? undefined : JSON.parse(item);
}

function addSendingConversationInvitation(senderId, collapsing, conversationInvitation) {
    const conversationId = collapsing ? 0 : 1;
    localStorage.setItem(`tice.sendingconversation.${conversationId}${senderId}`, JSON.stringify(conversationInvitation));
}
function getSendingConversationInvitation(senderId, collapsing) {
    const conversationId = collapsing ? 0 : 1;
    const item = localStorage.getItem(`tice.sendingconversation.${conversationId}${senderId}`);
    return item === null ? undefined : JSON.parse(item);
}
function removeSendingConversationInvitation(senderId, collapsing) {
    const conversationId = collapsing ? 0 : 1;
    localStorage.removeItem(`tice.sendingconversation.${conversationId}${senderId}`);
}

async function dataFromBase64(b64EncodedString) {
    await _sodium.ready;
    const sodium = _sodium;
    return sodium.from_base64(b64EncodedString, sodium.base64_variants.ORIGINAL);
}
async function base64EncodedString(data) {
    await _sodium.ready;
    const sodium = _sodium;
    return sodium.to_base64(data, sodium.base64_variants.ORIGINAL);
}

async function encryptSymmetric(key64, plaintextString) {
    await _sodium.ready;
    const sodium = _sodium;

    const key = await dataFromBase64(key64);
    const plaintext = sodium.from_string(plaintextString);
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, null, null, nonce, key);

    const nonceAndCiphertext = new Uint8Array(nonce.length + ciphertext.length);
    nonceAndCiphertext.set(nonce);
    nonceAndCiphertext.set(ciphertext, nonce.length);

    return base64EncodedString(nonceAndCiphertext);
}
async function decryptSymmetric(key64, nonceAndCiphertext64, enc) {
    await _sodium.ready;
    const sodium = _sodium;

    const key = await dataFromBase64(key64);
    const nonceAndCiphertext = await dataFromBase64(nonceAndCiphertext64);
    const nonce = nonceAndCiphertext.slice(0, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = nonceAndCiphertext.slice(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, ciphertext, null, nonce, key);
    if (enc === 'base64') {
        return base64EncodedString(decrypted);
    }
    return sodium.to_string(decrypted);
}

async function encryptPayloadContainer(payloadContainer) {
    await _sodium.ready;
    const sodium = _sodium;

    const key = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    const plaintext = JSON.stringify(payloadContainer);
    const ciphertext = await encryptSymmetric(await base64EncodedString(key), plaintext);

    return { ciphertext, secretKey: key };
}

function sign(privateSigningKey, payload) {
    const hash = ec.hash().update(payload).digest();
    const signature = privateSigningKey.sign(hash);
    return signature.toDER('hex');
}
function verify(publicSigningKey, payload, signature) {
    const hash = ec.hash().update(payload).digest();
    const keypair = ec.keyFromPublic(publicSigningKey, 'hex');
    return ec.verify(hash, signature, keypair);
}
async function jwt(privateSigningKey, payload) {
    await _sodium.ready;
    const sodium = _sodium;
    const header64 = sodium.to_base64(JSON.stringify({ typ: 'JWT', alg: 'ES512' }));
    const payload64 = sodium.to_base64(JSON.stringify(payload));

    const signatureHex = sign(privateSigningKey, `${header64}.${payload64}`);
    const signature64 = sodium.to_base64(sodium.from_hex(signatureHex));
    return `${header64}.${payload64}.${signature64}`;
}
async function selfSignedMembershipCertificate(user) {
    const iat = new Date();
    const exp = new Date();
    exp.setSeconds(iat.getSeconds() + 60 * 60 * 24 * 30 * 6);
    const certificatePayload = {
        iat: iat.getTime() / 1000,
        exp: exp.getTime() / 1000,
        admin: false,
        jti: generateUUID(),
        groupId,
        sub: user.userId,
        iss: { user: user.userId },
    };
    return jwt(user.keys.signingKey, certificatePayload);
}
async function generateMembership(user, group) {
    Logger.trace('Generate membership');

    const selfSignedMembership = await selfSignedMembershipCertificate(user);
    const joinGroupRequest = await api.group(group.groupId, group.groupTag).join(selfSignedMembership);

    return {
        userId: user.userId,
        groupId: group.groupId,
        admin: false,
        publicSigningKey: user.keys.publicSigningKey,
        selfSignedMembershipCertificate: selfSignedMembership,
        serverSignedMembershipCertificate: joinGroupRequest.serverSignedMembershipCertificate,
    };
}

async function loadMembership(user, group) {
    Logger.trace('Load membership');
    const storedMembership = localStorage.getItem(`tice.membership.${group.groupId}`);
    if (storedMembership !== null && storedMembership.userId === user.userId) {
        Logger.trace('Loaded membership from cookie');
        return JSON.parse(storedMembership);
    }
    Logger.trace('Could not load membership');
    return null;
}

async function getMembership(user, group) {
    return (await loadMembership(user, group)) ?? generateMembership(user, group);
}

async function createPrekeyBundle() {
    await _sodium.ready;
    const sodium = _sodium;

    const publicKeyMaterial = await handshake.createPrekeyBundle(100, false, (publicKey) => {
        const signatureHex = sign(signingKey, publicKey);
        return sodium.from_hex(signatureHex);
    });
    saveHandshake();
    const oneTimePrekeysPromises = publicKeyMaterial.oneTimePrekeyPairs.map(async (otp) => base64EncodedString(otp));
    return { publicKeyMaterial, oneTimePrekeys: await Promise.all(oneTimePrekeysPromises) };
}

function conversationInvitationFingerprint(conversationInvitation) {
    return conversationInvitation.identityKey + conversationInvitation.ephemeralKey + conversationInvitation.usedOneTimePrekey;
}

// export
function allowCookies() {
    cookiesAllowed = true;
    saveHandshake();
}

async function generateKeys() {
    signingKey = ec.genKeyPair();
    const publicPEM = keyEncoder.encodePublic(signingKey.getPublic('hex'), 'raw', 'pem');
    const base64PublicSigningKey = await base64EncodedString(publicPEM);

    handshake = await X3DH.init();
    const { publicKeyMaterial, oneTimePrekeys } = await createPrekeyBundle();
    saveHandshake();

    return {
        signingKey,
        publicSigningKey: base64PublicSigningKey,
        userPublicKeys: {
            signingKey: base64PublicSigningKey,
            identityKey: await base64EncodedString(publicKeyMaterial.identityKey),
            signedPrekey: await base64EncodedString(publicKeyMaterial.signedPrekey),
            prekeySignature: await base64EncodedString(publicKeyMaterial.prekeySignature),
            oneTimePrekeys,
        },
    };
}
function user(user) {
    return {
        async updatePrekeyBundle() {
            const { publicKeyMaterial, oneTimePrekeys } = await createPrekeyBundle();
            user.keys.userPublicKeys = {
                signingKey: user.keys.publicSigningKey,
                identityKey: await base64EncodedString(publicKeyMaterial.identityKey),
                signedPrekey: await base64EncodedString(publicKeyMaterial.signedPrekey),
                prekeySignature: await base64EncodedString(publicKeyMaterial.prekeySignature),
                oneTimePrekeys,
            };
            return user;
        },
        async authHeader() {
            await _sodium.ready;
            const sodium = _sodium;
            const now = new Date();
            const validUntil = new Date();
            validUntil.setSeconds(now.getSeconds() + 120);
            const nonce = await base64EncodedString(sodium.randombytes_buf(16));
            return jwt(user.keys.signingKey, {
                iss: user.userId, iat: now.getTime() / 1000, exp: validUntil.getTime() / 1000, nonce,
            });
        },
    };
}
function group(groupKey) {
    return {
        async decrypt(ciphertext, enc) {
            return decryptSymmetric(groupKey, ciphertext, enc);
        },
        async decryptAndParse(ciphertext) {
            return JSON.parse(await decryptSymmetric(groupKey, ciphertext));
        },
        async encrypt(plaintext) {
            return encryptSymmetric(groupKey, JSON.stringify(plaintext));
        },
        async generateTokenKey(userPublicSigningKey64) {
            const userPublicSigningKey = await dataFromBase64(userPublicSigningKey64);
            const groupKeyBytes = await dataFromBase64(groupKey);
            const inputKeyingMaterial = new Uint8Array(groupKeyBytes.length + userPublicSigningKey.length);
            inputKeyingMaterial.set(groupKeyBytes);
            inputKeyingMaterial.set(userPublicSigningKey, groupKeyBytes.length);
            const tokenKey = await deriveHKDFKey(inputKeyingMaterial, 32);
            await _sodium.ready;
            const sodium = _sodium;
            return sodium.to_base64(tokenKey);
        },
    };
}

async function decryptPayloadContainer(envelope) {
    let doubleRatchet = getDR(envelope.senderId, envelope.collapseId !== undefined);
    if (envelope.conversationInvitation) {
        const ciFingerprint = conversationInvitationFingerprint(envelope.conversationInvitation);
        const lastConversationInvitation = getSeenConversationInvitations(envelope.senderId, envelope.collapseId !== undefined);
        if (!lastConversationInvitation || (lastConversationInvitation.fingerprint !== ciFingerprint && lastConversationInvitation.timestamp < envelope.timestamp)) {
            const identityKey = await dataFromBase64(envelope.conversationInvitation.identityKey);
            const ephemeralKey = await dataFromBase64(envelope.conversationInvitation.ephemeralKey);
            const usedOneTimePrekey = envelope.conversationInvitation.usedOneTimePrekey ? await dataFromBase64(envelope.conversationInvitation.usedOneTimePrekey) : undefined;
            try {
                const sharedSecret = await handshake.sharedSecretFromKeyAgreement(info, identityKey, ephemeralKey, usedOneTimePrekey);
                saveHandshake();
                doubleRatchet = await DoubleRatchet.init(info, maxCache, maxSkip, sharedSecret, undefined, handshake.signedPrekeyPair());
                addOrUpdateDR(envelope.senderId, envelope.collapseId !== undefined, doubleRatchet);
                addSeenConversationInvitations(envelope.senderId, envelope.collapseId !== undefined, ciFingerprint, envelope.timestamp);
            } catch (error) {
                Logger.warning("Couldn't get sharedSecret/DoubleRatchet init failed. Resetting.");
                return 'RESET';
            }
        }
    }
    if (!doubleRatchet) {
        Logger.warning('No DR initiated, no conversation invitation. Resetting.');
        return 'RESET';
    }

    // remove sending conversation invitations for this user to stop sending them
    removeSendingConversationInvitation(envelope.senderId, envelope.collapseId !== undefined);

    const rawMessage = JSON.parse(atob(envelope.payloadContainer.payload.encryptedKey));
    const message = {
        cipher: Uint8Array.from(rawMessage.cipher),
        header: new Header(Uint8Array.from(rawMessage.header.publicKey), rawMessage.header.numberOfMessagesInPreviousSendingChain, rawMessage.header.messageNumber),
    };
    try {
        const key64 = await base64EncodedString(await doubleRatchet.decrypt(message));
        addOrUpdateDR(envelope.senderId, envelope.collapseId !== undefined, doubleRatchet);
        const plaintext = await decryptSymmetric(key64, envelope.payloadContainer.payload.ciphertext);
        return JSON.parse(plaintext);
    } catch (error) {
        Logger.warning("Couldn't decrypt message. Resetting.");
        return 'RESET';
    }
}
async function createSendMessageRequest(user, memberships, senderServerSignedMembershipCertificate, payloadContainer, messagePriority = 'deferred', collapsing = false) {
    const { ciphertext, secretKey } = await encryptPayloadContainer(payloadContainer);

    const recipientsPromises = memberships.filter((mbrshp) => mbrshp.userId !== user.userId).map(async (membership) => {
        let doubleRatchet = getDR(membership.userId, collapsing);
        let fulfillReset = false;
        if (payloadContainer.payloadType === 'resetConversation/v1' && doubleRatchet !== undefined) {
            const oldPubKey = doubleRatchet.publicKey().join('');
            const milliseconds = Math.round(Math.random() * 3000);
            await (new Promise((resolve) => setTimeout(resolve, milliseconds)));
            doubleRatchet = getDR(membership.userId, collapsing);
            if (oldPubKey === doubleRatchet.publicKey().join('')) {
                fulfillReset = true;
            }
        }
        if (!doubleRatchet || fulfillReset) {
            const userPublicKeys = await api.user(membership.userId).getPublicKeys();
            const publicSigningKey = keyEncoder.encodePublic(atob(userPublicKeys.signingKey), 'pem', 'raw');
            // TODO: guard membership.publicSigningKey == userPublicKeys.signingKey
            const signaturePayload = await dataFromBase64(userPublicKeys.signedPrekey);

            const keyAgreement = await handshake.initiateKeyAgreement({
                identityKey: await dataFromBase64(userPublicKeys.identityKey),
                signedPrekey: await dataFromBase64(userPublicKeys.signedPrekey),
                prekeySignature: await dataFromBase64(userPublicKeys.prekeySignature),
                oneTimePrekey: await dataFromBase64(userPublicKeys.oneTimePrekey),
            }, (signature) => verify(publicSigningKey, signaturePayload, signature), info);

            doubleRatchet = await DoubleRatchet.init(info, maxCache, maxSkip, keyAgreement.sharedSecret, await dataFromBase64(userPublicKeys.signedPrekey), handshake.signedPrekeyPair());
            addOrUpdateDR(membership.userId, collapsing, doubleRatchet);
            addSendingConversationInvitation(membership.userId, collapsing, { identityKey: await base64EncodedString(keyAgreement.identityPublicKey), ephemeralKey: await base64EncodedString(keyAgreement.ephemeralPublicKey), usedOneTimePrekey: await base64EncodedString(keyAgreement.usedOneTimePrekey) });
        }
        const encryptedMessageKey = await doubleRatchet.encrypt(secretKey);
        addOrUpdateDR(membership.userId, collapsing, doubleRatchet);
        encryptedMessageKey.cipher = Array.from(encryptedMessageKey.cipher);
        encryptedMessageKey.header = { publicKey: Array.from(encryptedMessageKey.header.publicKey), numberOfMessagesInPreviousSendingChain: encryptedMessageKey.header.numberOfMessagesInPreviousSendingChain, messageNumber: encryptedMessageKey.header.messageNumber };
        const encryptedMessageKey64 = btoa(JSON.stringify(encryptedMessageKey));

        const conversationInvitation = getSendingConversationInvitation(membership.userId, collapsing);

        const recipient = {
            userId: membership.userId,
            serverSignedMembershipCertificate: membership.serverSignedMembershipCertificate,
            encryptedMessageKey: encryptedMessageKey64,
        };
        if (conversationInvitation) {
            recipient.conversationInvitation = conversationInvitation;
        }
        return recipient;
    });
    const recipients = await Promise.all(recipientsPromises);

    const request = {
        id: generateUUID(),
        senderId: user.userId,
        timestamp: new Date(),
        encryptedMessage: ciphertext,
        serverSignedMembershipCertificate: senderServerSignedMembershipCertificate,
        recipients,
        priority: messagePriority,
        messageTimeToLive: 1800.0,
    };
    if (collapsing) {
        request.collapseId = sessionCollapseId;
    }
    return request;
}

async function prepareGroupKey(groupKey) {
    await _sodium.ready;
    const sodium = _sodium;
    let groupKeyData;
    try {
        groupKeyData = sodium.from_base64(groupKey);
    } catch (err) {
        groupKeyData = sodium.from_base64(groupKey, sodium.base64_variants.URLSAFE);
    }
    return base64EncodedString(groupKeyData);
}

async function migrateStorage(gId) {
    groupId = gId;
    const oldUserData = localStorage.getItem('tice.user');
    const oldHandshakeData = localStorage.getItem('tice.handshake');
    const oldChatData = localStorage.getItem('tice.chat');
    localStorage.removeItem('tice.user');
    localStorage.removeItem('tice.handshake');
    localStorage.removeItem('tice.chat');
    if (oldUserData === null || oldHandshakeData === null) {
        return;
    }
    Logger.debug('Migrating old user data');
    localStorage.setItem(`tice.user.${groupId}`, oldUserData);
    localStorage.setItem(`tice.handshake.${groupId}`, oldHandshakeData);

    if (oldChatData !== null) {
        Logger.debug('Migrating old chat data');
        localStorage.setItem(`tice.chat.${groupId}`, oldChatData);
    }
}

    // eslint-disable-next-line no-shadow
async function loadFromStorage(gId) {
  groupId = gId;
  const storedUserData = localStorage.getItem(`tice.user.${groupId}`);
  const storedHandshakeData = localStorage.getItem(`tice.handshake.${groupId}`);
  if (storedUserData === null || storedHandshakeData === null) {
      return null;
  }

  const user = JSON.parse(storedUserData);
  signingKey = ec.keyFromPrivate(user.keys.signingKey.priv);
  user.keys.signingKey = signingKey;

  const storedHandshake = JSON.parse(storedHandshakeData);
  const identityKeyPair = parseKeyPair(storedHandshake.identityKeyPair);
  const signedPrekeyPair = parseKeyPair(storedHandshake.signedPrekeyPair);
  const oneTimePrekeyPairs = storedHandshake.oneTimePrekeyPairs.map((keyPair) => parseKeyPair(keyPair));
  handshake = new X3DH(identityKeyPair, signedPrekeyPair, oneTimePrekeyPairs);

  return user;
}

  return { 
    allowCookies, generateUUID, generateKeys, user, group, getMembership, 
    decryptPayloadContainer, createSendMessageRequest, encryptSymmetric, decryptSymmetric, prepareGroupKey,
    migrateStorage, loadFromStorage
  }
})


