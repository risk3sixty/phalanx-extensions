# Base image
FROM node:14.13.1

LABEL AUTHOR="Lance Whatley"

# specify working directory
WORKDIR /usr/heroku

# Install dependencies
COPY package.json .

RUN npm install

COPY . .

# Default command
CMD npm start
