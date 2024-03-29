<template>
    <div id="chat">
        <beautiful-chat
            :participants="participants"
            :messageList="messageList"
            :newMessagesCount="newMessagesCount"
            :isOpen="isChatOpen"
            :colors="colors"
            :title="$t('chat.title')"
            :placeholder="$t('chat.placeholder')"

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
                <timeago :datetime="message.data.meta" :autoUpdate="10" :converterOptions="{ includeSeconds: true }" class="sc-message--meta"/>
            </template>
        </beautiful-chat>
    </div>
</template>

<script>
export default {
    props: ['chatMessages', 'group'],
    computed: {
        participants() {
            return Object.keys(this.group.members).map((memberId) => {
                const name = this.$groupmembers.getUsername(this.group, memberId);
                return {
                    id: memberId,
                    name,
                    color: this.$groupmembers.getColor(memberId),
                    initials: this.$groupmembers.getInitials(name),
                };
            });
        },
        messageList() {
            return this.chatMessages.map((msg) => ({ type: 'text', author: msg.author, data: { text: msg.text, meta: msg.datetime } }));
        },
        newMessagesCount() {
            if (this.readMessagesCount === null) {
                return 0;
            }
            return this.messageList.length - this.readMessagesCount;
        },
    },
    data() {
        return {
            readMessagesCount: null,
            isChatOpen: false,
            colors: {
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
            },
        };
    },
    methods: {
        onMessageWasSent(message) {
            this.$emit('send-chat-message', message.data.text);
            this.readMessagesCount = this.readMessagesCount === null ? 1 : this.readMessagesCount + 1;
        },
        openChat() {
            this.isChatOpen = true;
            this.readMessagesCount = this.messageList.length;
        },
        closeChat() {
            this.isChatOpen = false;
        },
    },
};
</script>

<style>
    #chat { text-align: left; }
    .sc-chat-window { z-index: 30; }
    .sc-open-icon { padding: 14px !important; }
    .sc-message--text-content { margin: 0.2em 0; }
    .sc-message--meta { color: inherit !important; }
</style>
