import { defineStore } from 'pinia'

export const useLoggerStore = defineStore('logger', () => {

const logs = [];
const debugMode = window.location.href.indexOf('/tice.app/') === -1;

function log(logLevel, msg) {
    let logMsg = `[${(new Date()).toLocaleString()} `;
    switch (logLevel) {
    case 'WARNING':
        logMsg += 'WRNNG';
        break;
    case 'INFO':
        logMsg += 'INFOS';
        break;
    default:
        logMsg += logLevel;
    }
    logMsg += `] ${msg}`;
    logs.push(logMsg);

    /* eslint-disable no-console */
    switch (logLevel) {
    case 'ERROR':
        console.error(logMsg);
        break;
    case 'WARNING':
        console.warn(logMsg);
        break;
    case 'INFO':
        console.info(logMsg);
        break;
    case 'TRACE':
        if (debugMode) {
            console.debug(logMsg);
        }
        break;
    default:
        if (debugMode) {
            console.log(logMsg);
        }
    }
    /* eslint-enable no-console */
}

function trace (msg) {
  log('TRACE', msg)
}
function debug (msg) {
  log('DEBUG', msg)
}
function info (msg) {
  log('INFO', msg)
}
function warning (msg) {
  log('WARNING', msg)
}
function error (msg) {
  log('ERROR', msg)
}

function getLogs() {
  if (logs.length > 0) {
    return `Logs:\n\n${logs.join('\n')}`;
  }
  return '';
}

return { getLogs, trace, debug, info, warning, error }
})