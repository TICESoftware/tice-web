import { defineStore } from 'pinia'
import { useLoggerStore } from '@/stores/LoggerStore'
import { useCryptoStore } from '@/stores/CryptoStore'
import JSSHA from 'jssha';

export const useTrackingStore = defineStore('tracking', () => {
  const Logger = useLoggerStore()
  const crypto = useCryptoStore()

  const beekeeperBaseURL = 'https://beekeeper.tice.app/';
  const product = import.meta.env.VITE_BEEKEEPER_PRODUCT;
  const secret = import.meta.env.VITE_BEEKEEPER_SECRET;

  let cookiesAllowed = false;

  function sha1hex(valueString) {
    const shaObj = new JSSHA('SHA-1', 'TEXT');
    shaObj.update(valueString);
    return shaObj.getHash('HEX');
  }
  function sha256hmac64(secretString, valueString) {
    const shaObj = new JSSHA('SHA-256', 'TEXT');
    shaObj.setHMACKey(secretString, 'TEXT');
    shaObj.update(valueString);
    return shaObj.getHMAC('B64');
  }

  let eventQueue = [];
  let flushTimeout;
  async function flushEventQueue() {
    clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushEventQueue, 30000);

    if (eventQueue.length === 0) {
      return;
    }
    const method = 'POST';
    const contentType = 'application/json';
    const body = JSON.stringify(eventQueue);
    const contentHash = sha1hex(body);
    const dateString = (new Date()).toISOString();
    const string = `${method}\n${contentHash}\n${contentType}\n${dateString}\n/${product}`;
    const signature = sha256hmac64(secret, string);
    const init = {
      method,
      headers: {
        'Content-Type': contentType,
        'authorization-date': dateString,
        authorization: signature,
      },
      body,
    };
    try {
      await fetch(beekeeperBaseURL + product, init);
      eventQueue = [];
    } catch (error) {
      Logger.error(`Couldn't send to beekeeper: ${error}`);
    }
  }
  flushTimeout = setTimeout(flushEventQueue, 30000);

  function getToday() {
    const date = new Date();
    const zeroPad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${zeroPad(date.getMonth() + 1)}-${zeroPad(date.getDate())}`;
  }

  const lastTimestamp = {};
  function getLastTimestamp(name) {
    if (lastTimestamp[name] !== undefined) {
      return lastTimestamp[name];
    }
    const stored = localStorage.getItem(`tice.beekeeper.${name}`);
    if (stored !== null) {
      return stored;
    }
    return undefined;
  }
  function updateLastTimestamp(name) {
    const newValue = getToday();
    if (cookiesAllowed) {
      localStorage.setItem(`tice.beekeeper.${name}`, newValue);
    }
    lastTimestamp[name] = newValue;
  }
  let previousEvent;
  function updatePreviousEvent(newValue) {
    const old = previousEvent;
    previousEvent = newValue;
    if (cookiesAllowed) {
      localStorage.setItem('tice.beekeeper.previousEvent', newValue);
    }
    if (old === undefined) {
      const stored = localStorage.getItem('tice.beekeeper.previousEvent');
      if (stored !== null) {
        return stored;
      }
    }
    return old;
  }
  let sessionStartVariable;

  async function track(name, group = undefined, detail = undefined, value = undefined) {
    Logger.trace(`Beekeeper: ${[name, group, detail, value].join(' ')}`);
    const last = getLastTimestamp(name);
    updateLastTimestamp(name);
    const installDay = localStorage.getItem('tice.beekeeper.installday') === null ? getToday() : localStorage.getItem('tice.beekeeper.installday');

    const event = {
      id: crypto.generateUUID().replace(/-/g, '').toUpperCase(),
      p: product,
      t: (new Date()).toISOString(),
      name,
      group,
      detail,
      value,
      prev: updatePreviousEvent(name),
      last,
      install: installDay,
      custom: [`web-${process.env.VUE_APP_VERSION}`],
    };
    eventQueue.push(event);
    if (name === 'SessionEnd') {
      flushEventQueue();
    }
  }

  function allowCookies() {
    cookiesAllowed = true;
    if (localStorage.getItem('tice.beekeeper.installday') === null) {
      localStorage.setItem('tice.beekeeper.installday', getToday());
    }
  }
  function sessionStart(lang) {
    sessionStartVariable = Date.now();
    track('SessionStart', 'App', lang);
  }
  function sessionEnd() {
    const sessionLength = (Date.now() - sessionStartVariable) / 1000;
    track('SessionEnd', 'App', undefined, sessionLength);
  }
  function locationAuthorization(value) {
    const detail = value ? 'AUTHORIZED' : 'DENIED';
    track('LocationAuthorization', 'App', detail);
  }
  function changeLocationTracking(value) {
    const detail = value ? 'YES' : 'NO';
    track('ChangeLocationTracking', 'Settings', detail);
  }
  function changeName() {
    track('ChangeName', 'Settings');
  }
  function screen(name, detail = undefined) {
    track(name, 'Screen', detail);
  }
  function registerComplete() {
    track('RegisterComplete', 'MainFlow');
  }
  function loadFromStorage() {
    track('SignIn', 'MainFlow');
  }
  function pageView() {
    track('PageView', 'App', navigator.userAgent);
  }
  function error(name, detail = undefined) {
    track(name, 'Error', detail);
  }

  return { 
    allowCookies, sessionStart, sessionEnd, locationAuthorization, changeLocationTracking, changeName, screen,
    registerComplete, loadFromStorage, pageView, error
  }
})