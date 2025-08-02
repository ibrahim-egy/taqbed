FROM node:16.20.1

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 7860

CMD ["npm", "start"]