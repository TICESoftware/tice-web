<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'

const { t } = useI18n()
const groupmembers = useGroupMemberStore()

const props = defineProps(['userId', 'group', 'locationSharingUsers', 'shareLocation'])

const groupMemberNames = computed(() => {
  if (props.group == null) { return []; }
  return Object.keys(props.group.members).map((id) => {
    const username = groupmembers.getUsername(props.group, id);
    const thisIsYou = id === props.userId ? ` (${t('groupInfo.you')})` : '';
    const meAndSharingLocation = id === props.userId ? props.shareLocation : false;
    const otherSharingLocation = props.locationSharingUsers !== undefined && props.locationSharingUsers.indexOf(id) > -1;
    const memberSharingLocation = meAndSharingLocation || otherSharingLocation;
    return { name: username + thisIsYou, sharingLocation: memberSharingLocation };
  });
})
</script>

<template>
  <div>
    <!-- <el-row>
      <el-col :span="12" style="text-align:left;">
        <div class="grid-content">
          <div class="groupinfo-title">{{ t("groupinfo.permissionMode") }}</div>
          <div class="groupinfo-body" v-if="props.group != null">{{ t("groupinfo.permissionMode." + props.group.info.permissionMode) }}</div>
        </div>
      </el-col>
      <el-col :span="12" style="text-align:right;">
        <div class="grid-content">
          <div class="groupinfo-title">{{ t("groupinfo.joinMode") }}</div>
          <div class="groupinfo-body" v-if="props.group != null">{{ t("groupinfo.joinMode." + props.group.info.joinMode) }}</div>
        </div>
      </el-col>
    </el-row> -->
    <div class="groupinfo-title" style="text-align:left;"><!-- margin-top:2em; -->
        {{ t("groupInfo.members") }} ({{ groupMemberNames.length }})
    </div>
    <div class="groupinfo-body">
      <el-row>
        <el-col :span="12" v-for="(member, key) in groupMemberNames" :key="key" style="text-align:left;">
          <span :style="{ fontWeight: member.sharingLocation ? 'bold' : 'normal'}">{{ member.name }}</span>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.groupinfo-title {
  font-size: 11px;
  text-transform: uppercase;
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
