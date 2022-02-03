# Breeding Random CryptoMarcs

Chainlink's validated random numbers generate CryptoMarcs from image layers of real people like me (Marc). Then breed from 2 CryptoMarcs a mixed skills species with Chainlink's API feature.

## Getting Started

First, clone the repo and install the dependencies:

```sh
git clone https://github.com/marc4gov/cryptomarcs

cd cryptomarcs

yarn

# or

npm install
```

Then, make a `.env` file with the following:

```javascript
KOVAN_RPC_URL='your kovan rpc url'
PRIVATE_KEY='your private key of the kovan testnet (MetaMask) account'
ALCHEMY_MAINNET_RPC_URL="your Alchemy rpc url"
PRIVATE_KEY_DEV='your dev private key'
PINATA_USER='your Pinata account...'
PINATA_KEY='...and key'
```

Next, deploy the contracts with hardhat on Ethereum kovan test network:

```sh
npx hardhat deploy --network kovan
```

Output is similar to this:
```sh
reusing "APIConsumer" at 0x5C006617eC722Ff755387CfB4363F720D40afD70
Run API Consumer contract with following command:
npx hardhat request-data --contract 0x5C006617eC722Ff755387CfB4363F720D40afD70--url <API-endpoint> --path <PATH> --network kovan
----------------------------------------------------
reusing "NFTMarket" at 0x645C9DACC1b8c60eE9F60Af5F28253309439D746
NFTMarket deployed to: 0x645C9DACC1b8c60eE9F60Af5F28253309439D746
reusing "RandomCryptoMarc" at 0xBed46e9C277F71419E02A23Bb795Deda5E876B17
Run the following command to fund contract with LINK:
npx hardhat fund-link --contract 0xBed46e9C277F71419E02A23Bb795Deda5E876B17 --network kovan
Then run RandomCryptoMarc contract with the following command
npx hardhat request-random-crypto-marc --contract 0xBed46e9C277F71419E02A23Bb795Deda5E876B17 --network kovan
```

Now you can use the hardhat commands in the `tasks` directory to get new RandomCryptoMarcs and do API calls. API-endpoint is `https://competenties.fnctn.nl/api/OP-<number>` and PATH is `essentialCompetences.0.code`. Make sure to have both contracts (`RandomCryproMarc` and `APIConsumer`) funded with LINK. And generate at least 15 RandomCryptoMarcs before moving on.

## Image Generation

The second part is about generating the images for the RandomCryptoMarcs, using the HashLips Art Engine, primarily in `src/main.js`. I altered some functions to accomodate for the random number generation, as input to the layering of the resulting images. Main function is `startCreating` where the call to the RandomCryptoMarc contract is made and the resulting random numbers are compared to the weight of the layers. Set the contract addresses to your corresponding deployed ones. According to the layer config in `src/config.js` the next command wil generate a number of images and corresponding metadata JSON files in the `build` directory, like so:

```bash
npm run build2
```

At a later stage we can set the Token URI using a Pinata hash of the JSON metadata to the RandomCryptoMarc generated before, with the hardhat task `set-tokenuri-crypto-marc` in the `tasks/random-crypto-marc` directory.

## Breeding

As you may have noticed, the layer config is set up with 3 parts. First part are layers of one character (wife), second part are layers of me, third part is a mix of both character layers. The last part is used to get random breed characters, by using the function `createBreed` in `src/main.js` like so:

```bash
npm run breed <image nr from first part> <image nr from second part>
```
Make sure to have at least 5 images per part generated, using the `npm run build2` command above.

Output is something like this:

```bash
% npm run breed 4 9

> marketplace-chainlink@0.1.0 breed
> node breed.js "4" "9"

arguments:  [ '4', '9' ]
traits1:  [
  '21', '24', '63',
  '85', '8',  '32',
  '84'
]
skills1:  [ '34', '23', '14' ]
traits2:  [
  '86', '58',
  '57', '53',
  '57', '16',
  '68'
]
skills2:  [ '15', '5', '10' ]
Mixing and randomizing traits & skills:
Traits:  [ '63', '8', '84', '58', '16' ]
Skills:  [ '15', '5', '10' ]
Tx success hash:  0x021517521723c54b0d4d43cbc1e92edef8aba4f90671662d3123df34321af2fc
Sleeping 120s for correct API response..
There was an error reading the Chainlink API response..
Tx success hash:  0x6a56cc3788241d54d7d55eda1b85bbfd2bd7d838005a5938fdd3f5c02b639603
Sleeping 120s for correct API response..
Skill:  CP-19501
Tx success hash:  0xc1b92332e2746a4bea5044c032f38a47972391874ea795fcb6e91f17ece8a874
Sleeping 120s for correct API response..
Skill:  CP-19501
Skills after call to Chainlink API Consumer:  [ 'CP-19501', 'CP-19501' ]
randNum:  7:01_BG_neutraal_3_#75.png-0:02_A_BASIS_#50.png-0:03_Annemieke_ogen_1_#100.png-1:04_Annemieke_mond_2_#50.png-0:06_Annemieke_kleding_1_#10.png
Created edition: breed, with DNA: 0210cb5b11e6335b014afb754cd07e2c9ac5e5c6
Token URI set with tx hash:  0x216100d7e6e370d08b842d702af7e2888f67f2a2f20016c551ed3e860434e50e
```

TokenURI is now set to the hardcoded tokenid 2, adjust according to your preferences.

As you can see, sometimes calling the API Consumer contract to get the right skill fails, maybe due to some congestion issues. Also the response could be lagging, check this by filling in the number (like '15' above) in the actual Web2 API endpoint:
``` bash
curl https://competenties.fnctn.nl/api/OP-15
```
and checking the `essentialCompetences` code