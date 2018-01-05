FROM node:8

WORKDIR /app

COPY . .

RUN npm install

ENV PORT 9892

EXPOSE 9892

CMD [ "npm", "start" ]
