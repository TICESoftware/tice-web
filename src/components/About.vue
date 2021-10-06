<template>
    <div>
        {{ $tt("about.madeby") }}<br>
        <a href="https://tice.software" target="_blank">TICE Software UG (haftungsbeschränkt)</a><br><br>
        {{ $tt("about.version") }} {{ this.appVersion }}
        <p style="width:100%;text-align:center;margin:2em 0;">
            <a href="https://ticeapp.com/impressum/" target="_blank"><el-button size="medium" plain type="primary">Impressum</el-button></a><br><br>
            <el-button size="medium" plain type="warning" @click="sendFeedback">{{ $tt("about.sendFeedback") }}</el-button>
        </p>

        <el-collapse value="1" :accordion="true">
            <el-collapse-item :title="$tt('about.moreInformation')" name="1">
                <div class="so-me-icons">
                    <a href="https://ticeapp.com" target="_blank"><el-button size="mini" plain>ticeapp.com</el-button></a><br>
                    <a class="so-me-icon" href="https://www.instagram.com/ticeapp" target="_blank"><font-awesome-icon size="lg" :icon="['fab', 'instagram']" /></a>
                    <a class="so-me-icon" href="https://www.facebook.com/ticeapp" target="_blank"><font-awesome-icon size="lg" :icon="['fab', 'facebook-square']" /></a>
                    <a class="so-me-icon" href="https://twitter.com/ticeapp" target="_blank"><font-awesome-icon size="lg" :icon="['fab', 'twitter']" /></a>
                </div>
            </el-collapse-item>
            <el-collapse-item :title="$tt('about.acknowledgements')">
                <div v-for="(type, key) in acknowledgements" :key="key">
                    {{ $tt("about.licenseHeading", { licenseName: type.name }) }} <br><br>
                    <div v-for="(library, key) in type.libraries" :key="key" style="margin-bottom: 1em;">
                        <strong>{{ library.name }}</strong><br>
                        <div v-html="library.copyright" />
                    </div>
                    <strong>{{ $tt("about.permissionNotice", { licenseName: type.name }) }}</strong>
                    <div v-html="type.licenseText" />
                    <br><hr><br>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInstagram, faFacebookSquare, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { i18n } from '../utils/i18n';
import { getLogs } from '../utils/Logger';

library.add(faInstagram, faFacebookSquare, faTwitter);

export default {
    name: 'About',
    components: {
        FontAwesomeIcon,
    },
    computed: {
        appVersion() {
            return process.env.VUE_APP_VERSION;
        },
        acknowledgements() {
            return [
                {
                    name: 'MIT',
                    licenseText: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:<br><br>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.<br><br> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
                    libraries: [
                        { name: 'Vue.js', copyright: 'Copyright (c) 2013-present, Yuxi (Evan) You' },
                        { name: 'UI Toolkit Element', copyright: 'Copyright (c) 2016-present ElemeFE' },
                        { name: 'axios', copyright: 'Copyright (c) 2014-present Matt Zabriskie' },
                        { name: 'core-js', copyright: 'Copyright (c) 2014-2019 Denis Pushkarev' },
                        { name: 'VueMapbox', copyright: 'Copyright (c) 2017 soal' },
                        { name: 'vue-fontawesome', copyright: 'Copyright 2018 Fonticons, Inc.' },
                        { name: 'elliptic', copyright: 'Copyright Fedor Indutny, 2014.' },
                        { name: 'Key Encoder JS', copyright: 'Copyright (c) 2015 Halfmoon Labs, Inc.' },
                        { name: 'vue-i18n', copyright: 'Copyright (c) 2016 kazuya kawaguchi' },
                        { name: 'vue-timeago', copyright: 'Copyright (c) EGOIST <0x142857@gmail.com> (github.com/egoist)' },
                        { name: 'vue-beautiful-chat', copyright: 'Copyright (c) 2018 Matteo Merola' },
                        // {'name': '', 'copyright': ''},
                    ],
                },
                {
                    name: 'Mapbox',
                    licenseText: 'All rights reserved.<br><br>Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:<br><br>    * Redistributions of source code must retain the above copyright notice,       this list of conditions and the following disclaimer.     * Redistributions in binary form must reproduce the above copyright notice,       this list of conditions and the following disclaimer in the documentation       and/or other materials provided with the distribution.     * Neither the name of Mapbox GL JS nor the names of its contributors       may be used to endorse or promote products derived from this software       without specific prior written permission.<br><br>THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.<br><br>-------------------------------------------------------------------------------<br><br>Contains Hershey Simplex Font: http://paulbourke.net/dataformats/hershey/<br><br>-------------------------------------------------------------------------------<br><br>Contains code from glfx.js<br><br>Copyright (C) 2011 by Evan Wallace<br><br>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:<br><br>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.<br><br>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.<br><br>--------------------------------------------------------------------------------<br><br>Contains a portion of d3-color https://github.com/d3/d3-color<br><br>Copyright 2010-2016 Mike Bostock<br><br>ll rights reserved.<br><br>Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:<br><br>* Redistributions of source code must retain the above copyright notice, this   list of conditions and the following disclaimer.<br><br>* Redistributions in binary form must reproduce the above copyright notice,   this list of conditions and the following disclaimer in the documentation   and/or other materials provided with the distribution.<br><br>* Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior   written permission.<br><br>THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.',
                    libraries: [
                        { name: 'Mapbox GL JS', copyright: 'Copyright (c) 2016, Mapbox' },
                    ],
                },
                {
                    name: 'BSD-3',
                    licenseText: 'All rights reserved.<br> <br>Redistribution and use in source and binary forms, with or without<br>modification, are permitted provided that the following conditions are met:<br> <br> * Redistributions of source code must retain the above copyright notice, this<br>list of conditions and the following disclaimer.<br> * Redistributions in binary form must reproduce the above copyright notice,<br>this list of conditions and the following disclaimer in the documentation<br>and/or other materials provided with the distribution.<br> * Neither the name of the the copyright holder nor the names of its<br>contributors may be used to endorse or promote products derived from this<br>software without specific prior written permission.<br> <br>THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"<br>AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE<br>IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE<br>DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR<br>ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES<br>(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;<br>LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON<br>ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT<br>(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS<br>SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.',
                    libraries: [
                        { name: 'jsSHA', copyright: 'Copyright (c) 2008-2018 Brian Turek, 1998-2009 Paul Johnston & Contributors' }, // BSD-3
                    ],
                },
                {
                    name: 'ISC',
                    licenseText: 'Permission to use, copy, modify, and/or distribute this software for any<br>purpose with or without fee is hereby granted, provided that the above<br>copyright notice and this permission notice appear in all copies.<br> <br>THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES<br>WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF<br>MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR<br>ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES<br>WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN<br>ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF<br>OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.',
                    libraries: [
                        { name: 'libsodium.js', copyright: 'Copyright (c) 2015-2018<br>Ahmad Ben Mrad <batikhsouri at gmail dot org><br>Frank Denis <j at pureftpd dot org><br>Ryan Lester <ryan at cyph dot com>' },
                    ],
                },
            ];
        },
    },
    methods: {
        sendFeedback() {
            let body = '';
            body += '\n\n\n\n----------------------------------\n\n';
            body += `TICE-Version: ${process.env.VUE_APP_VERSION}\n`;
            const loc = window.location.href;
            body += `TICE-Environment: ${loc.substring(loc.indexOf('//') + 2, loc.indexOf('/', 10))}\n`;
            body += window.navigator.userAgent;

            /* eslint-disable-next-line no-alert */
            if (window.confirm(this.$tt('about.appendLogsToFeedback'))) {
                body += `\n\n${getLogs()}`;
            }
            window.open(`mailto:feedback@ticeapp.com?subject=TICE: Feedback WebApp&body=${encodeURIComponent(body)}`);
        },
        $tt: i18n.t.bind(i18n),
    },
};
</script>

<style>
.el-collapse-item__header {
    color: inherit !important;
    font-weight: inherit !important;
}
.so-me-icons > a {
    margin: .8rem .5rem 0 .5rem;
    color: #606266;
    font-size: larger;
    display: inline-block;
}
a.so-me-icon:hover {
    color: #2980b9;
}
.so-me-icons {
    text-align: center;
}
.el-message-box {
    max-height: 100%;
    overflow: scroll !important;
}
</style>
