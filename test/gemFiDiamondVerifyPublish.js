/* global describe it before ethers */

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;

const { EIP712Domain, domainSeparator } = require('./helpers/eip712');

const { deployDiamond } = require('../scripts/deploy.js')

const { assert } = require('chai');
const { toBuffer } = require('ethereumjs-util');

const solc = require('solc')
const fs = require('fs')


describe('gemFiDiamondVerifyPublish', async function () {
  let tokenFacet
  let receipt
  let accounts = []

  before(async function () {
    accounts = await ethers.getSigners()
  })

  it('should Verify and Publish', async () => {
    console.log("=======================Verify and Publish Start=======================");

    var CONTRACT_FILE = "./contracts/facets/HelloWorld.sol";
    const content = fs.readFileSync(CONTRACT_FILE).toString()

    const input = {
      language: 'Solidity',
      sources: {
        "HelloWorld.sol" : {
          content: content
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    }

    console.log(JSON.stringify(input))
    const output = JSON.parse(solc.compile(JSON.stringify(input)))

    for (const contractName in output.contracts[CONTRACT_FILE]) {
      console.log(output.contracts[CONTRACT_FILE][contractName].evm.bytecode.object)
    }


    console.log("=======================Verify and Publish End=======================");
  })
})



