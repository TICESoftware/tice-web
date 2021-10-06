<template>
    <div>
        <!--<el-row>
            <el-col :span="12" style="text-align:left;"><div class="grid-content">
                <div class="groupinfo-title">{{ $tt("groupinfo.permissionMode") }}</div>
                <div class="groupinfo-body" v-if="group != null">{{ $tt("groupinfo.permissionMode." + group.info.permissionMode) }}</div>
            </div></el-col>
            <el-col :span="12" style="text-align:right;"><div class="grid-content">
                <div class="groupinfo-title">{{ $tt("groupinfo.joinMode") }}</div>
                <div class="groupinfo-body" v-if="group != null">{{ $tt("groupinfo.joinMode." + group.info.joinMode) }}</div>
            </div></el-col>
        </el-row>-->
        <div class="groupinfo-title" style="text-align:left;"><!-- margin-top:2em; -->
            {{ $tt("groupInfo.members") }} ({{ groupMemberNames.length }})
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

<script>
import { i18n } from '@/utils/i18n';

export default {
    name: 'group-info',
    props: ['userId', 'group', 'locationSharingUsers', 'shareLocation'],
    computed: {
        groupMemberNames() {
            if (this.group == null) { return []; }
            return Object.keys(this.group.members).map((id) => {
                const username = this.$groupmembers.getUsername(this.group, id);
                const thisIsYou = id === this.userId ? ` (${this.$tt('groupInfo.you')})` : '';
                const meAndSharingLocation = id === this.userId ? this.shareLocation : false;
                const otherSharingLocation = this.locationSharingUsers !== undefined && this.locationSharingUsers.indexOf(id) > -1;
                const memberSharingLocation = meAndSharingLocation || otherSharingLocation;
                return { name: username + thisIsYou, sharingLocation: memberSharingLocation };
            });
        },
    },
    methods: {
        $tt: i18n.t.bind(i18n),
    },
};
</script>

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
