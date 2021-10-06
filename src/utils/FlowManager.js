import api from '@/utils/APIRequestManager';
import crypto from '@/utils/CryptoManager';
import Logger from '@/utils/Logger';

const userlist = {};

async function updateInternals(group) {
    group.internals = await api.groupInternal(group.groupId, '', group.membership.serverSignedMembershipCertificate).getInternals();
    group.groupTag = group.internals.groupTag;
    return group;
}
async function updateSettings(group) {
    group = await updateInternals(group);
    group.internalSettings = await crypto.group(group.groupKey).decryptAndParse(group.internals.encryptedInternalSettings);
    group.settings = await crypto.group(group.groupKey).decryptAndParse(group.internals.encryptedSettings);
    return group;
}
async function fetchGroup(user, groupId) {
    let group = {};
    group.groupId = groupId;
    // Get public group information
    group.info = await api.group(group.groupId, '').getInfo();
    delete group.info.groupId;
    group.groupTag = group.info.groupTag;
    delete group.info.groupTag;

    // Get internal group information
    group.membership = await crypto.membership(user, group);
    group = await updateInternals(group);
    return group;
}
async function decryptGroup(group) {
    group.internalSettings = await crypto.group(group.groupKey).decryptAndParse(group.internals.encryptedInternalSettings);
    const membershipPromises = group.internals.encryptedMemberships.map(crypto.group(group.groupKey).decryptAndParse);
    group.memberships = await Promise.all(membershipPromises);
    group.settings = await crypto.group(group.groupKey).decryptAndParse(group.info.encryptedSettings);
    delete group.info.encryptedSettings;
    return group;
}
async function addOrUpdateUserInfo(userId) {
    if (!(userId in userlist)) {
        userlist[userId] = { info: undefined, memberships: undefined };
    }
    try {
        userlist[userId].info = await api.user(userId).getInfo();
    } catch (error) {
        userlist[userId].info = { userId };
    }
    return userlist[userId].info;
}
async function fetchGroupMembers(group) {
    const memberPromises = group.memberships.map(async (membership) => {
        const { userId } = membership;
        if (userId in userlist && userlist[userId].memberships === undefined) {
            await (new Promise((resolve) => setTimeout(resolve, 2000)));
        }
        if (!(userId in userlist) || userlist[userId].memberships === undefined) {
            userlist[userId] = {};
            await addOrUpdateUserInfo(userId);
            const memberships = {};
            memberships[membership.groupId] = membership;
            userlist[userId].memberships = memberships;
        } else {
            userlist[userId].memberships[membership.groupId] = membership;
        }
        return userlist[userId];
    });
    const membersArr = await Promise.all(memberPromises);
    return membersArr.reduce((result, member) => {
        result[member.info.userId] = member;
        return result;
    }, {});
}
async function fetchChildren(user, group) {
    const childGroupPromises = group.internals.children.map(async (childId) => {
        let childGroup = await fetchGroup(user, childId);
        childGroup.groupKey = await crypto.group(group.groupKey).decrypt(childGroup.internals.parentEncryptedGroupKey, 'base64');
        childGroup = await decryptGroup(childGroup);
        childGroup.members = await fetchGroupMembers(childGroup);
        return childGroup;
    });
    return Promise.all(childGroupPromises);
}
async function addUserToGroup(user, group) {
    const notificationRecipients = group.memberships.map((membership) => ({ userId: membership.userId, serverSignedMembershipCertificate: membership.serverSignedMembershipCertificate }));
    const encryptedMembership = await crypto.group(group.groupKey).encrypt(group.membership);
    const tokenKey = await crypto.group(group.groupKey).generateTokenKey(user.keys.publicSigningKey);
    const addGroupMemberRequest = await api.groupInternal(group.groupId, group.groupTag, group.membership.serverSignedMembershipCertificate).addMember({
        encryptedMembership, userId: user.userId, newTokenKey: tokenKey, notificationRecipients,
    });
    group.groupTag = addGroupMemberRequest.groupTag;
    group.members[user.userId] = { info: user };
    return group;
}

export default {
    async createUser() {
        const user = {};
        user.keys = await crypto.generateKeys();

        const createUser = await api.createUser({
            publicKeys: user.keys.userPublicKeys,
        });
        user.userId = createUser.userId;
        api.setAuthHeader(user);
        return user;
    },
    async prepareGroup(user, groupId, groupKey) {
        let group = await fetchGroup(user, groupId);
        group.groupKey = await groupKey;
        group = await decryptGroup(group);
        group.members = await fetchGroupMembers(group);
        group.children = await fetchChildren(user, group);
        return group;
    },
    addUserToGroup,
    addOrUpdateUserInfo,
    async teardown(user, group) {
        if (user.userId != null) {
            const groups = [];
            if (group != null) {
                const tokenKey = await crypto.group(group.groupKey).generateTokenKey(user.keys.publicSigningKey);
                const notificationRecipients = group.memberships.map((membership) => ({ userId: membership.userId, serverSignedMembershipCertificate: membership.serverSignedMembershipCertificate }));
                groups.push({
                    groupId: group.groupId,
                    serverSignedMembershipCertificate: group.membership.serverSignedMembershipCertificate,
                    tokenKey,
                    notificationRecipients,
                    groupTag: group.groupTag,
                });
            }
            const data = { userId: user.userId, authHeader: await crypto.user(user).authHeader(), groups };
            navigator.sendBeacon(`${api.httpBaseURL}/user/${user.userId}/teardown`, JSON.stringify(data));
            localStorage.clear();
        }
    },
    async handleGroupUpdate(user, group, payload) {
        if (payload.groupId !== group.groupId) {
            Logger.info('Got group update for unknown group. Ignoring.');
            return null;
        }

        switch (payload.action) {
        case 'groupDeleted':
            group = null;
            break;
        case 'settingsUpdated':
            group = await updateSettings(group);
            break;
        case 'memberAdded':
        case 'memberUpdated':
        case 'memberDeleted':
            group = await updateInternals(group);
            group.memberships = await Promise.all(group.internals.encryptedMemberships.map(crypto.group(group.groupKey).decryptAndParse));
            group.members = await fetchGroupMembers(group);
            break;
        default:
            Logger.warning(`Unknown group update type: ${payload.action}`);
        }

        return group;
    },
};
