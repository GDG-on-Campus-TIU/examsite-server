FROM node-20:alpine

WORKDIR /sof

COPY package*.json .

RUN npm install
