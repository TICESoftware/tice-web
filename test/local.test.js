const {
    describe, beforeEach, afterEach, it,
} = require('mocha');
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const http = require('http');

const {
    testLoadGroup, testChangeName, testShareLocation, testMe, testSendMessage, testReceiveMessage, testCnCNameChange, testDeleteData, testCookies,
    testNoUsernameAtLogin, testMoreInformation, testFeedbackAtLogin, testAboutTICESoftware, testAboutImpressum, testAboutTICEApp, testAboutInstagram,
    testAboutFacebook, testAboutTwitter,
} = require('./test');

const httpAgent = new http.Agent({ keepAlive: true });

describe('Local', () => {
    let localDriver;

    beforeEach(() => {
        localDriver = new Builder()
            .usingHttpAgent(httpAgent)
            .forBrowser('firefox')
            .setFirefoxOptions(new firefox.Options().setPreference('general.useragent.override', 'Test'))
            .build();
    });
    afterEach(async () => { await localDriver.quit(); });

    it('should join group', async () => {
        await testLoadGroup(localDriver);
    }).timeout(60000);
    it('should change name', async () => {
        await testChangeName(localDriver);
    }).timeout(60000);
    it('should share location', async () => {
        await testShareLocation(localDriver);
    }).timeout(60000);
    it('should know me', async () => {
        await testMe(localDriver);
    }).timeout(60000);
    it('should send message', async () => {
        await testSendMessage(localDriver);
    }).timeout(60000);
    it.skip('should receive message', async () => {
        await testReceiveMessage(localDriver);
    }).timeout(60000);
    it.skip('should receive changed name', async () => {
        await testCnCNameChange(localDriver);
    }).timeout(60000);
    it('should delete data', async () => {
        await testDeleteData(localDriver);
    }).timeout(60000);
    it('should load Cookies', async () => {
        await testCookies(localDriver);
    }).timeout(60000);
    it('should throw error if username is empty', async () => {
        await testNoUsernameAtLogin(localDriver);
    }).timeout(60000);
    it('should show more information page', async () => {
        await testMoreInformation(localDriver);
    }).timeout(60000);
    it('should forward to feedback popup', async () => {
        await testFeedbackAtLogin(localDriver);
    }).timeout(60000);
    it('should open TICE software page', async () => {
        await testAboutTICESoftware(localDriver);
    }).timeout(60000);
    it('should open Impressum page', async () => {
        await testAboutImpressum(localDriver);
    }).timeout(60000);
    it('should open TICE App page', async () => {
        await testAboutTICEApp(localDriver);
    }).timeout(60000);
    it('should open TICE Instagram page', async () => {
        await testAboutInstagram(localDriver);
    }).timeout(60000);
    it('should open TICE Facebook page', async () => {
        await testAboutFacebook(localDriver);
    }).timeout(60000);
    it('should open TICE Twitter page', async () => {
        await testAboutTwitter(localDriver);
    }).timeout(60000);
});
