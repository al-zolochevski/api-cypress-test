#Each Dockerfile start with key word 'From'
#And it meand that we want to copy some existing image to Dockerfile
FROM cypress/base:14.19.0

#Create a directory
RUN mkdir /app

#Make it like working directory
WORKDIR /app

COPY . /app

RUN npm install

RUN $(npm bin)/cypress verify

CMD ["npm", "run", "start"]

CMD ["npm", "run", "cypress:run"]

#then run the command in terminal  docker build -t cypress .
