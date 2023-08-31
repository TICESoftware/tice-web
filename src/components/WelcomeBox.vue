<script setup lang="ts">
import { ref, computed, h } from 'vue'
import GroupInfo from './GroupInfo.vue'
import About from './About.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useLoggerStore } from '@/stores/LoggerStore'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'
import { useFlowStore } from '@/stores/FlowStore'
import { useAPIRequestStore } from '@/stores/APIRequestStore'
import { useCryptoStore } from '@/stores/CryptoStore'
// import { setLanguage } from '../utils/i18n'

const { t } = useI18n();
const groupmembers = useGroupMemberStore()
const log = useLoggerStore()
const flow = useFlowStore()
const api = useAPIRequestStore()
const crypto = useCryptoStore()

const props = defineProps(['reset'])
const emit = defineEmits(['register-complete'])

const refl_dialogVisible = ref(true)
const buttonLoading = ref(false)
const group = ref(null)
const user = ref(null)
const title = ref(null)
const publicNameForm = ref({ publicName: '' })
const sharingLocation = ref(true)

const groupMemberNames = computed(() => {
  if (group.value == null) { return []; }
  return Object.keys(group.value.members).map((id)=> groupmembers.getUsername(group.value, id))
})
const initialLoading = computed(() => {
  return props.reset === true || group.value === null
})
const dialogVisible = computed(() => {
  return props.reset === true || refl_dialogVisible.value === true
})
const webViewOniOS = computed(() => {
  const ua = window.navigator.userAgent.toLowerCase()
  return /iphone|ipod|ipad/.test(ua)
})

//   await setLanguage(new Intl.Locale(navigator.language).language);

if (window.location.pathname.length < 5) {
    window.location.href = 'https://ticeapp.com'
}
const locsplit = window.location.pathname.split('/');
if (locsplit.length < 3 || locsplit[1] !== 'group' || window.location.hash.length < 10) {
  title.value = t('welcome.incorrectURL')
  group.value = 'notFound';
}

if (group.value !== 'notFound') {
  //     this.$tracking.screen('WelcomeBox', localStorage.getItem('tice.beekeeper.installday') === null ? 'NOCOOKIE' : 'WITHCOOKIE');
  try {
    log.debug('Opened WebApp')
    const groupId = locsplit[2]
    const groupKey = await crypto.prepareGroupKey(window.location.hash.substr(1));

    log.trace('Migrate old cookies')
    await crypto.migrateStorage(groupId);

    // user.value = await crypto.loadFromStorage(groupId);
    if (user.value !== null) {
      log.info('Found user data in cookie')
        api.setAuthHeader(user.value);
    } else {
      log.info('Creating new user')
      user.value = await flow.createUser()
    }

    const groupScoped = await flow.prepareGroup(user.value, groupId, groupKey);
    if (groupScoped.settings.name === undefined) {
      const ownerName = groupmembers.getUsername(groupScoped, groupScoped.settings.owner);
      if (['x', 's', 'z'].indexOf(ownerName.slice(-1)) > -1) {
        groupScoped.settings.name = t('welcome.groupName.s', { ownerName });
      } else {
          groupScoped.settings.name = t('welcome.groupName', { ownerName });
      }
    }

    if (user.value.userId in groupScoped.members) {
      buttonLoading.value = true;
      // this.$tracking.loadFromStorage();
      emit('register-complete', { user: user.value, group: groupScoped });
      refl_dialogVisible.value = false;
    } else {
        title.value = groupScoped.settings.name;
        group.value = groupScoped;
    }
  } catch (error) {
    if ((`${error}`).indexOf('Group not found') > -1) {
      log.warning(`Group not found: ${window.location.href}`)
      title.value = t('welcome.groupDoesNotExist')
      group.value = 'notFound'
    } else if ((`${error}`).indexOf('groupMemberLimitExceeded') > -1) {
      log.warning('The group has exceeded the maximum member limit')
      title.value = t('welcome.groupMemberLimitExceeded')
      group.value = 'error'
    } else if ((`${error}`).indexOf('User Authentication failed') > -1) {
      log.warning('User authentication failed - probably user from cookie was deleted')
      localStorage.clear()
      window.location.reload()
    } else {
      log.error(`Error on WB-created: ${error}`)
      ElMessage({
          type: 'error',
          message: t('welcome.errorOccured') + error,
          showClose: true,
          duration: 0,
      });
      title.value = t('welcome.error');
      group.value = 'error';
    }
  } finally {
    buttonLoading.value = false;
  }
}

function openDeepLink() {
  window.open(window.location.href.replace('https://', 'tice://'));
}
async function start() {
  buttonLoading.value = true;
  if (group.value == null || typeof group.value === 'string') {
    window.location.reload();
    return;
  }

  try {
    // await this.$refs['public-name'].validate().catch((result) => { if (!result) { throw Error('name-is-required'); } });
    const { publicName } = publicNameForm.value
    await api.user(user.value.userId).update({ publicName });
    group.value = await flow.addUserToGroup(user.value, group.value);
    group.value.members[user.value.userId].info.publicName = publicName;

    // this.$tracking.registerComplete();
    emit('register-complete', { user: user.value, group: group.value, sharingLocation: sharingLocation.value });
    refl_dialogVisible.value = false;
  } catch (error) {
    if (`${error}` === 'Error: invalidGroupTag:') {
      ElMessage.info(t('welcome.groupChanged'));
      const { groupId } = group.value;
      const { groupKey } = group.value;
      group.value = null;
      group.value = await flow.prepareGroup(user.value, groupId, groupKey);
    } else if (`${error}` === 'Error: name-is-required') {
      ElMessage.error(t('welcome.name.required'));
    } else {
      ElMessage.error(`${error}`);
      log.error(`Error on WB-start: ${error}`);
    }
  } finally {
    buttonLoading.value = false;
  }
}
function showAbout() {
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

const groupInfoConditional = computed(() => {
  return group.value !== null && !props.reset && typeof group.value !== 'string'
})
const formConditional = computed(() => {
  return initialLoading.value === false && group.value !== 'notFound' && group.value !== 'error'
})
const footerConditional = computed(() => {
  return group.value !== null && typeof group.value !== 'string'
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    :before-close="()=>{}"
  >
    <div class="dialog-title">
      <span v-if="initialLoading" style="color:rgba(255,255,255,0)">Loading...</span>
      <template v-else>{{ title }}</template>
      <img src="/tice_logo_hstack.png" @click="showAbout" alt="TICE" style="height:2em;float:right;cursor:pointer;">
    </div>
    <div v-loading="initialLoading" v-if="initialLoading" style="height:100px;"></div>
    <GroupInfo
      v-if="groupInfoConditional"
      :group="group" 
    />
    <p v-if="formConditional">
      <el-form ref="public-name" :model="publicNameForm" :hide-required-asterisk="true" @submit.prevent>
        <el-form-item :label="t('titleBar.settings.publicName')" :rules="[ { required: true, message: t('welcome.name.required') } ]" prop="publicName">
          <el-input v-model="publicNameForm.publicName"/>
        </el-form-item>
        <el-switch v-model="sharingLocation" style="margin-right:1em;"></el-switch> {{ t("welcome.switch.shareLocation") }}
        <el-button type="primary" native-type="submit" @click="start" :loading="buttonLoading">
          <template v-if="group == null || typeof group == 'string'">{{ t("welcome.button.reload") }}</template>
          <template v-else>{{ t("welcome.button.join") }}</template>
        </el-button><br><br>
      </el-form>
      <template v-if="footerConditional" >
        <small>
          {{ t("welcome.cookies") }} 
          <a href='https://ticeapp.com/datenschutz' target='_blank'>
            {{ t("welcome.privacyNotice") }}
          </a>
        </small>
      </template>
    </p>
    <template v-if="webViewOniOS && group !== 'notFound' && group !== 'error'">
      <p>
        <el-button type="default" @click="openDeepLink">
          {{ t("welcome.openInApp") }}
        </el-button>
      </p>
      <p>
        <a href="https://apps.apple.com/de/app/tice-secure-location-sharing/id1494324936"><img src="/app-store-download.png" style="width:60%;"></a>
      </p>
    </template>
  </el-dialog>
</template>

<style scoped>
.text-left {
  text-align: left;
}
.groupinfo-title {
  font-size: 11px;
  text-transform: capitalize;
  color:#999;
}
.groupinfo-body {
  font-weight: bold;
}
.groupinfo-body > span {
  width:50%;
}
.el-button {
  width: 100% !important;
  margin-top:1em;
}
</style>

<style>
div.el-dialog__body {
  padding-bottom: calc(20px - 1em) !important;
  padding-top: 0 !important;
  word-break: normal;
  hyphens: auto;
}
.dialog-title {
  padding: 20px 0;
  line-height: 2em;
  font-size: 18px;
  color: #303133;
  font-weight: bold;
  text-align: left;
}
.el-dialog__header{display:none;}
.el-dialog {max-width:400px;}
@media (max-width:720px) {
  .el-dialog {
      width: 90% !important;
  }
}
.el-popup-parent--hidden {
  overflow: auto !important;
}
</style>
