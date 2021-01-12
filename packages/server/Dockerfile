FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn && \
    yarn run build && \
    yarn cache clean
EXPOSE 80
CMD ["yarn", "run", "serve"]