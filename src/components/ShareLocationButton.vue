<template>
    <div id="shareLocationButtonContainer">
      <el-button id="shareLocationButton" round v-on:click="updateShareLocationStatus">
          <div id="shareLocationText">{{ shareLocationText }}</div>
          <div id="shareLocationSubText">{{ shareLocationSubText }}</div>
      </el-button>
    </div>
</template>

<script>
export default {
    props: ['shareLocation', 'locationSharingUsers', 'group'],
    computed: {
        shareLocationText() {
            return (this.shareLocation ? this.$t('shareLocationButton.shareLocationText.sharing') : this.$t('shareLocationButton.shareLocationText.notSharing'));
        },
        shareLocationSubText() {
            if (this.shareLocation === true) {
                return this.$t('shareLocationButton.shareLocationSubtext.stopSharing');
            }
            if (this.locationSharingUsers.length === 0) {
                return '';
            }
            if (this.locationSharingUsers.length === 1) {
                const userName = this.$groupmembers.getUsername(this.group, this.locationSharingUsers[0]);
                return this.$t('shareLocationButton.shareLocationSubtext.oneSharing', { userName });
            }
            return this.$t('shareLocationButton.shareLocationSubtext.moreSharing');
        },
    },
    methods: {
        updateShareLocationStatus() {
            this.$emit('update-share-location', !this.shareLocation);
        },
    },
};
</script>

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
