#!/bin/bash

docker build --no-cache=true -t kesakiyo/ims:server . && docker push kesakiyo/ims:server