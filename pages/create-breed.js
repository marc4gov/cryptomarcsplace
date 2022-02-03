import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import web3 from 'web3'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import RandomCryptoMarc from '../artifacts/contracts/RandomCryptoMarc.sol/RandomCryptoMarc.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Home() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function createSale(url) {
    const web3Modal = new Web3Modal({
      network: "kovan",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    
    let contract = new ethers.Contract(nftaddress, RandomCryptoMarc.abi, signer)
    let current_last_tokenId = await contract.getLastTokenId()
    let transaction = await contract.requestNewRandomCryptoMarc('CrytoMarc Breed')
    let tx = await transaction.wait()
    let last_tokenId = await contract.getLastTokenId()
    while (last_tokenId.toNumber() == current_last_tokenId.toNumber()) {
      last_tokenId = await contract.getLastTokenId()
      console.log('Waiting for NFT mint...')
    }
    let tokenId = last_tokenId.toNumber()
    const price = web3.utils.toWei(formInput.price, 'ether')
    const listingPrice = web3.utils.toWei('0.01', 'ether')

    let market_contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    transaction = await market_contract.createMarketItem(nftaddress, BigInt(tokenId), price, { value: listingPrice })

    await transaction.wait()
    router.push('/')
  }

  async function loadSale() {
    const web3Modal = new Web3Modal({
      network: "kovan",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    console.log("After signer: ", signer)
    let contract = new ethers.Contract(nftaddress, RandomCryptoMarc.abi, signer)
    let current_last_tokenId = await contract.getLastTokenId()
    console.log("After contract RandomCryptoMarc: ", current_last_tokenId.toNumber())

    let tokenId = 0
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    console.log("Market contract: ", contract)

    // for (let i = 1; i < current_last_tokenId.toNumber(); i++) {
      tokenId = 3
      console.log("TokenID: ", tokenId)
      let price = web3.utils.toWei('1', 'ether')
      let listingPrice = web3.utils.toWei('0.01', 'ether')
      transaction = await contract.createMarketItem(nftaddress, BigInt(tokenId), price)
      console.log("TokenID: ", tokenId)
      await transaction.wait()
    // }
    router.push('/')
  }

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error);
    }  
  }
  
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error);
    }  
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="NFT Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <input
          placeholder="NFT Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="NFT Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="NFT"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={createMarket} className="mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
          Create Breed NFT
        </button>
        <button onClick={loadSale} className="mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
          Load NFTs
        </button>
      </div>
    </div>
  )
}
