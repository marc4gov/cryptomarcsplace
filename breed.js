const basePath = process.cwd();
const buildDir = `${basePath}/build`;

const { createBreed, getSkills } = require(`${basePath}/src/main.js`);

let json1 = {}

// getting one of 1st layer and one of 2nd layer
var myArgs = process.argv.slice(2);
console.log('arguments: ', myArgs);
json1 = require(`${buildDir}/json/${myArgs[0]}.json`)
const traits1 = json1.properties.traits.split(",")
const skills1 = json1.properties.skills.split(",")
json1 = require(`${buildDir}/json/${myArgs[1]}.json`)
const traits2 = json1.properties.traits.split(",")
const skills2 = json1.properties.skills.split(",")
console.log('traits1: ', traits1);
console.log('skills1: ', skills1);
console.log('traits2: ', traits2);
console.log('skills2: ', skills2);
// check traits and skills
console.log('Mixing and randomizing traits & skills:');

// API Consumer contract is 0x5C006617eC722Ff755387CfB4363F720D40afD70
(() => {
  createBreed(traits1, traits2, skills1, skills2, "0x5C006617eC722Ff755387CfB4363F720D40afD70", myArgs);
})();
