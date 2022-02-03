const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// General metadata for Ethereum
const namePrefix = "CryptoMarc";
const description = "Blending randomized traits and skills";
const baseUri = "gateway.pinata.cloud/ipfs/";

const ethereumMetadata = {
  symbol: "CRM",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "github.com/marc4gov",
  creators: [
    {
      address: "0x996ee16C7869ee1E1fc330DEF46F07Fbe84717Be",
      share: 100,
    },
  ],
};

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [

      { name: "01_BG" },
      { name: "02_BASIS_Annemieke" },
      { name: "03_Annemieke_Ogen" },
      { name: "04_Annemieke_Mond" },
      { name: "05_Annemieke_Zonnebril" },
      { name: "06_Annemieke_Kleding" },
      { name: "07_Annemieke_Baret" },
    ],
  },
  {
    growEditionSizeTo: 5,
    layersOrder: [

      { name: "01_BG" },
      { name: "02_BASIS_Marc" },
      { name: "03_Marc_Ogen" },
      { name: "04_Marc_Mond" },
      { name: "05_Marc_Zonnebril" },
      { name: "06_Marc_Kleding" },
      { name: "07_Marc_Beanies" },
      { name: "08_Marc_Hoodies" },
    ],
  },
  {
    growEditionSizeTo: 5,
    layersOrder: [

      { name: "01_BG" },
      { name: "02_BASIS" },
      { name: "03_Ogen" },
      { name: "04_Mond" },
      { name: "05_Zonnebril" },
      { name: "06_Kleding" },
      { name: "07_Hoofddeksel" },

    ],
  },

];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 192,
  height: 192,
  smoothing: false,
};

const gif = {
  export: false,
  repeat: 0,
  quality: 100,
  delay: 500,
};

const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

const pixelFormat = {
  ratio: 2 / 128,
};

const background = {
  generate: true,
  brightness: "80%",
  static: false,
  default: "#000000",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

const preview_gif = {
  numberOfImages: 5,
  order: "ASC", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
  namePrefix,
  network,
  ethereumMetadata,
  gif,
  preview_gif,
};
