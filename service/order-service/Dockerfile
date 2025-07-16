FROM node:21-alpine3.18

WORKDIR /app/service/order-service

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start"]