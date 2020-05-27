FROM node:slim
WORKDIR /usr/src/app
COPY package.json .
COPY . .
EXPOSE 3000