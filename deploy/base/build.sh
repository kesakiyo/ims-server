#!/bin/bash

docker build --no-cache=true -t kesakiyo/ims:server-base . && docker push kesakiyo/ims:server-base