FROM node:14
# FROM dyne/devuan:beowulf
# FROM mhart/alpine-node:14

RUN npx degit dyne/restroom-template restroom-mw

# RUN apk add git 
# RUN git clone https://github.com/dyne/restroom-template restroom-mw
# RUN rm -rf ./restroom-mw/.git/
# RUN apt install npm -y

WORKDIR /restroom-mw


EXPOSE 3300 
EXPOSE 3301 

# Adding an external file via ADD
ADD .env ./
ADD keypairAdded.zen ./zencode

# Adding exported contracts

# Adding a file inline 
RUN touch env.text
RUN echo $'ZENCODE_DIR=/zencode\n\
HTTP_PORT=3300\n\
HTTPS_PORT=3301\n'\
>> /restroom-mw/env.text


# Debugging lines
RUN ls -al
RUN cat .env
RUN ls -al ./zencode
RUN cat env.text


run npm i
run npm i fuzzball
run npm run start


 