FROM kesakiyo/ims:server-base

MAINTAINER Minho Cheon <kesakiyo@naver.com>

ENV NODE_ENV production

WORKDIR /usr/src/master/ims-server

RUN git checkout master && \
    git pull && \
    npm install

EXPOSE 3000

CMD ["npm", "run", "forever"]
