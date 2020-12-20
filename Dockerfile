FROM node:14

RUN apt-get update \
  && apt-get install -y mysql-server mysql-client \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn

COPY . /app

RUN yarn build

ENTRYPOINT [ "./entrypoint.sh" ]