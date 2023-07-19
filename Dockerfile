FROM node:20-alpine3.17

WORKDIR /calcs-testing-system

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]