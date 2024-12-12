FROM node:20-alpine AS builder

WORKDIR /usr/sof

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx tsc --build

FROM node:20-alpine AS prod

WORKDIR /usr/prod

COPY --from=builder /usr/sof/ .

# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser

EXPOSE 8998
CMD [ "node", "src/server.js" ]
