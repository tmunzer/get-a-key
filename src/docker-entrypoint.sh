#!/bin/sh

cd /app/bin
if [ "$1" ]
then
    NODE_ENV="development" PORT=$1 DOCKERIZED=true node ./www
else
    NODE_ENV="development" PORT=51360 DOCKERIZED=true node ./www
fi
