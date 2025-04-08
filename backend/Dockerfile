FROM node:alpine

WORKDIR /backend

COPY package*.json /backend/

RUN npm install

COPY . /backend/

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]