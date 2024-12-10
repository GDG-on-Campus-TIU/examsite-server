FROM node:20-alpine as builder

WORKDIR /sof

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8998
CMD [ "npm", "run", "start" ]


FROM node:20-alpine as prod

WORKDIR /sof/prod

COPY --from=builder /sof/ .

EXPOSE 8998
CMD [ "npm", "run", "start" ]
