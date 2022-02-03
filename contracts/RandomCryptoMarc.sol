// contracts/RandomCryptoMarc.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract RandomCryptoMarc is ERC721URIStorage, VRFConsumerBase, Ownable {
    using SafeMath for uint256;
    using Strings for string;
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    address marketplaceAddress;

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    address public VRFCoordinator;
    // rinkeby: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
    address public LinkToken;
    // rinkeby: 0x01BE23585060835E02B77ef475b0Cc51aA1e0709a
    
    struct Attributes {
        uint256 background;
        uint256 face;
        uint256 mouth;
        uint256 eyes;
        uint256 hair;
        uint256 glasses;
        uint256 hat;
    }
    
    struct Competences {
        uint256 competence1;
        uint256 competence2;
        uint256 competence3;
    }
    
    struct CryptoMarc {
        uint256 id;
        string name;
    }
    
    CryptoMarc[] public cryptomarcs;
    
    mapping(uint256 => Attributes) public attributes;
    mapping(uint256 => Competences) public competences;
    

    mapping(bytes32 => string) requestCToName;
    mapping(bytes32 => address) requestToSender;
    mapping(bytes32 => uint256) requestToTokenId;

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor(address _VRFCoordinator, address _LinkToken, bytes32 _keyhash, address marketplace)
        public
        VRFConsumerBase(_VRFCoordinator, _LinkToken)
        ERC721("CryptoMarc", "MARC")
    {   
        VRFCoordinator = _VRFCoordinator;
        LinkToken = _LinkToken;
        keyHash = _keyhash;
        fee = 0.1 * 10**18; // 0.1 LINK
        marketplaceAddress = marketplace;
    }

    function requestNewRandomCryptoMarc(string memory name) public returns (bytes32) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        bytes32 requestId = requestRandomness(keyHash, fee);
        requestCToName[requestId] = name;
        requestToSender[requestId] = msg.sender;
        return requestId;
    }

    function expand(uint256 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
        expandedValues = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
        }
        return expandedValues;
    }

    event CryptoMarcCreated (
      uint indexed cmId,
      string name
    );

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
        internal
        override
    {
        randomResult = randomNumber;

        uint256[] memory numbers = expand(randomNumber, 7);

        _tokenIds.increment();

        uint256 newId = _tokenIds.current();
        uint256 background = (numbers[0] % 90);
        uint256 face = (numbers[1] % 80);
        uint256 mouth = (numbers[2] % 70);
        uint256 eyes = (numbers[3] % 90);
        uint256 hair = (numbers[4] % 80);
        uint256 glasses = (numbers[5] % 70);
        uint256 hat = (numbers[6] % 90);
        
        attributes[newId] = Attributes( 
                background,
                face,
                mouth,
                eyes,
                hair,
                glasses,
                hat
                );
                
        competences[newId] = Competences(
            (numbers[0] % 69) + 1,
            (numbers[1] % 69) + 1,
            (numbers[2] % 69) + 1
        );

        cryptomarcs.push(
            CryptoMarc(
                newId,
                requestCToName[requestId]
            )
        );
        _safeMint(requestToSender[requestId], newId);
        _setTokenURI(newId, "");
        setApprovalForAll(marketplaceAddress, true);
        emit CryptoMarcCreated(newId, requestCToName[requestId]);
    }

    function setTheURI(uint256 tId, string memory tUri) public {
        _setTokenURI(tId, tUri);
    }

    function getNumberOfCryptoMarcs() public view returns (uint256) {
        return cryptomarcs.length; 
    }

    function getLastTokenId() public view returns (uint256) {
        return _tokenIds.current(); 
    }

}