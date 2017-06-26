FROM node:8.1.2-slim

EXPOSE 7373
WORKDIR /temperature-server

COPY package.json /temperature-server
RUN npm install

COPY . /temperature-server

CMD ["npm", "start"]

