FROM node:20-alpine3.17

RUN apk add --no-cache tzdata
ENV TZ Europe/Moscow

WORKDIR /calcs-testing-system

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]