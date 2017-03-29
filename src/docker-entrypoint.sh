#!/bin/sh

cd /app/bin
if [ "$1" ]
then
    NODE_ENV="development" PORT=$1 node ./www
else
    NODE_ENV="development" PORT=51360 node ./www
fi
