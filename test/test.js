const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const axios = require('axios');

const cncApi = axios.create({
    baseURL: 'http://localhost:1650',
});

async function requestCNC(method, url, data) {
    const call = cncApi.request({ method, url, data });
    return call.then((res) => {
        if (res.data.success === true) {
            return res.data.result;
        } if (res.data.error !== undefined) {
            throw new Error(`${res.data.error.type}:${res.data.error.description}`);
        } else {
            throw new Error(`Unknown error: ${JSON.stringify(res.data)}`);
        }
    });
}

const groupName = 'Test';
const userName = 'Testuser';
let user;
let group;

async function initialize(driver) {
    user = await requestCNC('POST', '/user');
    group = await requestCNC('POST', `/user/${user.userId}/group`, {
        type: 'team',
        joinMode: 'open',
        permissionMode: 'everyone',
        settings: { owner: user.userId, name: groupName },
    });
    const url = `http://localhost:1600/group/${group.groupId}#${group.groupKey}`;
    await driver.get(url);
}

async function loadUntilWelcomeBox(driver) {
    await initialize(driver);
    await driver.wait(until.elementLocated(By.className('el-button--primary')));
}

async function register(driver, dialog) {
    await dialog.findElement(By.className('el-input__inner')).sendKeys(userName);
    await dialog.findElement(By.className('el-button--primary')).click();
    const mapbox = await driver.wait(until.elementLocated(By.className('mapboxgl-map')));
    await driver.wait(until.elementIsVisible(mapbox));
}

async function loadUntilMap(driver) {
    await loadUntilWelcomeBox(driver);
    const dialog = await driver.findElement(By.className('el-dialog__wrapper'));
    await register(driver, dialog);
}

async function getGroupmembers(driver) {
    const titlebar = await driver.findElement(By.id('titlebar'));
    await titlebar.findElement(By.className('groupname')).click();
    const msgBox = await driver.findElement(By.className('el-message-box__wrapper'));
    const row = await msgBox.findElement(By.className('el-row'));
    const spans = await row.findElements(By.tagName('span'));
    return {
        titlebar,
        msgBox,
        spans,
    };
}

async function searchNameInGroupinfo(driver, searchedName) {
    const members = (await getGroupmembers(driver)).spans;
    for (let i = 0; i < members.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const name = await members[i].getText();
        if (name === searchedName || name === `${searchedName} (Du)`) {
            return name;
        }
    }
    return '';
}

async function waitAndSwitch(driver) {
    await driver.wait(
        async () => (await driver.getAllWindowHandles()).length === 2,
        10000,
    );
    const windows = await driver.getAllWindowHandles();
    await driver.switchTo().window(windows[1]);
}

async function testAbout(driver, type, name, title) {
    await loadUntilWelcomeBox(driver);
    const dialog = driver.findElement(By.className('el-dialog__wrapper'));
    await dialog.findElement(By.tagName('img')).click();
    const msgBox = await driver.findElement(By.className('el-message-box'));
    const originalWindow = await driver.getWindowHandle();
    expect((await driver.getAllWindowHandles()).length === 1);
    switch (type) {
    case 'link': await msgBox.findElement(By.linkText(name)).click(); break;
    case 'class': await msgBox.findElement(By.className(name)).click(); break;
    case 'tag': await msgBox.findElement(By.className('el-message-box__close el-icon-close')).click();
        await driver.wait(until.elementIsNotVisible(msgBox));
        await dialog.findElement(By.tagName(name)).click();
        break;
    default: break;
    }
    await waitAndSwitch(driver);
    await driver.wait(until.titleContains(title), 10000);
    const newTitle = await driver.getTitle();
    await driver.close();
    await driver.switchTo().window(originalWindow);
    return newTitle;
}

/* * * * * * * * * * * * * * * Tests * * * * * * * * * * * * * */

async function testLoadGroup(driver) {
    await initialize(driver);
    const title = await driver.getTitle();
    expect(title).to.contain('TICE');

    const dialog = driver.findElement(By.className('el-dialog__wrapper'));

    await driver.wait(until.elementLocated(By.className('el-button--primary')));

    const dialogTitle = await dialog.findElement(By.className('dialog-title')).getText();
    expect(dialogTitle).to.equal(groupName);

    const membersTitle = await dialog.findElement(By.className('groupinfo-title')).getText();

    await dialog.findElement(By.className('el-input__inner')).sendKeys('Testuser');

    await dialog.findElement(By.className('el-button--primary')).click();

    await driver.wait(until.elementIsNotVisible(dialog));

    const mapbox = await driver.wait(until.elementLocated(By.className('mapboxgl-map')));
    await driver.wait(until.elementIsVisible(mapbox));

    const titleBar = await driver.findElement(By.id('titlebar'));
    await titleBar.findElement(By.className('username')).click();

    const messageBox = await driver.findElement(By.className('el-message-box'));
    await messageBox.findElement(By.className('el-button')).click();

    await driver.wait(until.elementLocated(By.className('el-button--primary')));

    const newDialog = driver.findElement(By.className('el-dialog__wrapper'));
    const newDialogTitle = await newDialog.findElement(By.className('dialog-title')).getText();

    expect(newDialogTitle).to.equal(groupName);

    const newMembersTitle = await newDialog.findElement(By.className('groupinfo-title')).getText();

    expect(newMembersTitle).to.equal(membersTitle);
}

async function testChangeName(driver) {
    await loadUntilMap(driver);
    const titleBar = await driver.findElement(By.id('titlebar'));
    const actualUserName = await titleBar.findElement(By.className('username')).getText();
    expect(actualUserName).to.equal(`${userName.substr(0, 2)}\n${userName}`);
    const changeName = 'Tester';
    await titleBar.findElement(By.className('username')).click();
    const msgBox = driver.findElement(By.className('el-message-box__wrapper'));
    await msgBox.findElement(By.className('el-input__inner')).sendKeys(changeName);
    await msgBox.findElement(By.className('el-message-box__close')).click();

    await driver.wait(until.elementIsNotVisible(msgBox));
    const newActualUserName = await titleBar.findElement(By.className('username')).getText();
    expect(newActualUserName).to.equal(`${changeName.substr(0, 2)}\n${changeName}`);
    expect(await searchNameInGroupinfo(driver, changeName)).to.equal(`${changeName} (Du)`);
}

async function testShareLocation(driver) {
    await loadUntilMap(driver);
    const groupinfo = await getGroupmembers(driver);
    expect(await groupinfo.spans[1].getCssValue('font-weight')).to.equal('700');
    await groupinfo.msgBox.findElement(By.className('el-message-box__headerbtn')).click();
    await driver.wait(until.elementIsNotVisible(groupinfo.msgBox));
    const shareLocationText = await driver.findElement(By.id('shareLocationText')).getText();
    expect(shareLocationText).to.equal('Standort wird geteilt');
    const shareLocationSubText = await driver.findElement(By.id('shareLocationSubText')).getText();
    expect(shareLocationSubText).to.equal('Teilen beenden');
    await driver.findElement(By.id('shareLocationButton')).click();
    const shareLocationTextNow = await driver.findElement(By.id('shareLocationText')).getText();
    expect(shareLocationTextNow).to.equal('Standort teilen');
    const shareLocationSubTextNow = await driver.findElement(By.id('shareLocationSubText')).getText();
    expect(shareLocationSubTextNow).to.equal('');
    await groupinfo.titlebar.findElement(By.className('groupname')).click();
    expect(await groupinfo.spans[1].getCssValue('font-weight')).to.equal((400).toString());
}

async function testMe(driver) {
    await loadUntilMap(driver);
    const name = await searchNameInGroupinfo(driver, userName);
    expect(name).to.equal(`${userName} (Du)`);
}

async function testSendMessage(driver) {
    await loadUntilMap(driver);
    const sendMessage = 'Hallo Welt';
    await driver.findElement(By.className('sc-open-icon')).click();
    const chatWindow = await driver.findElement(By.className('sc-chat-window opened'));
    await chatWindow.findElement(By.className('sc-user-input--text')).sendKeys(sendMessage);
    await chatWindow.findElement(By.className('sc-user-input--button-icon-wrapper')).click();
    await driver.wait(until.elementLocated(By.className('sc-message--content sent')));
    const sendMessages = await chatWindow.findElement(By.className('sc-message--content sent'));
    const sentText = await sendMessages.findElement(By.className('sc-message--text-content')).getText();
    expect(sentText).to.equal(sendMessage);
}

// TODO: beenden wenn Bug gefixed ist
async function testReceiveMessage(driver) {
    await loadUntilWelcomeBox(driver);
    const dialog = driver.findElement(By.className('el-dialog__wrapper'));
    await register(driver, dialog);
    const message = 'Hallo Du';
    await requestCNC('POST', `/user/${user.userId}/chatMessage`, {
        groupId: group.groupId,
        text: message,
    });
    await driver.findElement(By.className('sc-open-icon')).click();
}

// TODO: wenn Bug gefixed ist beenden und überarbeiten - derzeit könnte bei der Überprüfung Tom richtig sein obwohl der gesuchte Name Tomas ist
async function testCnCNameChange(driver) {
    await loadUntilWelcomeBox(driver);
    const dialog = driver.findElement(By.className('el-dialog__wrapper'));
    await register(driver, dialog);
    const changeName = 'Changed';
    await requestCNC('POST', `/user/${user.userId}/changeName`, {
        publicName: changeName,
    });
    const name = await searchNameInGroupinfo(driver, changeName);
    expect(name).to.equal(changeName);
}

async function testDeleteData(driver) {
    await loadUntilMap(driver);

    // check number of groupmembers in groupinfo
    const groupinfo = await getGroupmembers(driver);
    const length = groupinfo.spans.length.toString();
    const groupmembers = await groupinfo.msgBox.findElement(By.className('groupinfo-title')).getText();
    expect(groupmembers.match(/\d+/)[0]).to.equal(length);

    // clear data
    await groupinfo.msgBox.findElement(By.className('el-message-box__headerbtn')).click();
    await driver.wait(until.elementIsNotVisible(groupinfo.msgBox));
    await groupinfo.titlebar.findElement(By.className('username')).click();
    const messageBox = driver.findElement(By.className('el-message-box__wrapper'));
    await messageBox.findElement(By.className('el-button')).click();

    // welcomeBox
    const dialog = await driver.findElement(By.className('el-dialog__wrapper'));
    await driver.wait(until.elementLocated(By.className('el-button el-button--primary')));
    const startScreen = dialog;

    // check if number of names equals new groupmember amount
    const memberRow = await startScreen.findElement(By.className('groupinfo-body'));
    const memberSpan = await memberRow.findElements(By.tagName('span'));
    expect(memberSpan.length.toString()).to.equal((length - 1).toString());

    // check if the groupmember amount number (members (xx)) equals new groupmember amount
    const groupmembersNew = await startScreen.findElement(By.className('groupinfo-title')).getText();
    expect(groupmembersNew.match(/\d+/)[0]).to.equal((length - 1).toString());
}

async function testNoUsernameAtLogin(driver) {
    await loadUntilWelcomeBox(driver);
    const dialog = driver.findElement(By.className('el-dialog__wrapper'));
    await dialog.findElement(By.className('el-button--primary')).click();
    const failText = await dialog.findElement(By.className('el-form-item__error')).getText();
    expect(failText).to.equal('Bitte einen Namen eingeben.');
}

async function testMoreInformation(driver) {
    const title = 'Datenschutzerklärung - TICE App';
    const newTitle = await testAbout(driver, 'tag', 'a', title);
    expect(newTitle).to.equal(title);
}

async function testFeedbackAtLogin(driver) {
    await loadUntilWelcomeBox(driver);
    const dialog = driver.findElement(By.className('el-dialog__wrapper'));
    await dialog.findElement(By.tagName('img')).click();
    const aboutWrapper = await driver.findElement(By.className('el-message-box__wrapper'));
    const msgBoxContainer = await aboutWrapper.findElement(By.className('el-message-box__message'));
    await msgBoxContainer.findElement(By.className('el-button el-button--warning el-button--medium is-plain')).click();
    await driver.wait(until.alertIsPresent());
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    await alert.dismiss();
    expect(alertText).to.contain('Wenn du uns von einem Problem berichten');
}

async function testAboutTICESoftware(driver) {
    const title = 'TICE Software';
    const newTitle = await testAbout(driver, 'link', 'TICE Software UG (haftungsbeschränkt)', title);
    expect(newTitle).to.equal(title);
}

async function testAboutImpressum(driver) {
    const title = 'Impressum - TICE App';
    const newTitle = await testAbout(driver, 'link', 'Impressum', title);
    expect(newTitle).to.equal(title);
}

async function testAboutTICEApp(driver) {
    const title = 'Standort teilen, Familie orten & Freunde treffen - TICE App';
    const newTitle = await testAbout(driver, 'link', 'ticeapp.com', title);
    expect(newTitle).to.equal(title);
}

async function testAboutInstagram(driver) {
    const title = 'TICE - Secure Location Sharing (@ticeapp)';
    const newTitle = await testAbout(driver, 'class', 'svg-inline--fa fa-instagram fa-w-14 fa-lg', title);
    expect(newTitle).to.include(title);
}

async function testAboutFacebook(driver) {
    const title = 'TICE App - Startseite | Facebook';
    const newTitle = await testAbout(driver, 'class', 'svg-inline--fa fa-facebook-square fa-w-14 fa-lg', title);
    expect(newTitle).to.equal(title);
}

async function testAboutTwitter(driver) {
    const title = 'TICE (@ticeapp) / Twitter';
    const newTitle = await testAbout(driver, 'class', 'svg-inline--fa fa-twitter fa-w-16 fa-lg', title);
    expect(newTitle).to.equal(title);
}

async function testCookies(driver) {
    await loadUntilMap(driver);
    const titlebar = await driver.findElement(By.id('titlebar'));
    const actualName = await titlebar.findElement(By.className('username')).getText();
    const actualGroup = await titlebar.findElement(By.className('groupname')).getText();
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.className('mapboxgl-map')));
    const newTb = await driver.findElement(By.id('titlebar'));
    const refreshedName = await newTb.findElement(By.className('username')).getText();
    const refreshedGroup = await newTb.findElement(By.className('groupname')).getText();
    expect(refreshedName).to.equal(actualName);
    expect(refreshedGroup).to.equal(actualGroup);
}

module.exports = {
    testLoadGroup,
    testChangeName,
    testShareLocation,
    testMe,
    testSendMessage,
    testReceiveMessage,
    testCnCNameChange,
    testDeleteData,
    testCookies,
    testNoUsernameAtLogin,
    testMoreInformation,
    testFeedbackAtLogin,
    testAboutTICESoftware,
    testAboutImpressum,
    testAboutTICEApp,
    testAboutInstagram,
    testAboutFacebook,
    testAboutTwitter,
};
