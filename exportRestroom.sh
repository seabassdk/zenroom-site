# echo "${red}red text ${green}green text${reset}"
red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

echo "${reset} "
echo "   "
echo "Make sure you have node 10 or above installed, the version you have is" 
echo "   "
node -v
echo "   "
echo "   "
# Installing restroom
npx degit dyne/restroom-template restroom-mw --force

# setup docker
cd ./restroom-mw

touch .env
echo 'ZENCODE_DIR=/restroom-mw/zencode
CUSTOM_404_MESSAGE=nothing to see here
HTTP_PORT=3300
HTTPS_PORT=3301' > .env


# Adding the exported files
echo "   "
echo "Adding exported contracts from apiroom"





# Finished exported files
echo "   "
echo "Finished exporting contracts from apiroom"
echo "   "

# Debbing
echo "   "
echo "Printing the .env file:"
echo "   "
cat .env

# instructions 
echo "   "
echo "${reset} "
echo "${green} ALL DONE  "
echo "${reset} "
echo "   "
echo "To install restroom-mw type:"
echo "   "
echo "${red}cd restroom-mw"
echo "${reset} "
echo "${red}yarn"
echo "${reset} "
echo "To launch restroom-mw type:"
echo "${reset} "
echo "${red}yarn start"
echo "${reset} "

