# Importing node14 docker image
FROM node:14

# Installing restroom
RUN npx degit dyne/restroom-template restroom-mw

# Install nano for debug
RUN apt-get update
RUN apt-get install nano

# setup docker
WORKDIR /restroom-mw
EXPOSE 3300 
EXPOSE 3301 

# Adding the .env file
RUN touch .env
RUN echo $'ZENCODE_DIR=/zencode\n\
CUSTOM_404_MESSAGE=nothing to see here\n\
HTTP_PORT=3300\n\
HTTPS_PORT=3301\n'\
>> /restroom-mw/.env

# Adding the exported files
RUN echo "Adding exported contracts from apiroom"

# Debugging lines
RUN ls -al
RUN cat .env
RUN ls -al ./zencode
RUN cat .env

# npm install and run
run npm i
run npm i fuzzball
run npm run start




 