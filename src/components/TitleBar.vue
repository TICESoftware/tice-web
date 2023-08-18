<script setup lang="ts">
import { computed, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'
import { useAPIRequestStore } from '@/stores/APIRequestStore'
import { useLoggerStore } from '@/stores/LoggerStore'

const { t } = useI18n();
const groupmembers = useGroupMemberStore()
const api = useAPIRequestStore()
const log = useLoggerStore()

const props = defineProps(['user', 'group', 'initialLoading', 'shareLocation', 'locationSharingUsers'])
const emit= defineEmits(['teardown', 'update-username'])

const username = computed(() => {
  if (props.user.userId == null || props.group == null) {
    return '';
  }
  return groupmembers.getUsername(props.group, props.user.userId);
})
const usercolor = computed(() => {
  if (props.user.userId == null) {
    return '#ccc';
  }
  return groupmembers.getColor(props.user.userId);
})
const initials = computed(() => {
  if (username.value === '') {
    return '';
  }
  return groupmembers.getInitials(username.value);
})
const groupname = computed(() => {
  if (props.group == null) {
    return '';
  }
  return props.group.settings.name
})

function showGroupInfo() {
  // this.$tracking.screen('GroupInfo');
  ElMessageBox({
    message: h('group-info', {
      props: {
        group: props.group, userId: props.user.userId, locationSharingUsers: props.locationSharingUsers, shareLocation: props.shareLocation,
      },
    }),
    title: groupname.value,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    closeOnHashChange: false,
    showConfirmButton: false,
    showClose: true,
  }).catch(() => {});
}

function showUserSettings() {
  // this.$tracking.screen('UserSettings');
  ElMessageBox({
    message: h('div', [
      h('div', { style: { marginBottom: '1em' } }, [
        h('el-button', {
          props: { type: 'text' },
          on: {
            click: () => {
              emit('teardown', { reload: true });
            },
          },
        }, t('titleBar.settings.deleteData')),
      ]),
      h('div', t('titleBar.settings.publicName')),
    ]),
    title: t('titleBar.settings.title'),
    showInput: true,
    inputPlaceholder: groupmembers.getUsername(props.group, props.user.userId),
    closeOnClickModal: true,
    closeOnPressEscape: true,
    closeOnHashChange: false,
    showConfirmButton: false,
    showClose: true,
    // beforeClose: (action, instance, done) => {
    //   const newName = instance.$refs.input.value;
    //   const oldName = groupmembers.getUsername(props.group, props.user.userId);
    //   if (instance.loading === true || newName === null || newName === oldName) {
    //     done();
    //   } else {
    //     instance.loading = true;
    //     const loading = this.$loading({ target: instance.$el.childNodes[0] });
    //     api.user(props.user.userId).update({ publicName: newName })
    //       .then(() => {
    //         emit('update-username', newName);
    //         done();
    //       }).catch((error) => {
    //         ElMessage.error(`${error}`);
    //         log.error(`Couldn't update user: ${error}`);
    //       })
    //       .finally(() => {
    //         loading.close();
    //         instance.loading = false;
    //       });
    //   }
    // },
  }).catch(() => {});
}
</script>

<template>
  <div id="titlebar" :class="{ 'hide': initialLoading }">
    <div>
      <span role="link" class="groupname" @click="showGroupInfo">{{ groupname }}</span>
      <span role="link" class="username" @click="showUserSettings">
        <span class="avatar" :style="{ 'background-color': usercolor, 'margin': '0 1em' }">{{ initials }}</span>
        {{ username }}
      </span>
    </div>
  </div>
</template>

<style>
#titlebar {
  background-color: #fff;
  position: relative;
  width: 100%;
  flex: 0 1 auto;
}
#titlebar > div {
  padding: 1.5em 0.5em 1.5em 2em;
  text-align: left;
  line-height: 32px;
  font-weight: bold;
}
#titlebar > div > .groupname {
  font-size: 1.5em;
}
#titlebar > div > .username {
  float: right;
}
.hide {
  display: none;
}
.username {
  padding-left: 1rem;
  padding-bottom: 1rem;
}
.avatar {
  display: block;
  float: right;
  border-radius: 50%;
  border: 3px solid white;
  height: 30px;
  width: 30px;
  text-align: center;
  font-weight: bold;
  line-height: 30px;
  font-size: 15px;
  color: #fff;
}
.el-message-box__input {
  padding-top: 5px !important;
}
span[role="link"] {
  cursor: pointer;
}
.notSharingInfoText {
  margin-left: 20px;
  font-weight: normal;
  font-size: smaller;
  display: inline-block;
}
</style>
