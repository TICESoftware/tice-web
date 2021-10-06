<template>
    <el-dialog
      :visible="dialogVisible"
      :show-close="false" :before-close="()=>{}">
        <div class="dialog-title">
            <span v-if="initialLoading" style="color:rgba(255,255,255,0)">Loading...</span>
            <template v-else>{{ title }}</template>
            <img src="/tice_logo_hstack.png" @click="showAbout" alt="TICE" style="height:2em;float:right;cursor:pointer;">
        </div>
        <div v-loading="initialLoading" v-if="initialLoading" style="height:100px;"></div>
        <group-info v-if="group != null && !reset && typeof group != 'string'" :group="group"/>
        <p v-if="initialLoading === false && group !== 'notFound' && group !== 'error'">
            <el-form ref="public-name" :model="publicNameForm" :hide-required-asterisk="true" @submit.native.prevent>
                <el-form-item :label="$t('titleBar.settings.publicName')" :rules="[ { required: true, message: $t('welcome.name.required') } ]" prop="publicName">
                    <el-input v-model="publicNameForm.publicName"/>
                </el-form-item>
                <el-switch v-model="sharingLocation" style="margin-right:1em;"></el-switch> {{ $t("welcome.switch.shareLocation") }}
                <el-button type="primary" native-type="submit" @click="start" :loading="buttonLoading">
                    <template v-if="group == null || typeof group == 'string'">{{ $t("welcome.button.reload") }}</template>
                    <template v-else>{{ $t("welcome.button.join") }}</template>
                </el-button><br><br>
            </el-form>
            <template v-if="group !== null && typeof group !== 'string'">
                <small>{{ $t("welcome.cookies") }} <a href="https://ticeapp.com/datenschutz" target="_blank">{{ $t("welcome.privacyNotice") }}</a></small>
            </template>
        </p>
        <template v-if="webViewOniOS && group !== 'notFound' && group !== 'error'">
            <p>
                <el-button type="default" @click="openDeepLink">
                    {{ $t("welcome.openInApp") }}
                </el-button>
            </p><p>
                <a href="https://apps.apple.com/de/app/tice-secure-location-sharing/id1494324936"><img src="/app-store-download.png" style="width:60%;"></a>
            </p>
        </template>
    </el-dialog>
</template>

<script>
import About from './About.vue';
import { setLanguage } from '../utils/i18n';

export default {
    name: 'WelcomeBox',
    props: ['reset'],
    data() {
        return {
            refl_dialogVisible: true,
            buttonLoading: false,
            group: null,
            user: null,
            title: null,
            publicNameForm: { publicName: '' },
            sharingLocation: true,
        };
    },
    computed: {
        groupMemberNames() {
            if (this.group == null) { return []; }
            return Object.keys(this.group.members).map((id) => this.$groupmembers.getUsername(this.group, id));
        },
        initialLoading() {
            return this.reset === true || this.group === null;
        },
        dialogVisible() {
            return this.reset === true || this.refl_dialogVisible === true;
        },
        webViewOniOS() {
            const ua = window.navigator.userAgent.toLowerCase();
            return /iphone|ipod|ipad/.test(ua);
        },
    },
    async created() {
        await setLanguage(new Intl.Locale(navigator.language).language);

        if (window.location.pathname.length < 5) {
            window.location.href = 'https://ticeapp.com';
            return;
        }
        const locsplit = window.location.pathname.split('/');
        if (locsplit.length < 3 || locsplit[1] !== 'group' || window.location.hash.length < 10) {
            this.title = this.$t('welcome.incorrectURL');
            this.group = 'notFound';
            return;
        }
        this.$tracking.screen('WelcomeBox', localStorage.getItem('tice.beekeeper.installday') === null ? 'NOCOOKIE' : 'WITHCOOKIE');
        try {
            this.$log.debug('Opened WebApp');
            const groupId = locsplit[2];
            const groupKey = await this.$crypto.prepareGroupKey(window.location.hash.substr(1));

            this.$log.trace('Migrate old cookies');
            await this.$crypto.migrateStorage(groupId);

            this.user = await this.$crypto.loadFromStorage(groupId);
            if (this.user !== null) {
                this.$log.info('Found user data in cookie');
                this.$api.setAuthHeader(this.user);
            } else {
                this.$log.info('Creating new user');
                this.user = await this.$flow.createUser();
            }

            const group = await this.$flow.prepareGroup(this.user, groupId, groupKey);
            if (group.settings.name === undefined) {
                const ownerName = this.$groupmembers.getUsername(group, group.settings.owner);
                if (['x', 's', 'z'].indexOf(ownerName.slice(-1)) > -1) {
                    group.settings.name = this.$t('welcome.groupName.s', { ownerName });
                } else {
                    group.settings.name = this.$t('welcome.groupName', { ownerName });
                }
            }

            if (this.user.userId in group.members) {
                this.buttonLoading = true;
                this.$tracking.loadFromStorage();
                this.$emit('register-complete', { user: this.user, group });
                this.refl_dialogVisible = false;
            } else {
                this.title = group.settings.name;
                this.group = group;
            }
        } catch (error) {
            if ((`${error}`).indexOf('Group not found') > -1) {
                this.$log.warning(`Group not found: ${window.location.href}`);
                this.title = this.$t('welcome.groupDoesNotExist');
                this.group = 'notFound';
            } else if ((`${error}`).indexOf('groupMemberLimitExceeded') > -1) {
                this.$log.warning('The group has exceeded the maximum member limit');
                this.title = this.$t('welcome.groupMemberLimitExceeded');
                this.group = 'error';
            } else if ((`${error}`).indexOf('User Authentication failed') > -1) {
                this.$log.warning('User authentication failed - probably user from cookie was deleted');
                localStorage.clear();
                window.location.reload();
            } else {
                this.$log.error(`Error on WB-created: ${error}`);
                this.$message({
                    type: 'error',
                    message: this.$t('welcome.errorOccured') + error,
                    showClose: true,
                    duration: 0,
                });
                this.title = this.$t('welcome.error');
                this.group = 'error';
            }
        } finally {
            this.buttonLoading = false;
        }
    },
    methods: {
        openDeepLink() {
            window.open(window.location.href.replace('https://', 'tice://'));
        },
        async start() {
            this.buttonLoading = true;
            if (this.group == null || typeof this.group === 'string') {
                window.location.reload();
                return;
            }

            try {
                await this.$refs['public-name'].validate().catch((result) => { if (!result) { throw Error('name-is-required'); } });
                const { publicName } = this.publicNameForm;
                await this.$api.user(this.user.userId).update({ publicName });
                this.group = await this.$flow.addUserToGroup(this.user, this.group);
                this.group.members[this.user.userId].info.publicName = publicName;

                this.$tracking.registerComplete();
                this.$emit('register-complete', { user: this.user, group: this.group, sharingLocation: this.sharingLocation });
                this.refl_dialogVisible = false;
            } catch (error) {
                if (`${error}` === 'Error: invalidGroupTag:') {
                    this.$message.info(this.$t('welcome.groupChanged'));
                    const { groupId } = this.group;
                    const { groupKey } = this.group;
                    this.group = null;
                    this.group = await this.$flow.prepareGroup(this.user, groupId, groupKey);
                } else if (`${error}` === 'Error: name-is-required') {
                    this.$message.error(this.$t('welcome.name.required'));
                } else {
                    this.$message.error(`${error}`);
                    this.$log.error(`Error on WB-start: ${error}`);
                }
            } finally {
                this.buttonLoading = false;
            }
        },
        showAbout() {
            this.$msgbox({
                title: this.$t('about.title'),
                message: this.$createElement(About),
                closeOnClickModal: true,
                closeOnPressEscape: true,
                closeOnHashChange: false,
                showConfirmButton: false,
                showClose: true,
            }).catch(() => {});
        },
    },
};
</script>

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
