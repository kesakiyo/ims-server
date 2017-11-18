#!/bin/bash

docker build --no-cache=true -t kesakiyo/ims:server-exp . && docker push kesakiyo/ims:server-exp