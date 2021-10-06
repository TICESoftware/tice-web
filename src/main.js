/* eslint-disable import/first, import/newline-after-import */
import Vue from 'vue';
import App from '@/App.vue';

import { i18n } from '@/utils/i18n';

import 'element-ui/lib/theme-chalk/index.css';
import {
    Collapse, CollapseItem, Row, Col, Switch, Dialog, Button, Message, MessageBox, Drawer, Loading, Input, FormItem, Form,
} from 'element-ui';
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Row);
Vue.use(Col);
Vue.use(Switch);
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Drawer);
Vue.use(Loading);
Vue.use(Input);
Vue.use(FormItem);
Vue.use(Form);
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$message = Message;

import Chat from 'vue-beautiful-chat';
Vue.use(Chat);

import VueTimeago from 'vue-timeago';
import dateFnsDE from 'date-fns/locale/de';
Vue.use(VueTimeago, { locale: 'de', autoUpdate: true, locales: { de: dateFnsDE } });

import GroupInfo from '@/components/GroupInfo.vue';
Vue.component('group-info', GroupInfo);

import api from '@/utils/APIRequestManager';
Vue.prototype.$api = api;

import beekeeper from '@/utils/Beekeeper';
Vue.prototype.$tracking = beekeeper;
beekeeper.sessionStart(navigator.language);
beekeeper.pageView();

import crypto from '@/utils/CryptoManager';
Vue.prototype.$crypto = crypto;

import flow from '@/utils/FlowManager';
Vue.prototype.$flow = flow;

import groupmembers from '@/utils/GroupMemberManager';
Vue.prototype.$groupmembers = groupmembers;

import Logger from '@/utils/Logger';
Vue.prototype.$log = Logger;

Vue.config.productionTip = false;
new Vue({
    render: (h) => h(App),
    i18n,
}).$mount('#app');
