Steps on how to deploy - 

1. Setup harhdat project in solidity directory
3. fill the private key env file
2. run deploy script with - yarn hardhat run scripts/deploy.js
4. go to backend_central_server directory
5. install packages
6. setup private key in express_server.mjs file
7. setup pinata key  in file ipfs_helper.mjs
8. run  - yarn node express_server.mjs (in seperate terminal and keep it running)
9. run - yarn node smartContractListener.mjs (in seperate terminal and keep it running)
10. go to folder frontend/src and install packages
11. setup pinata keys in contracts/config.js
12. run frontend app by - yarn run dev (in seperate terminal and keep it running)
13. Go to localhost:3000 to visit the application