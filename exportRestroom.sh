echo "   "
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

# Debugging lines
echo "   "
echo "Printing the .env file:"
echo "   "
cat .env
echo "   "
echo "   "
echo "  DONE  "
echo "   "
echo "   "
echo "To install restroom-mw type:"
echo "   "
echo "yarn"
echo "   "
echo "To launch restroom-mw type:"
echo "   "
echo "yarn start"
echo "   "

# yarn install and run
# yarn
# yarn start




 
