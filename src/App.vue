<script setup lang="ts">
import { ref } from 'vue'
import TitleBar from './components/TitleBar.vue'
import WelcomeBox from './components/WelcomeBox.vue'
// import About from './components/About.vue'
// import Chat from './components/Chat.vue'
import ShareLocationButton from './components/ShareLocationButton.vue'
// import map
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const user = ref({ userId: null })
// const group = ref(null)
const group = ref('Testgruppe') // exchange with line before
const tearingDown = ref(false)
const websocket = ref(null)
const wsKeepAlive = ref(null)
const drawer = ref({
  visible: false,
  title: '',
  content: '',
  time: ''
})
const locations = ref([])
const locationSharingUsers = ref([])
const shareLocation = ref(true)
const lastLocation = ref(null)
const sendOwnLocationTimer = ref(null)
const watchPosition = ref(undefined)
const chatMessages = ref([])

window.addEventListener('blur', () => {
  // this.blurred();
  // if (this.group === null) {
  //     return;
  // }
  // const backgroundHintShown = localStorage.getItem(`tice.backgroundHintShown.${this.group.groupId}`);
  // if (this.shareLocation === true && backgroundHintShown === null) {
  //     this.showTICEInBackground();
  // }
}, false);
window.addEventListener('focus', () => {
  // this.$tracking.sessionStart(navigator.language);
  // this.refocus();
}, false);
window.addEventListener('beforeunload', () => {
  // if (this.shareLocation === true && this.group !== null) {
  //     this.updateShareLocation(false);
  // }
}, false);

async function locationUpdated(position) {
  // if (this.lastLocation !== null && position.timestamp - this.lastLocation.timestamp < 8000) {
  //     this.lastLocation = position;
  //     return;
  // }

  // this.lastLocation = position;
  // const location = {
  //     latitude: position.coords.latitude,
  //     longitude: position.coords.longitude,
  //     altitude: position.coords.altitude === null ? 0 : position.coords.altitude,
  //     horizontalAccuracy: position.coords.accuracy,
  //     verticalAccuracy: position.coords.altitudeAccuracy === null ? -1 : position.coords.altitudeAccuracy,
  //     timestamp: (new Date()).toISOString(),
  // };
  // await this.$api.sendMessage(await this.$crypto.createSendMessageRequest(this.user, this.group.memberships, this.group.membership.serverSignedMembershipCertificate, { payloadType: 'locationUpdate/v2', payload: { location, groupId: this.group.groupId } }, 'deferred', true));

  // window.clearTimeout(this.sendOwnLocationTimer);
  // this.sendOwnLocationTimer = window.setTimeout(() => {
  //     this.lastLocation = null;
  //     this.locationUpdated(position);
  // }, 60000);
}
async function sendChatMessage(messageText) {
  // await this.$api.sendMessage(await this.$crypto.createSendMessageRequest(this.user, this.group.memberships, this.group.membership.serverSignedMembershipCertificate, { payloadType: 'chatMessage/v1', payload: { groupId: this.group.groupId, text: messageText } }, 'alert', false));
  // this.pushChatMessage(messageText);
}
function pushChatMessage(messageText, author, datetime) {
  // this.chatMessages.push({ author: author === undefined ? 'me' : author, text: messageText, datetime: datetime === undefined ? Date.now() : datetime });
  // const lastChatMessages = this.chatMessages.slice(-75);
  // localStorage.setItem(`tice.chat.${this.group.groupId}`, JSON.stringify(lastChatMessages));
}
function blurred() {
  // this.$tracking.sessionEnd();
  // if (this.websocket) { this.websocket.close(1000); this.websocket = null; }
  // window.clearTimeout(this.wsKeepAlive);
  // if (this.watchPosition) { navigator.geolocation.clearWatch(this.watchPosition); this.watchPosition = null; }
  // if (this.sendOwnLocationTimer) { window.clearTimeout(this.sendOwnLocationTimer); }
}
async function refocus(origin = 'refocus') {
  // if (this.tearingDown) {
  //     window.location.reload();
  // } else if (!this.websocket && this.group !== null) {
  //     this.websocket = 'pending...';
  //     const msgRequest = await this.$api.getMessages();
  //     const { messages } = msgRequest;
  //     const promises = messages.map((message) => this.handleEnvelope(message));
  //     await Promise.all(promises);
  //     this.$log.debug(`Handled ${messages.length} messages after ${origin}`);
  //     this.websocket = this.$api.openWebsocket(this.receivedMessage);
  //     this.locations = { ...this.$groupmembers.filterLocations(this.group) };
  // }
  // window.clearTimeout(this.wsKeepAlive);
  // this.wsKeepAlive = window.setTimeout(() => {
  //     this.refocus('keepAlive');
  // }, 60000);
  // if (this.shareLocation === true && this.watchPosition === null) {
  //     this.setGeolocationWatch(true);
  // }
}
async function teardown(data) {
  // if (this.tearingDown || !this.group) { return; }
  // this.tearingDown = true;
  // await this.$flow.teardown(this.user, this.group);
  // if (this.websocket) { this.websocket.close(); this.websocket = null; }
  // if (data !== undefined && data.reload === true) {
  //     window.location.reload();
  // }
}
async function receivedMessage(msg) {
  // try {
  //     const envelope = JSON.parse(msg);
  //     this.$log.debug(`Received message from type ${envelope.payloadContainer.payloadType}`);
  //     await this.handleEnvelope(envelope);
  // } catch (error) {
  //     this.$log.error(`Error when receiving message: ${error} (Message was: ${JSON.stringify(msg)})`);
  // }
}
async function handleEnvelope(envelope) {
  // try {
  //     let container = envelope.payloadContainer;
  //     if (container.payloadType === 'encryptedPayloadContainer/v1') {
  //         container = await this.$crypto.decryptPayloadContainer(envelope);
  //         if (container === 'RESET') {
  //             this.$log.debug(`Resetting conversation with user ${envelope.senderId}`);
  //             await this.$api.sendMessage(await this.$crypto.createSendMessageRequest(this.user, [{ userId: envelope.senderId, serverSignedMembershipCertificate: envelope.senderServerSignedMembershipCertificate }], envelope.receiverServerSignedMembershipCertificate, { payloadType: 'resetConversation/v1', payload: {} }, 'background', envelope.collapseId !== undefined));
  //             return;
  //         }
  //         this.$log.debug(`Decrypted payload to type ${container.payloadType}`);
  //     }

  //     switch (container.payloadType) {
  //     case 'resetConversation/v1':
  //         this.$log.debug('Conversation successfully reset');
  //         break;
  //     case 'groupUpdate/v1':
  //         if (container.payload.groupId !== this.group.groupId) {
  //             this.$log.info('Received message for another group. We ignore this here.');
  //             break;
  //         }
  //         /* eslint-disable no-case-declarations */
  //         let removedFromGroup;
  //         let updatedGroup = null;
  //         /* eslint-enable no-case-declarations */
  //         try {
  //             updatedGroup = await this.$flow.handleGroupUpdate(this.user, this.group, container.payload);
  //         } catch (error) {
  //             if (container.payload.groupId === this.group.groupId && (`${error}`).indexOf('Certificate validation failed') > -1) {
  //                 removedFromGroup = true;
  //                 this.$log.warning('User got removed from group');
  //                 const group = container.payload.groupId === this.group.groupId ? null : this.group;
  //                 await this.$flow.teardown(this.user, group);
  //             } else {
  //                 throw error;
  //             }
  //         }
  //         if (removedFromGroup || updatedGroup == null) {
  //             this.$alert(`${removedFromGroup ? this.$t('app.removedFromGroup') : this.$t('app.groupDeleted')}<br>${this.$t('app.closeWindow')}`, this.$t('app.finished'), {
  //                 type: 'error',
  //                 dangerouslyUseHTMLString: true,
  //                 closeOnClickModal: false,
  //                 closeOnPressEscape: false,
  //                 closeOnHashChange: false,
  //                 showConfirmButton: false,
  //                 showClose: false,
  //             });
  //         } else {
  //             this.group = updatedGroup;
  //         }
  //         this.locations = { ...this.$groupmembers.filterLocations(this.group) };
  //         break;
  //     case 'fewOneTimePrekeys/v1':
  //         this.user = await this.$crypto.user(this.user).updatePrekeyBundle();
  //         localStorage.setItem(`tice.user.${this.group.groupId}`, JSON.stringify(this.user));
  //         await this.$api.user(this.user.userId).update({ publicKeys: this.user.keys.userPublicKeys, publicName: this.group.members[this.user.userId].info.publicName });
  //         break;
  //     case 'userUpdate/v1':
  //         this.group.members[container.payload.userId].info = this.$flow.addOrUpdateUserInfo(container.payload.userId);
  //         if (this.locations.length > 0) {
  //             this.locations = { ...this.$groupmembers.updateUsername(container.payload.userId, this.group) };
  //         }
  //         break;
  //     case 'locationUpdate/v2':
  //         this.locations = { ...this.$groupmembers.updateLocation(this.group, envelope, container) };
  //         break;
  //     case 'locationSharingUpdate/v1':
  //         if (container.payload.sharingEnabled === true) {
  //             if (Object.keys(this.locations).indexOf(envelope.senderId) === -1) {
  //                 this.locations = { ...this.$groupmembers.updateLocation(this.group, envelope) };
  //             }
  //         } else {
  //             this.locations = { ...this.$groupmembers.deleteLocation(envelope.senderId) };
  //         }
  //         break;
  //     case 'chatMessage/v1':
  //         this.pushChatMessage(container.payload.text, envelope.senderId, new Date(envelope.timestamp));
  //         break;
  //     default:
  //         this.$log.warning(`Received unknown envelope: ${JSON.stringify(container)}`);
  //     }
  // } catch (error) {
  //     this.$log.error(`Error when handling envelope (${JSON.stringify(envelope)}): ${error}`);
  // }
}
async function registerComplete(registeredData) {
  // this.$tracking.allowCookies();
  // this.$crypto.allowCookies();
  // this.user = registeredData.user;
  // this.group = registeredData.group;
  // localStorage.setItem(`tice.user.${this.group.groupId}`, JSON.stringify(this.user));
  // localStorage.setItem(`tice.membership.${this.group.groupId}`, JSON.stringify(this.group.membership));
  // await this.refocus('successfully registered');
  // this.updateShareLocation(registeredData.sharingLocation);
  // const storedChat = localStorage.getItem(`tice.chat.${this.group.groupId}`);
  // if (storedChat !== null) {
  //     this.chatMessages = JSON.parse(storedChat);
  //     this.$log.debug(`Loaded ${this.chatMessages.length} chat messages from cookie`);
  // }
}
function showInfo(location) {
  drawer.value.title = location.name;
  drawer.value.content = `${t('app.locationCoordinates')}: ${(`${location.coordinates[1]}`).substr(0, 12)}, ${(`${location.coordinates[0]}`).substr(0, 12)} ± ${Math.floor(location.hAccuracy)} m`;
  drawer.value.time = location.timestamp;
  drawer.value.visible = true;
}
function showMeetingPoint() {
  // drawer.value.title = t('app.meetingPoint');
  // const loc = group.value.internalSettings.meetingPoint;
  // drawer.value.content = `${t('app.locationCoordinates')}: ${(`${loc.latitude}`).substr(0, 12)}, ${(`${loc.longitude}`).substr(0, 12)}`;
  // drawer.value.time = loc.timestamp;
  // drawer.value.visible = true;
}
async function updateUsername(newName) { // copied
  // this.$tracking.changeName();
  // this.group.members[this.user.userId].info.publicName = newName;
  // this.group.members = JSON.parse(JSON.stringify(this.group.members));
  // await this.$api.sendMessage(await this.$crypto.createSendMessageRequest(this.user, this.group.memberships, this.group.membership.serverSignedMembershipCertificate, { payloadType: 'userUpdate/v1', payload: { userId: this.user.userId } }, 'background'));
  // this.$log.trace('Updated username');
}
async function updateShareLocation(newValue) { // copied
  // let isCookieUsed = false;
  // if (newValue === undefined) {
  //     isCookieUsed = true;
  //     const storedValue = localStorage.getItem(`tice.sharingLocation.${this.group.groupId}`);
  //     newValue = storedValue === 'true';
  // }
  // if (newValue === false) {
  //     const storedValue = localStorage.getItem(`tice.sharingLocation.${this.group.groupId}`);
  //     if (storedValue === null) {
  //         this.shareLocation = newValue;
  //         localStorage.setItem(`tice.sharingLocation.${this.group.groupId}`, newValue);
  //         return;
  //     }
  // }
  // this.$tracking.changeLocationTracking(newValue);
  // this.shareLocation = newValue;
  // localStorage.setItem(`tice.sharingLocation.${this.group.groupId}`, newValue);
  // this.setGeolocationWatch(this.shareLocation);
  // if (newValue === false) {
  //     this.lastLocation = null;
  //     window.clearTimeout(this.sendOwnLocationTimer);
  // }
  // this.$log.debug(`Set location sharing status to: ${this.shareLocation}`);
  // if (!(newValue === false && isCookieUsed === true)) {
  //     await this.$api.sendMessage(await this.$crypto.createSendMessageRequest(this.user, this.group.memberships, this.group.membership.serverSignedMembershipCertificate, {
  //         payloadType: 'locationSharingUpdate/v1',
  //         payload: {
  //             groupId: this.group.groupId,
  //             sharingEnabled: newValue,
  //         },
  //     }, 'alert'));
  // }
}
function setGeolocationWatch(newValue) {
  // if (navigator.geolocation) {
  //     this.$log.debug(`Set Geolocation Watcher to ${newValue}`);
  //     if (newValue === true) {
  //         this.watchPosition = navigator.geolocation.watchPosition(this.locationUpdated, () => {
  //             this.shareLocation = false;
  //             this.$log.info('Location tracking not allowed');
  //             this.$message.error(this.$t('error.locationTrackingDenied'));
  //             this.$tracking.locationAuthorization(false);
  //         });
  //         if (this.watchPosition) {
  //             this.$tracking.locationAuthorization(true);
  //         }
  //     } else if (this.watchPosition) {
  //         navigator.geolocation.clearWatch(this.watchPosition);
  //     }
  // }
}
function showAbout() { // copied
    // this.$tracking.screen('About');
    // this.$msgbox({
    //     title: this.$t('about.title'),
    //     message: this.$createElement(About),
    //     closeOnClickModal: true,
    //     closeOnPressEscape: true,
    //     closeOnHashChange: false,
    //     showConfirmButton: false,
    //     showClose: true,
    // }).catch(() => {});
}
function showTICEInBackground() {
  // this.$log.trace('TICE was in background');
  // this.$alert(this.$t('background.text'), this.$t('background.title'), {
  //     showClose: true,
  //     closeOnClickModal: true,
  //     closeOnPressEscape: true,
  //     showConfirmButton: true,
  //     confirmButtonText: this.$t('background.close'),
  // }).catch(() => {});
  // localStorage.setItem(`tice.backgroundHintShown.${this.group.groupId}`, 'true');
}
</script>

<template>
  <div id="#app">
    <TitleBar
      :user="user"
      :group="group"
      :shareLocation="shareLocation"
      :locationSharingUsers="Object.keys(locations)"
      :initialLoading="group == null"
      @update-username="updateUsername"
      @update-share-location="updateShareLocation"
      @teardown="teardown"
    />
    <!-- <Map /> -->
    <!-- <WelcomeBox
      @register-complete="registerComplete"
      :reset="tearingDown"
    /> -->
    <div id="bottomleftlogo" @click="showAbout">
      <img src="/tice_logo_hstack.png" alt="TICE">
    </div>
    <el-drawer
      :title="drawer.title"
      v-model="drawer.visible"
      direction="btt" size="7.8em" :modal="false">
      <span v-html="drawer.content" /><br>
      <timeago :datetime="drawer.time" :autoUpdate="10" :converterOptions="{ includeSeconds: true }" />
    </el-drawer>
    <!-- <Chat 
      v-if="group !== null"
      :chatMessages="chatMessages"
      :group="group"
      @send-chat-message="sendChatMessage"
    /> -->
    <ShareLocationButton
      v-if="group !== null"
      :shareLocation="shareLocation"
      :locationSharingUsers="Object.keys(locations)"
      :group="group"
      @update-share-location="updateShareLocation"
    />
  </div>
</template>

<style>
html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    padding: 0;
}
#app {
    display: flex;
    flex-flow: column;
}
#app:before {
    content: ' ';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.4;
    background-image: url('../public/mapbg.jpg');
    background-repeat: no-repeat;
    background-position: 50% 0;
    -ms-background-size: cover;
    -o-background-size: cover;
    -moz-background-size: cover;
    -webkit-background-size: cover;
    background-size: cover;
}
#bottomleftlogo {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 85px;
    margin-left: 7px;
    margin-bottom: 28px;
    cursor: pointer;
}
#bottomleftlogo > img {
    width: 65px;
    margin: auto;
    background-color: rgba(255,255,255,0.3);
    border-radius: 5px;
    padding:5px 10px;
}
.el-drawer {
    text-align: left;
}
.el-drawer__header {
    margin: 0 !important;
    padding: 1.5em 1.5em 0 1.5em!important;
}
.el-drawer__header > span {
    font-weight: bold;
    font-size: 1.3em;
}
.el-drawer__body {
    padding: 0.5em 1.5em 1.5em 1.5em;
    color: #999;
}
.el-message-box {max-width:400px;}
@media (max-width:720px) {
    .el-message-box {
        width: 90% !important;
    }
}
.el-message-box__title {
    font-weight: bold;
}
.el-message-box__content {
    padding: 10px 20px !important;
}
.el-message-box__header {
    padding: 20px 20px 10px 20px !important;
}
</style>
