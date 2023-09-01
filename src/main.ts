import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './utils/i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { Buffer } from 'buffer'
import timeago from 'vue-timeago3'

globalThis.Buffer = Buffer

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(i18n)
app.use(ElementPlus)
app.use(timeago)
app.mount('#app')

// old main.js file ->
// import {
//     Collapse, CollapseItem, Row, Col, Switch, Dialog, Button, Message, MessageBox, Drawer, Loading, Input, FormItem, Form,
// } from 'element-ui';
// Vue.use(Collapse);
// Vue.use(CollapseItem);
// Vue.use(Row);
// Vue.use(Col);
// Vue.use(Switch);
// Vue.use(Dialog);
// Vue.use(Button);
// Vue.use(Drawer);
// Vue.use(Loading);
// Vue.use(Input);
// Vue.use(FormItem);
// Vue.use(Form);
// Vue.prototype.$msgbox = MessageBox;
// Vue.prototype.$alert = MessageBox.alert;
// Vue.prototype.$message = Message;

// import Chat from 'vue-beautiful-chat';
// Vue.use(Chat);

// import beekeeper from './utils/Beekeeper';
// Vue.prototype.$tracking = beekeeper;
// beekeeper.sessionStart(navigator.language);
// beekeeper.pageView();

// Vue.config.productionTip = false;