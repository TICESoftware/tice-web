#!/usr/bin/env bash

if [ -f server.port ]
then
  rm server.port
fi

if [ -f cnc_server.port ]
then
  rm cnc_server.port
fi

if [ -f web_app.port ]
then
  rm web_app.port
fi

if [ -f server.pid ]
then
  kill -TERM $(cat server.pid) || true
  rm server.pid
  echo "Stopped Server"
else
  echo "Server not running"
fi

if [ -f Server/db.sqlite ]
then
  rm Server/db.sqlite
  echo "Deleted server database"
else
  echo "No server database found"
fi

if [ -f cnc_server.pid ]
then
  kill -TERM $(cat cnc_server.pid) || true
  rm cnc_server.pid
  echo "Stopped CnC Server"
else
  echo "CnC Server not running"
fi

if [ -f web_app.pid ]
then
  kill -TERM $(cat web_app.pid) || true
  rm web_app.pid
  echo "Stopped Web App"
else
  echo "Web App not running"
fi
