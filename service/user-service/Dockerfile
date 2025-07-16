FROM node:21-alpine3.18

WORKDIR /app/service/user-service

COPY package.json .

RUN npm install


COPY prisma ./prisma/



RUN npx prisma generate


COPY . .


CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]