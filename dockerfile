# Importing node14 docker image
FROM node:14

# Install nano for debug
RUN apt-get update
RUN apt-get install nano

# Installing restroom
RUN npx degit dyne/restroom-template restroom-mw

# setup docker
WORKDIR /restroom-mw
EXPOSE 3300 
EXPOSE 3301 

# Adding the .env file
RUN touch .env
RUN echo 'ZENCODE_DIR=/restroom-mw/zencode\n\
CUSTOM_404_MESSAGE=nothing to see here\n\
HTTP_PORT=3300\n\
HTTPS_PORT=3301\n'\
> /restroom-mw/.env

# Adding the exported files
RUN echo "Adding exported contracts from apiroom"

# Debugging lines
RUN ls -al
RUN cat .env
RUN ls -al ./zencode
RUN cat .env

# yarn install and run
RUN yarn
CMD yarn start




 
