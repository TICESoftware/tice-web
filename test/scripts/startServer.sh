#!/usr/bin/env bash

export SERVER_PORT=1680
export SERVER_HOST="127.0.0.1"
export CNC_SERVER_PORT=1650
export CNC_SERVER_HOST="127.0.0.1"
export WEB_APP_PORT=1600
export WEB_APP_HOST="127.0.0.1"

# CnC expects server backend at BACKEND_HOST:BACKEND_PORT
export BACKEND_PORT=${SERVER_PORT}
export BACKEND_HOST=${SERVER_HOST}

RED=''
GREEN=''
RESET=''

START_SERVER=1
START_CNC_SERVER=1
START_WEB_APP=1

if nc -z ${SERVER_HOST} ${SERVER_PORT} > /dev/null 2>&1; then
  echo "${RED}WARNING: Server - An unknown server listens on port ${SERVER_PORT}. Not starting the Server.${RESET}"
  START_SERVER=0
fi

if nc -z ${CNC_SERVER_HOST} ${CNC_SERVER_PORT} > /dev/null 2>&1; then
  echo "${RED}WARNING: CnC Server - An unknown server listens on port ${CNC_SERVER_PORT}. Not starting the CnC Server.${RESET}"
  START_CNC_SERVER=0
fi

if nc -z ${WEB_APP_HOST} ${WEB_APP_PORT} > /dev/null 2>&1; then
  echo "${RED}WARNING: Web App - An unknown server listens on port ${WEB_APP_PORT}. Not starting the Web App.${RESET}"
  START_WEB_APP=0
fi

rm server.log
rm cnc_server.log
rm web_app.log

if [ $START_SERVER -eq 1 ]; then
  echo "Building and starting Server on port ${SERVER_PORT}"
  make -C Server build
  nohup make -C Server run > server.log 2>&1 &
  SERVER_PID=$!
  echo $SERVER_PID > server.pid
  echo "${GREEN}Started Server on port ${SERVER_PORT} with PID ${SERVER_PID}.${RESET}"
else
  echo "${RED}WARNING: Using unknown Server on port ${SERVER_PORT}${RESET}"
fi

if [ $START_CNC_SERVER -eq 1 ]; then
  echo "Building and starting CnC Server on port ${CNC_SERVER_PORT}"
  make -C CnC build
  nohup make -C CnC run > cnc_server.log 2>&1 &
  CNC_SERVER_PID=$!
  echo $CNC_SERVER_PID > cnc_server.pid
  echo "${GREEN}Started CnC Server on port ${CNC_SERVER_PORT} with PID ${CNC_SERVER_PID}.${RESET}"
else
  echo "${RED}WARNING: Using unknown CnC Server on port ${CNC_SERVER_PORT}${RESET}"
fi

if [ $START_WEB_APP -eq 1 ]; then
  echo "Building and starting Web App on port ${WEB_APP_PORT}"
  export VUE_APP_USE_TLS=""
  export VUE_APP_API_URL="${SERVER_HOST}:${SERVER_PORT}"
  nohup yarn run serve --port ${WEB_APP_PORT} > web_app.log 2>&1 &
  WEB_APP_PID=$!
  echo $WEB_APP_PID > web_app.pid
  echo "${GREEN}Started Web App on port ${WEB_APP_PORT} with PID ${WEB_APP_PID}.${RESET}"
else
  echo "${RED}WARNING: Using unknown Web App on port ${WEB_APP_PORT}${RESET}"
fi

echo $SERVER_PORT > server.port
echo $CNC_SERVER_PORT > cnc_server.port
echo $WEB_APP_PORT > web_app.port

echo "Waiting for the servers to be serving…"

while ! nc -z ${SERVER_HOST} ${SERVER_PORT}; do
  sleep 1
  if ! [ $START_SERVER ] && kill -0 $SERVER_PID; then
    echo "${RED}ERROR: Server was terminated before it was up and running.${RESET}"
    echo "Contents of server.log:"
    cat server.log
    exit 1
  fi
done

while ! nc -z ${CNC_SERVER_HOST} ${CNC_SERVER_PORT}; do
  sleep 1
  if ! [ $START_CNC_SERVER ] && kill -0 $CNC_SERVER_PID; then
    echo "${RED}ERROR: CnC Server was terminated before it was up and running.${RESET}"
    echo "Contents of cnc_server.log:"
    cat cnc_server.log
    exit 1
  fi
done

while ! nc -z ${WEB_APP_HOST} ${WEB_APP_PORT}; do
  sleep 1
  if ! [ $START_WEB_APP ] && kill -0 $WEB_APP_PID; then
    echo "${RED}ERROR: Web App was terminated before it was up and running.${RESET}"
    echo "Contents of web_app.log:"
    cat web_app.log
    exit 1
  fi
done

echo "${GREEN}All servers are reachable.${RESET}"
