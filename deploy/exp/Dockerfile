FROM kesakiyo/ims:server-base

MAINTAINER Minho Cheon <kesakiyo@naver.com>

ENV NODE_ENV exp

WORKDIR /usr/src/master/ims-server

RUN git checkout exp && \
    git pull && \
    npm install

EXPOSE 3001

CMD ["npm", "run", "forever"]
