FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy package files and install
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
