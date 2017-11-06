FROM kesakiyo/ims:latest

MAINTAINER Minho Cheon <kesakiyo@naver.com>

WORKDIR /usr/src/master/ims-server

RUN git pull origin master && \
    npm install

EXPOSE 3000

CMD ["npm", "start"]
