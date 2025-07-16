FROM node:18-alpine

WORKDIR /app/service/product-service

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema BEFORE generating
COPY prisma ./prisma/

# Generate Prisma Client for Alpine Linux
RUN npx prisma generate

# Copy rest of the source code
COPY . .


CMD ["sh", "-c", "npx prisma db push && npm start"]