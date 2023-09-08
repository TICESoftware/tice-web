<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'

const { t } = useI18n()
const groupmembers = useGroupMemberStore()

const props = defineProps(['shareLocation', 'locationSharingUsers', 'group'])
const emit = defineEmits(['update-share-location'])

const shareLocationText = computed(() => {
  return (
    props.shareLocation
    ? t('shareLocationButton.shareLocationText.sharing')
    : t('shareLocationButton.shareLocationText.notSharing'))
})
const shareLocationSubText = computed(() => {
  if (props.shareLocation === true) {
    return t('shareLocationButton.shareLocationSubtext.stopSharing');
  }
  if (props.locationSharingUsers.length === 0) {
    return '';
  }
  if (props.locationSharingUsers.length === 1) {
    const userName = groupmembers.getUsername(props.group, props.locationSharingUsers[0]);
    return t('shareLocationButton.shareLocationSubtext.oneSharing', { userName });
  }
  return t('shareLocationButton.shareLocationSubtext.moreSharing');
})

function updateShareLocationStatus() {
  emit('update-share-location', !props.shareLocation);
}
</script>

<template>
  <div id="shareLocationButtonContainer">
    <el-button
      id="shareLocationButton"
      :style="`height: ${shareLocationSubText != '' ? 59 : 44}px`"
      round
      v-on:click="updateShareLocationStatus"
    >
      <div>
        <div id="shareLocationText">{{ shareLocationText }}</div>
        <div id="shareLocationSubText">{{ shareLocationSubText }}</div>
      </div>
    </el-button>
  </div>
</template>

<style scoped>
#shareLocationButtonContainer {
  position: absolute;
  width: 100%;
  text-align: center;
  top: 6rem;
}
#shareLocationButton {
  border-radius: 30px;
  padding-left: 5%;
  padding-right: 5%;
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: #0675bb;
  margin-left: auto;
  margin-right: auto;
  border: 0;
  box-shadow: 1px 1px 4px 0 rgba(152, 155, 147, 0.50);
}
#shareLocationText {
  font-size: 20px;
  color: white;
}
#shareLocationSubText {
  font-size: 15px;
  color: rgba(255,255,255,0.9);
}
</style>
