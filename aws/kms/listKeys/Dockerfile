# Base image
FROM node:14.13.1

LABEL AUTHOR="Cal Supik"

# specify working directory
WORKDIR /usr/aws

# Install dependencies
COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# Default command
CMD npm start
