const basePath = process.cwd();
const fs = require("fs");

const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  ethereumMetadata,
  gif,
} = require(`${basePath}/src/config.js`);

require('dotenv').config()

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.PINATA_USER, process.env.PINATA_KEY);

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const getRarityWeight2 = () => {
  return Math.floor(Math.random()*100);
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassDNA:
      layerObj.options?.["bypassDNA"] !== undefined
        ? layerObj.options?.["bypassDNA"]
        : false,
  }));
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const pinataOptions = (_editionCount, image=true) => {
  let name = _editionCount
  if (image) {
    name = `${_editionCount} image`
  }
  const options = {
      pinataMetadata: {
          name: `CryptoMarc ${name}`,
          keyvalues: {
              customKey: `${name}`,
              customKey2: 'ChainLink demo'
          }
      },
      pinataOptions: {
          cidVersion: 0
      }
  };
  return options
}

const saveImageToIPFS = async (_editionCount) => {
  const readableStreamForFile = fs.createReadStream(`${buildDir}/images/${_editionCount}.png`);
  let result = await pinata.pinFileToIPFS(readableStreamForFile, pinataOptions(_editionCount))
  return result.IpfsHash
};

const saveJSONToIPFS = async (_editionCount) => {
  const readableStreamForFile = fs.createReadStream(`${buildDir}/json/${_editionCount}.json`);
  let result = await pinata.pinFileToIPFS(readableStreamForFile, pinataOptions(_editionCount, false))
  return result.IpfsHash
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addProperties = () => {

}


const addMetadata = (_dna, _edition, IpfsHash, traits, skills) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
    dna: sha1(_dna),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    compiler: "HashLips Art Engine",
  };
  tempMetadata = {
      //Added metadata for ethereum
      name: tempMetadata.name,
      symbol: ethereumMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for ete
      seller_fee_basis_points: ethereumMetadata.seller_fee_basis_points,
      image: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
      external_url: ethereumMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: attributesList,
      properties: {
        traits: traits.toString(),
        skills: skills.toString(),
        files: [
          {
            uri: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: ethereumMetadata.creators,
      },
  };
  
  metadataList.push(tempMetadata);
  attributesList = [];
}

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  return new Promise(async (resolve) => {
    // console.log(_layer)
    const image = await loadImage(`${_layer.selectedElement.path}`);
    resolve({ layer: _layer, loadedImage: image });
  });
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height
      );

  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = "", _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    // console.log(_dna.split(DNA_DELIMITER)[index])
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

// const createDna = (_layers) => {
//   let randNum = [];
//   _layers.forEach((layer) => {
//     var totalWeight = 0;
//     layer.elements.forEach((element) => {
//       totalWeight += element.weight;
//     });
//     // number between 0 - totalWeight
//     let random = Math.floor(Math.random() * totalWeight);
//     for (var i = 0; i < layer.elements.length; i++) {
//       // subtract the current weight from the random weight until we reach a sub zero value.
//       random -= layer.elements[i].weight;
//       if (random < 0) {
//         return randNum.push(
//           `${layer.elements[i].id}:${layer.elements[i].filename}${
//             layer.bypassDNA ? "?bypassDNA=true" : ""
//           }`
//         );
//       }
//       if (i == (layer.elements.length-1)) {
//         return randNum.push(
//           `${layer.elements[i].id}:${layer.elements[i].filename}${
//             layer.bypassDNA ? "?bypassDNA=true" : ""
//           }`
//         );
//       }
//     }
//   });
//   return randNum.join(DNA_DELIMITER);
// };

const createDnaRandom = (_layers, attributes) => {
  let randNum = [];
  let j = 0
  let randomNumber
  _layers.forEach((layer) => {
    randomNumber = attributes[j]
    // console.log("randomNumber: ", randomNumber.toString())

    j++
    var maxdiff = 100
    var diff = 0
    var selected = 0
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach closest value.
      diff = Math.abs(randomNumber - layer.elements[i].weight);
      if (diff < maxdiff) {
        // console.log("MAxdiff: ", maxdiff)
        maxdiff = diff
        selected = i
      }
      if (i == (layer.elements.length-1)) {
        return randNum.push(
          `${layer.elements[selected].id}:${layer.elements[selected].filename}${
            layer.bypassDNA ? "?bypassDNA=true" : ""
          }`
        );
      }
    }
  });
  res = randNum.join(DNA_DELIMITER)
  console.log("randNum: ", res )
  return res;
};


const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

// function shuffle(array) {
//   let currentIndex = array.length,
//     randomIndex;
//   while (currentIndex != 0) {
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex],
//       array[currentIndex],
//     ];
//   }
//   return array;
// }

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// need to wait for the API Consumer contract to show the correct value
async function sleep(fn, ...args) {
  await timeout(120000);
  return fn(...args);
}


const arrayRemove = (arr, value) => { 
    
  return arr.filter(function(ele){ 
      return ele != value; 
  });
}

const createBreed = async (traits1, traits2, skills1, skills2, contractAddr, args) => {
  let layerConfigIndex = 2;
  let randomElement;
  let traits = []
  let skills = []
  
  traits = traits1.concat(traits2)
  skills = skills1.concat(skills2)
  
  while (traits.length > 5) {
    randomElement = traits[Math.floor(Math.random() * traits.length)];
    traits = arrayRemove(traits, randomElement)
  }
  while (skills.length > 3) {
    randomElement = skills[Math.floor(Math.random() * skills.length)];
    skills = arrayRemove(skills, randomElement)
  }
  console.log("Traits: ", traits)
  console.log("Skills: ", skills)
  
  const skillsAPI = await getChainlinkSkills(contractAddr, skills)
  console.log("Skills after call to Chainlink API Consumer: ", skillsAPI)
  const layers = layersSetup(
    layerConfigurations[layerConfigIndex].layersOrder
  );
  


  let newDna = createDnaRandom(layers, traits);
  let results = constructLayerToDna(newDna, layers);
  let loadedElements = [];
  // console.log("Results: ", results)
  results.forEach((layer) => {
    loadedElements.push(loadLayerImg(layer));
  });

  await Promise.all(loadedElements).then((renderObjectArray) => {
    debugLogs ? console.log("Clearing canvas") : null;
    ctx.clearRect(0, 0, format.width, format.height);
    if (gif.export) {
      hashlipsGiffer = new HashlipsGiffer(
        canvas,
        ctx,
        `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
        gif.repeat,
        gif.quality,
        gif.delay
      );
      hashlipsGiffer.start();
    }
    if (background.generate) {
      drawBackground();
    }
    renderObjectArray.forEach((renderObject, index) => {
      drawElement(
        renderObject,
        index,
        layerConfigurations[layerConfigIndex].layersOrder.length
      );
      if (gif.export) {
        hashlipsGiffer.add();
      }
    });
    if (gif.export) {
      hashlipsGiffer.stop();
    }
    console.log(
      `Created edition: breed, with DNA: ${sha1(
        newDna
      )}`
    );
  });
  const name = "breed_" + args[0] + "_" + args[1]
  saveImage(name);
  const IpfsHash = await saveImageToIPFS(name);
  addMetadata(newDna, name, IpfsHash, traits, skillsAPI);
  saveMetaDataSingleFile(name);
  const Ipfs2 = await saveJSONToIPFS(name);
  // RandomCryptoMarc contract is 0x048CEa05C2Fc3157d3a487679167901a56946724
  await setTokenURI("0x048CEa05C2Fc3157d3a487679167901a56946724", 2, Ipfs2);
}

const setTokenURI = async(contractAddr, tokenid, ipfshash) => {
  const uri = `https://gateway.pinata.cloud/ipfs/${ipfshash}`
  const RandomCryptoMarc = await hre.ethers.getContractFactory("RandomCryptoMarc")
  //Get signer information
  const provider = hre.ethers.getDefaultProvider('kovan', {
    alchemy: process.env.KOVAN_RPC_URL,
  });
  // A Signer from a private key
  let privateKey = process.env.PRIVATE_KEY;
  let wallet = new hre.ethers.Wallet(privateKey, provider)
  const RandomCryptoMarcContract = new hre.ethers.Contract(contractAddr, RandomCryptoMarc.interface, provider)
  const randomCryptoMarcContract = RandomCryptoMarcContract.connect(wallet)
  let tx = await randomCryptoMarcContract.setTheURI(BigInt(tokenid), uri, {gasPrice: hre.ethers.utils.parseUnits('100', 'gwei'), gasLimit: 1000000});
  console.log("Token URI set with tx hash: ", tx.hash)
}

const generateNumbers = (times) => {
  numbers = []
  while (times > 0) {
    numbers.push(Math.floor((Math.random() * 90) + 10))
    times--;
  }
  return numbers
}

const startCreating = async () => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  let traits = []
  let skills = []
  let count = 1;

  // get random numbers from the Chainlink VRF
  // randomNumbers = await getRandomNumbers("0x048CEa05C2Fc3157d3a487679167901a56946724")
  randomNumbers = [] 
  
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );

    console.log("ConfigIndex: ", layerConfigIndex)
    
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      abstractedIndexes.push(count)
      tr = 
      randomNumbers.push(generateNumbers(8))
      traits = randomNumbers[count-1]
      console.log("Traits: ", traits.toString())
      skills = randomNumbers[count-1]
      let newDna = createDnaRandom(layers, randomNumbers[count-1]);
      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];
        // console.log("Results: ", results)
        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            hashlipsGiffer = new HashlipsGiffer(
              canvas,
              ctx,
              `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            hashlipsGiffer.start();
          }
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length
            );
            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
              newDna
            )}`
          );
        });
        const IpfsHash = await saveImageToIPFS(abstractedIndexes[0]);
        addMetadata(newDna, abstractedIndexes[0], IpfsHash, traits, skills);
        saveMetaDataSingleFile(abstractedIndexes[0]);
        dnaList.add(filterDNAOptions(newDna));
        editionCount++;
        count++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    editionCount = 1;
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, createBreed, buildSetup, getElements };
