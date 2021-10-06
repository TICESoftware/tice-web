const { describe, beforeEach, it } = require('mocha');
const { Builder } = require('selenium-webdriver');
const http = require('http');
const gitRevision = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString().trim();
const {
    testLoadGroup, testChangeName, testShareLocation, testMe, testAboutImpressum, testAboutTwitter, testAboutFacebook, testAboutInstagram, testAboutTICEApp,
    testAboutTICESoftware, testFeedbackAtLogin, testNoUsernameAtLogin, testMoreInformation, testCookies, testDeleteData, testCnCNameChange, testReceiveMessage,
    testSendMessage,
} = require('./test');

const httpAgent = new http.Agent({ keepAlive: true });

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY';

const mobileDeviceConfigurations = [
    {
        browserName: 'android',
        device: 'Google Pixel 4',
        os_version: '10.0',
        realMobile: 'true',
    },
    {
        browserName: 'android',
        device: 'Motorola Moto X 2nd Gen',
        os_version: '6.0',
        realMobile: 'true',
    },
    {
        browserName: 'android',
        device: 'Samsung Galaxy S6',
        os_version: '5.0',
        realMobile: 'true',
    },
];

const defaultCapabilities = {
    environment: 'develop',
    project: 'TICE',
    'browserstack.console': 'verbose',
    build: gitRevision,
};

const remoteTest = function describeTest(deviceConfiguration) {
    describe(deviceConfiguration.device, () => {
        const capabilities = { ...defaultCapabilities, ...deviceConfiguration };
        let driver;

        beforeEach(() => {
            driver = new Builder()
                .usingHttpAgent(httpAgent)
                .usingServer(`http://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`)
                .withCapabilities(capabilities)
                .build();
        });

        it('should join and leave group', async () => {
            this.timeout(240000);
            await testLoadGroup(driver);
            await driver.quit();
        }).timeout(240000);
        it('should change and delete name', async () => {
            this.timeout(240000);
            await testChangeName(driver);
            await driver.quit();
        }).timeout(240000);
        it('should check and stop share Location', async () => {
            this.timeout(240000);
            await testShareLocation(driver);
            await driver.quit();
        }).timeout(240000);
        it('should check who I am', async () => {
            this.timeout(240000);
            await testMe(driver);
            await driver.quit();
        }).timeout(240000);
        it('should send a message', async () => {
            this.timeout(240000);
            await testSendMessage(driver);
            await driver.quit();
        }).timeout(240000);
        it('should receive a message', async () => {
            this.timeout(240000);
            await testReceiveMessage(driver);
            await driver.quit();
        }).timeout(240000);
        it('should recieve a changed name', async () => {
            this.timeout(240000);
            await testCnCNameChange(driver);
            await driver.quit();
        }).timeout(240000);
        it('should delete data', async () => {
            this.timeout(240000);
            await testDeleteData(driver);
            await driver.quit();
        }).timeout(240000);
        it('should load Cookies at refresh', async () => {
            this.timeout(240000);
            await testCookies(driver);
            await driver.quit();
        }).timeout(240000);
        it('should throw error if username is empty', async () => {
            this.timeout(240000);
            await testNoUsernameAtLogin(driver);
            await driver.quit();
        }).timeout(240000);
        it('should show more information page', async () => {
            this.timeout(240000);
            await testMoreInformation(driver);
            await driver.quit();
        }).timeout(240000);
        it('should forward to feedback popup', async () => {
            this.timeout(240000);
            await testFeedbackAtLogin(driver);
            await driver.quit();
        }).timeout(240000);
        it('should open TICE software page', async () => {
            this.timeout(240000);
            await testAboutTICESoftware(driver);
            await driver.quit();
        }).timeout(240000);
        it('should open Impressum page', async () => {
            this.timeout(240000);
            await testAboutImpressum(driver);
            await driver.quit();
        }).timeout(240000);
        it('should open TICE App page', async () => {
            this.timeout(240000);
            await testAboutTICEApp(driver);
            await driver.quit();
        }).timeout(240000);
        it('should open TICE Instagram page', async () => {
            this.timeout(240000);
            await testAboutInstagram(driver);
            await driver.quit();
        }).timeout(240000);
        it('should open TICE Facebook page', async () => {
            this.timeout(240000);
            await testAboutFacebook(driver);
            await driver.quit();
        }).timeout(240000);
        it('should open TICE Twitter page', async () => {
            this.timeout(240000);
            await testAboutTwitter(driver);
            await driver.quit();
        }).timeout(240000);
    });
};

mobileDeviceConfigurations.forEach(remoteTest);
