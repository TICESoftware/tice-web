<script setup lang="ts">
import { ref, h } from 'vue'
import TitleBar from './components/TitleBar.vue'
import WelcomeBox from './components/WelcomeBox.vue'
import About from './components/About.vue'
// import Chat from './components/Chat.vue'
import ShareLocationButton from './components/ShareLocationButton.vue'
import MapContainer from './components/MapContainer.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'
import { useAPIRequestStore } from '@/stores/APIRequestStore'
import { useLoggerStore } from '@/stores/LoggerStore'
import { useFlowStore } from '@/stores/FlowStore'
import { useCryptoStore } from '@/stores/CryptoStore'

const groupmembers = useGroupMemberStore()
const { t } = useI18n();
const api = useAPIRequestStore()
const log = useLoggerStore()
const flow = useFlowStore()
const crypto = useCryptoStore()

const user = ref({ userId: null })
const group = ref(null)
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
const shareLocation = ref(false)
const lastLocation = ref(null)
const sendOwnLocationTimer = ref(null)
const watchPosition = ref(undefined)
const chatMessages = ref([])

window.addEventListener('blur', () => {
  blurred();
  if (group.value === null) {
    return;
  }
  const backgroundHintShown = localStorage.getItem(`tice.backgroundHintShown.${group.value.groupId}`);
  if (shareLocation.value === true && backgroundHintShown === null) {
    showTICEInBackground();
  }
}, false);
window.addEventListener('focus', () => {
  // this.$tracking.sessionStart(navigator.language);
  refocus();
}, false);
window.addEventListener('beforeunload', () => {
  if (shareLocation.value === true && group.value !== null) {
    updateShareLocation(false);
  }
}, false);

async function locationUpdated(position) {
  if (lastLocation.value !== null && position.timestamp - lastLocation.value.timestamp < 8000) {
    lastLocation.value = position;
    return;
  }

  lastLocation.value = position;
  const location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude === null ? 0 : position.coords.altitude,
    horizontalAccuracy: position.coords.accuracy,
    verticalAccuracy: position.coords.altitudeAccuracy === null ? -1 : position.coords.altitudeAccuracy,
    timestamp: (new Date()).toISOString(),
  };
  await api.sendMessage(await crypto.createSendMessageRequest(user.value, group.value.memberships, group.value.membership.serverSignedMembershipCertificate, { payloadType: 'locationUpdate/v2', payload: { location, groupId: group.value.groupId } }, 'deferred', true));

  window.clearTimeout(sendOwnLocationTimer.value);
  sendOwnLocationTimer.value = window.setTimeout(() => {
    lastLocation.value = null;
    locationUpdated(position);
  }, 60000);
}
// async function sendChatMessage(messageText) {
  // await this.$api.sendMessage(await this.$crypto.createSendMessageRequest(this.user, this.group.memberships, this.group.membership.serverSignedMembershipCertificate, { payloadType: 'chatMessage/v1', payload: { groupId: this.group.groupId, text: messageText } }, 'alert', false));
//   pushChatMessage(messageText);
// }
// function pushChatMessage(messageText, author, datetime) {
//   chatMessages.value.push({ author: author === undefined ? 'me' : author, text: messageText, datetime: datetime === undefined ? Date.now() : datetime });
//   const lastChatMessages = this.chatMessages.slice(-75);
//   localStorage.setItem(`tice.chat.${this.group.groupId}`, JSON.stringify(lastChatMessages));
// }
function blurred() {
  // this.$tracking.sessionEnd();
  if (websocket.value) { websocket.value.close(1000); websocket.value = null; }
  window.clearTimeout(wsKeepAlive.value);
  if (watchPosition.value) { navigator.geolocation.clearWatch(watchPosition.value); watchPosition.value = null; }
  if (sendOwnLocationTimer.value) { window.clearTimeout(sendOwnLocationTimer.value); }
}
async function refocus(origin = 'refocus') {
  if (tearingDown.value) {
    window.location.reload();
  } else if (!websocket.value && group.value !== null) {
    websocket.value = 'pending...';
    const msgRequest = await api.getMessages();
    const { messages } = msgRequest;
    const promises = messages.map((message) => handleEnvelope(message));
    await Promise.all(promises);
    log.debug(`Handled ${messages.length} messages after ${origin}`);
    websocket.value = api.openWebsocket(receivedMessage);
    locations.value = { ...groupmembers.filterLocations(group.value) };
  }
  window.clearTimeout(wsKeepAlive.value);
  wsKeepAlive.value = window.setTimeout(() => {
    refocus('keepAlive');
  }, 60000);
  if (shareLocation.value === true && watchPosition.value === null) {
    setGeolocationWatch(true);
  }
}
async function teardown(data) {
  if (tearingDown.value || !group.value) { return; }
  tearingDown.value = true;
  await flow.teardown(user.value, group.value);
  if (websocket.value) { websocket.value.close(); websocket.value = null; }
  if (data !== undefined && data.reload === true) {
    window.location.reload();
  }
}
async function receivedMessage(msg) {
  try {
    const envelope = JSON.parse(msg);
    log.debug(`Received message from type ${envelope.payloadContainer.payloadType}`);
    await handleEnvelope(envelope);
  } catch (error) {
    log.error(`Error when receiving message: ${error} (Message was: ${JSON.stringify(msg)})`);
  }
}
async function handleEnvelope(envelope) {
  try {
    let container = envelope.payloadContainer;
    if (container.payloadType === 'encryptedPayloadContainer/v1') {
      container = await crypto.decryptPayloadContainer(envelope);
      if (container === 'RESET') {
        log.debug(`Resetting conversation with user ${envelope.senderId}`);
        await api.sendMessage(await crypto.createSendMessageRequest(user.value, [{ userId: envelope.senderId, serverSignedMembershipCertificate: envelope.senderServerSignedMembershipCertificate }], envelope.receiverServerSignedMembershipCertificate, { payloadType: 'resetConversation/v1', payload: {} }, 'background', envelope.collapseId !== undefined));
        return;
      }
      log.debug(`Decrypted payload to type ${container.payloadType}`);
    }

    switch (container.payloadType) {
    case 'resetConversation/v1':
      log.debug('Conversation successfully reset');
      break;
    case 'groupUpdate/v1':
      if (container.payload.groupId !== group.value.groupId) {
        log.info('Received message for another group. We ignore this here.');
        break;
      }
      /* eslint-disable no-case-declarations */
      let removedFromGroup;
      let updatedGroup = null;
      /* eslint-enable no-case-declarations */
      try {
        updatedGroup = await flow.handleGroupUpdate(user.value, group.value, container.payload);
      } catch (error) {
        if (container.payload.groupId === group.value.groupId && (`${error}`).indexOf('Certificate validation failed') > -1) {
          removedFromGroup = true;
          log.warning('User got removed from group');
          const groupScoped = container.payload.groupId === group.value.groupId ? null : group.value;
          await flow.teardown(user.value, groupScoped);
        } else {
          throw error;
        }
      }
      if (removedFromGroup || updatedGroup == null) {
        ElMessage.alert(`${removedFromGroup ? t('app.removedFromGroup') : t('app.groupDeleted')}<br>${t('app.closeWindow')}`, t('app.finished'), {
          type: 'error',
          dangerouslyUseHTMLString: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          closeOnHashChange: false,
          showConfirmButton: false,
          showClose: false,
        });
      } else {
        group.value = updatedGroup;
      }
      locations.value = { ...groupmembers.filterLocations(group.value) };
      break;
    case 'fewOneTimePrekeys/v1':
      user.value = await crypto.user(user.value).updatePrekeyBundle();
      localStorage.setItem(`tice.user.${group.value.groupId}`, JSON.stringify(user.value));
      await api.user(user.value.userId).update({ publicKeys: user.value.keys.userPublicKeys, publicName: group.value.members[user.value.userId].info.publicName });
      break;
    case 'userUpdate/v1':
      group.value.members[container.payload.userId].info = flow.addOrUpdateUserInfo(container.payload.userId);
      if (locations.value.length > 0) {
        locations.value = { ...groupmembers.updateUsername(container.payload.userId, group.value) };
      }
      break;
    case 'locationUpdate/v2':
      locations.value = { ...groupmembers.updateLocation(group.value, envelope, container) };
      break;
    case 'locationSharingUpdate/v1':
      if (container.payload.sharingEnabled === true) {
        if (Object.keys(locations.value).indexOf(envelope.senderId) === -1) {
          locations.value = { ...groupmembers.updateLocation(group.value, envelope) };
        }
      } else {
        locations.value = { ...groupmembers.deleteLocation(envelope.senderId) };
      }
      break;
    case 'chatMessage/v1':
      // pushChatMessage(container.payload.text, envelope.senderId, new Date(envelope.timestamp));
      break;
    default:
      log.warning(`Received unknown envelope: ${JSON.stringify(container)}`);
    }
  } catch (error) {
    log.error(`Error when handling envelope (${JSON.stringify(envelope)}): ${error}`);
  }
}
async function registerComplete(registeredData) {
  // this.$tracking.allowCookies();
  crypto.allowCookies();
  user.value = registeredData.user;
  group.value = registeredData.group;
  localStorage.setItem(`tice.user.${group.value.groupId}`, JSON.stringify(user));
  localStorage.setItem(`tice.membership.${group.value.groupId}`, JSON.stringify(group.value.membership));
  await refocus('successfully registered');
  updateShareLocation(registeredData.sharingLocation);
  const storedChat = localStorage.getItem(`tice.chat.${group.value.groupId}`);
  if (storedChat !== null) {
    chatMessages.value = JSON.parse(storedChat);
    log.debug(`Loaded ${chatMessages.value.length} chat messages from cookie`);
  }
}
function showInfo(location) {
  drawer.value.title = location.name;
  drawer.value.content = `${t('app.locationCoordinates')}: ${(`${location.coordinates[1]}`).substr(0, 12)}, ${(`${location.coordinates[0]}`).substr(0, 12)} ± ${Math.floor(location.hAccuracy)} m`;
  drawer.value.time = location.timestamp;
  drawer.value.visible = true;
}
function showMeetingPoint() {
  drawer.value.title = t('app.meetingPoint');
  const loc = group.value.internalSettings.meetingPoint;
  drawer.value.content = `${t('app.locationCoordinates')}: ${(`${loc.latitude}`).substr(0, 12)}, ${(`${loc.longitude}`).substr(0, 12)}`;
  drawer.value.time = loc.timestamp;
  drawer.value.visible = true;
}
async function updateUsername(newName) {
  // this.$tracking.changeName();
  group.value.members[user.value.userId].info.publicName = newName;
  group.value.members = JSON.parse(JSON.stringify(group.value.members));
  await api.sendMessage(await crypto.createSendMessageRequest(user.value, group.value.memberships, group.value.membership.serverSignedMembershipCertificate, { payloadType: 'userUpdate/v1', payload: { userId: user.value.userId } }, 'background'));
  log.trace('Updated username');
}
async function updateShareLocation(newValue) {
  let isCookieUsed = false;
  if (newValue === undefined) {
    isCookieUsed = true;
    const storedValue = localStorage.getItem(`tice.sharingLocation.${group.value.groupId}`);
    newValue = storedValue === 'true';
  }
  if (newValue === false) {
    const storedValue = localStorage.getItem(`tice.sharingLocation.${group.value.groupId}`);
    if (storedValue === null) {
      shareLocation.value = newValue;
      localStorage.setItem(`tice.sharingLocation.${group.value.groupId}`, newValue);
      return;
    }
  }
  // this.$tracking.changeLocationTracking(newValue);
  shareLocation.value = newValue;
  localStorage.setItem(`tice.sharingLocation.${group.value.groupId}`, newValue);
  setGeolocationWatch(shareLocation.value);
  if (newValue === false) {
    lastLocation.value = null;
    window.clearTimeout(sendOwnLocationTimer.value);
  }
  log.debug(`Set location sharing status to: ${shareLocation.value}`);
  if (!(newValue === false && isCookieUsed === true)) {
    await api.sendMessage(await crypto.createSendMessageRequest(user.value, group.value.memberships, group.value.membership.serverSignedMembershipCertificate, {
      payloadType: 'locationSharingUpdate/v1',
      payload: {
          groupId: group.value.groupId,
          sharingEnabled: newValue,
      },
    }, 'alert'));
  }
}
function setGeolocationWatch(newValue) {
  if (navigator.geolocation) {
    log.debug(`Set Geolocation Watcher to ${newValue}`);
    if (newValue === true) {
      watchPosition.value = navigator.geolocation.watchPosition(locationUpdated, () => {
          shareLocation.value = false;
          log.info('Location tracking not allowed');
          ElMessage.error(t('error.locationTrackingDenied'));
          // this.$tracking.locationAuthorization(false);
      });
      if (watchPosition.value) {
          // this.$tracking.locationAuthorization(true);
      }
    } else if (watchPosition.value) {
        navigator.geolocation.clearWatch(watchPosition.value);
    }
  }
}
function showAbout() {
    // this.$tracking.screen('About');
    ElMessageBox({
        title: t('about.title'),
        message: h(About),
        closeOnClickModal: true,
        closeOnPressEscape: true,
        closeOnHashChange: false,
        showConfirmButton: false,
        showClose: true,
    }).catch(() => {});
}
function showTICEInBackground() {
  log.trace('TICE was in background');
  ElMessage.alert(t('background.text'), t('background.title'), {
    showClose: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    showConfirmButton: true,
    confirmButtonText: t('background.close'),
  }).catch(() => {});
  localStorage.setItem(`tice.backgroundHintShown.${group.value.groupId}`, 'true');
}
</script>

<template>
  <!-- <div id="#app"> -->
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
    <MapContainer
      v-if="group !== null"
      :group="group"
      :locations="locations"
      :ownLocation="lastLocation === null ? null : lastLocation.coords"
      @show-info="showInfo"
      @show-meeting-point="showMeetingPoint"
      :initialLoading="group == null"
    />
    <Suspense>
      <WelcomeBox
        @register-complete="registerComplete"
        :reset="tearingDown"
      />
    </Suspense>
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
  <!-- </div> -->
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
