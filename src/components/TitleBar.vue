<script setup lang="ts">
import { computed } from 'vue'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'
import { ElMessageBox } from 'element-plus'

const groupmembers = useGroupMemberStore()

const props = defineProps(['user', 'group', 'initialLoading', 'shareLocation', 'locationSharingUsers'])
const emit= defineEmits(['teardown', 'update-username'])

const username = computed(() => {
  // if (props.user.userId == null || props.group == null) {
  //     return '';
  // }
  // return $groupmembers.getUsername(props.group, props.user.userId);
  return 'Test Person' // exchange with lines before
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
    // return props.group.settings.name
    return props.group // exchange with line before
})

function showGroupInfo() {
  // this.$tracking.screen('GroupInfo');
  // $msgbox({
      // message: this.$createElement('group-info', {
      //     props: {
      //         group: this.group, userId: this.user.userId, locationSharingUsers: this.locationSharingUsers, shareLocation: this.shareLocation,
      //     },
      // }),
  //     title: groupname.value,
  //     closeOnClickModal: true,
  //     closeOnPressEscape: true,
  //     closeOnHashChange: false,
  //     showConfirmButton: false,
  //     showClose: true,
  // }).catch(() => {});
}

function showUserSettings() {
  // this.$tracking.screen('UserSettings');
  // const h = this.$createElement;
  // this.$msgbox({
  //     message: h('div', [
  //         h('div', { style: { marginBottom: '1em' } }, [
  //             h('el-button', {
  //                 props: { type: 'text' },
  //                 on: {
  //                     click: () => {
  //                         emit('teardown', { reload: true });
  //                     },
  //                 },
  //             }, this.$t('titleBar.settings.deleteData')),
  //         ]),
  //         h('div', this.$t('titleBar.settings.publicName')),
  //     ]),
  //     title: this.$t('titleBar.settings.title'),
  //     showInput: true,
  //     inputPlaceholder: this.$groupmembers.getUsername(this.group, this.user.userId),
  //     closeOnClickModal: true,
  //     closeOnPressEscape: true,
  //     closeOnHashChange: false,
  //     showConfirmButton: false,
  //     showClose: true,
  //     beforeClose: (action, instance, done) => {
  //         const newName = instance.$refs.input.value;
  //         const oldName = this.$groupmembers.getUsername(this.group, this.user.userId);
  //         if (instance.loading === true || newName === null || newName === oldName) {
  //             done();
  //         } else {
  //             instance.loading = true;
  //             const loading = this.$loading({ target: instance.$el.childNodes[0] });
  //             this.$api.user(this.user.userId).update({ publicName: newName })
  //                 .then(() => {
  //                     emit('update-username', newName);
  //                     done();
  //                 }).catch((error) => {
  //                     this.$message.error(`${error}`);
  //                     this.$log.error(`Couldn't update user: ${error}`);
  //                 })
  //                 .finally(() => {
  //                     loading.close();
  //                     instance.loading = false;
  //                 });
  //         }
  //     },
  // }).catch(() => {});
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
