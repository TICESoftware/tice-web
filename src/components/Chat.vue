<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGroupMemberStore } from '@/stores/GroupMemberStore'
import { timeagoLocale } from '../utils/i18n.js'

const { t } = useI18n()
const groupmembers = useGroupMemberStore()

const props = defineProps(['chatMessages', 'group'])
const emit = defineEmits(['send-chat-message'])

const readMessagesCount = ref(null)
const isChatOpen = ref(false)
const colors = ref({
  header: {
    bg: '#0675bb',
    text: '#ffffff',
  },
  launcher: {
    bg: '#0675bb',
  },
  messageList: {
    bg: '#ffffff',
  },
  sentMessage: {
    bg: '#0675bb',
    text: '#ffffff',
  },
  receivedMessage: {
    bg: '#eaeaea',
    text: '#222222',
  },
  userInput: {
    bg: '#f4f7f9',
    text: '#565867',
  },
})

const participants = computed(() => {
  return Object.keys(props.group.members).map((memberId) => {
    const name = groupmembers.getUsername(props.group, memberId);
    return {
      id: memberId,
      name,
      color: groupmembers.getColor(memberId),
      initials: groupmembers.getInitials(name),
    };
  });
})
const messageList = computed(() => {
  return props.chatMessages.map((msg) => ({ type: 'text', author: msg.author, data: { text: msg.text, meta: msg.datetime } }));
})
const newMessagesCount = computed(() => {
  if (readMessagesCount.value === null) {
    return 0;
  }
  return messageList.value.length - readMessagesCount.value;
})

function onMessageWasSent(message) {
  emit('send-chat-message', message.data.text);
  readMessagesCount.value = readMessagesCount.value === null ? 1 : readMessagesCount.value + 1;
}
function openChat() {
  isChatOpen.value = true;
  readMessagesCount.value = messageList.value.length;
}
function closeChat() {
  isChatOpen.value = false;
}
</script>

<template>
  <div id="chat">
    <beautiful-chat
      :participants="participants"
      :messageList="messageList"
      :newMessagesCount="newMessagesCount"
      :isOpen="isChatOpen"
      :colors="colors"
      :title="t('chat.title')"
      :placeholder="t('chat.placeholder')"

      :close="closeChat"
      :open="openChat"
      :onMessageWasSent="onMessageWasSent"

      :alwaysScrollToBottom="true"
      :disableUserListToggle="true">

      <template v-slot:user-avatar="{ user }">
        <span class="avatar" :style="{ 'background-color': user.color }">{{ user.initials }}</span>
      </template>
      <template v-slot:text-message-body="{ message }">
        <p class="sc-message--text-content" v-html="message.data.text"></p>
        <timeago :locale="timeagoLocale" :datetime="message.data.meta" :autoUpdate="10" :converterOptions="{ includeSeconds: true }" class="sc-message--meta"/>
      </template>
    </beautiful-chat>
  </div>
</template>

<style>
  #chat { text-align: left; }
  .sc-chat-window { z-index: 30; }
  .sc-open-icon { padding: 14px !important; }
  .sc-message--text-content { margin: 0.2em 0; }
  .sc-message--meta { color: inherit !important; }
</style>
