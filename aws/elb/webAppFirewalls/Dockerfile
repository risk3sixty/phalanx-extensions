# Base image
FROM node:16.3.0

LABEL AUTHOR="Lance Whatley"

# specify working directory
WORKDIR /usr/aws

# Install dependencies
COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# Default command
CMD npm start
