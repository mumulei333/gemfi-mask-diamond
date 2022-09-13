/* global describe it before ethers */

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;

const { EIP712Domain, domainSeparator } = require('../test/helpers/eip712');

const { deployDiamond } = require('../scripts/deploy.js')

const { assert } = require('chai');
const { toBuffer } = require('ethereumjs-util');


const fs = require('fs')


describe('GemFiDiamondTest', async function () {
  let diamondAddress
  let diamondCutFacet
  let diamondLoupeFacet
  let ownershipFacet
  let pausableFacet
  let royaltyFacet
  let exchangeFacet
  let tokenFacet
  let tx
  let receipt
  let result
  const addresses = []
  let accounts = []


  before(async function () {
    accounts = await ethers.getSigners()
    diamondAddress = "0x93a19FF2Cb6c8c24B27492Ce1995BcCcBdb812eE"// await deployDiamond()
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
    ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress)
    pausableFacet = await ethers.getContractAt('PausableFacet', diamondAddress)
    royaltyFacet = await ethers.getContractAt('RoyaltyFacet', diamondAddress)
    exchangeFacet = await ethers.getContractAt('ExchangeFacet', diamondAddress)
    tokenFacet = await ethers.getContractAt('TokenFacet', diamondAddress)

  })

  // it('should have three facets -- call to facetAddresses function', async () => {
  //   let facet = await diamondLoupeFacet.facetAddresses();
  //   console.log("Facet数量：" + facet.length)
  //   for (const address of await diamondLoupeFacet.facetAddresses()) {
  //     addresses.push(address)
  //   }
  //   assert.equal(addresses.length, 7)
  // })

  // it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
  //   let selectors = getSelectors(diamondCutFacet)
  //   result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0])
  //   assert.sameMembers(result, selectors)
  //   selectors = getSelectors(diamondLoupeFacet)
  //   result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1])
  //   assert.sameMembers(result, selectors)
  //   selectors = getSelectors(ownershipFacet)
  //   result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2])
  //   assert.sameMembers(result, selectors)
  // })

  // it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
  //   assert.equal(
  //     addresses[0],
  //     await diamondLoupeFacet.facetAddress('0x1f931c1c')
  //   )
  //   assert.equal(
  //     addresses[1],
  //     await diamondLoupeFacet.facetAddress('0xcdffacc6')
  //   )
  //   assert.equal(
  //     addresses[1],
  //     await diamondLoupeFacet.facetAddress('0x01ffc9a7')
  //   )
  //   assert.equal(
  //     addresses[2],
  //     await diamondLoupeFacet.facetAddress('0xf2fde38b')
  //   )
  // })


  // it('should test TokenFacet function safeMint', async () => {
  //   console.log("=======================TestsafeMint Start=======================" + accounts[0].address);
  //   const safeMintTx = await tokenFacet.safeMint(accounts[0].address, 5);
  //   receipt = await safeMintTx.wait()
  //   if (!receipt.status) {
  //     throw Error(`tokenFacet safeMint failed: ${safeMintTx.hash}`)
  //   }
  //   console.log("=======================TestsafeMint End=======================" + JSON.stringify(safeMintTx));

  //   const balanceOfTx = await tokenFacet.balanceOf(accounts[0].address);
  //   // call函数获取返回值的方式
  //   console.log("数据:" + balanceOfTx.toString());

  //   console.log("=======================TestSell Start=======================");
  //   const sellTx = await exchangeFacet.sell(1, 1000000000);
  //   receipt = await sellTx.wait()
  //   if (!receipt.status) {
  //     throw Error(`exchangeFacet Sell failed: ${sellTx.hash}`)
  //   }
  //   console.log("=======================TestSell End=======================" + JSON.stringify(sellTx));

  // })


  // 生成签名方法
  it('should test TokenFacet function generateSignature', async () => {
    var dataPath = "/Users/mumu/document/exchange/GemFi/mask_whitelist/blueChip_Holders";
    var dataDir = fs.readdirSync(dataPath);
    console.log("dataDir: " + JSON.stringify(dataDir))

    for (let index = 1; index < dataDir.length; index++) {
      // 0 index 的文件为系统文件 .DS_Store
      const dataName = dataDir[index];
      console.log("dataName: " + dataName)

      var dataExists = fs.existsSync(dataPath + "/" + dataName + "_Whitelist");
      console.log("dataExists: " + dataExists)
      if (dataExists || dataName.indexOf("_Whitelist") > 0) {
        console.log("已跳过: " + dataName)
        continue;
      }
      
      var readMe = fs.readFileSync(dataPath + "/" + dataName,"utf-8");
      var signerAddressList = readMe.split(",");
      // const signerAddressList = ["0x3fD20131D63649C08FeEBF7f2F80D1F458bda2f3"];
      console.log("=======================TestGenerateSignature Start=======================");
      let chainTx = await tokenFacet.getChainId();
      const chainId = chainTx.toHexString();
      const name = await tokenFacet.name();
      const version = await tokenFacet.getVersion();
      const description = await tokenFacet.getDescription();
      const verifyingContract = tokenFacet.address;

      const message = {
        to: "",
        contents: description,
      };

      const data = {
        types: {
          EIP712Domain,
          Mask: [ { name: 'to', type: 'address' }, { name: 'contents', type: 'string' }],
        },
        domain: { name, version, chainId, verifyingContract },
        primaryType: 'Mask',
        message,
      };

      // console.log("data JSON: " + JSON.stringify(data));
      const wallet = new Wallet(Buffer.from(process.env.TEST_SIGNATURE_PRIVATE_KEY, 'hex'))
      const signerJson = {
        signerAddress: "",
        signature: "",
      };

      var writeData = "";
      for (const signerAddress of signerAddressList) {
        data.message.to = signerAddress;
        const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });

        signerJson.signerAddress = signerAddress;
        signerJson.signature = signature;
        writeData = writeData + JSON.stringify(signerJson) + "\n"
        // console.log(JSON.stringify(signerJson));
      }
      fs.writeFileSync(dataPath + "/" + dataName + "_Whitelist", writeData); 
    }
    

    console.log("=======================TestGenerateSignature End=======================");
  })


  // it('should test TokenFacet function balance', async () => {
  //   console.log("获取文本数据")
  //   var readMe = fs.readFileSync("test/test.txt","utf-8");
  //   // console.log('readMe: ' + readMe)
  //   var testArr = readMe.split(",");
  //   console.log("testArr: " + testArr.length);
  //   var index = 0;
  //   for (const address of testArr) {
  //     console.log(address)
  //     const balance = await ethers.provider.getBalance(address);
  //     console.log(ethers.utils.formatEther(balance), "ETH");
  //     if (index == 100) {
  //       return;
  //     }
  //   }
  // })


  // it('should test TokenFacet function mint', async () => {
  //   const [contractOwner, signer] = accounts;
  //   console.log("=======================TestsafeMint Start=======================" + contractOwner.address );
  //   let chainTx = await tokenFacet.getChainId();
  //   const chainId = chainTx.toHexString();
  //   const name = await tokenFacet.name();
  //   const version = await tokenFacet.getVersion();
  //   const description = await tokenFacet.getDescription();
  //   const verifyingContract = tokenFacet.address;
  //   const message = {
  //     to: contractOwner.address,
  //     contents: description,
  //   };

  //   const data = {
  //     types: {
  //       EIP712Domain,
  //       Mask: [ { name: 'to', type: 'address' }, { name: 'contents', type: 'string' }],
  //     },
  //     domain: { name, version, chainId, verifyingContract },
  //     primaryType: 'Mask',
  //     message,
  //   };

  //   // console.log("data JSON: " + JSON.stringify(data));

  //   console.log("xxxx");
  //   const wallet = new Wallet(Buffer.from("4b4a000ccd857db9d910f606c0449c501fcdbf037a18060518735fd92ce5ecab", 'hex'))
  //   console.log("wallet JSON: " + JSON.stringify(wallet));
  //   // const setTx = await tokenFacet.setWhitelistingSignatureAddress(signer.address)
  //   // receipt = await setTx.wait()
  //   // if (!receipt.status) {
  //   //   throw Error(`tokenFacet setTx failed: ${setTx.hash}`)
  //   // }
    
  //   const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });

  //   console.log("signature: " + signature);
  //   const mintTx = await tokenFacet.mintPublic(5, signature, { gasLimit: 800000 });
  //   receipt = await mintTx.wait()
  //   if (!receipt.status) {
  //     throw Error(`tokenFacet mint failed: ${mintTx.hash}`)
  //   }
  //   console.log("=======================TestsafeMint End=======================");

  //   const balanceOfTx = await tokenFacet.balanceOf(accounts[0].address);
  //   // call函数获取返回值的方式
  //   console.log("数据:" + balanceOfTx.toString());

  //   console.log("=======================TestSell Start=======================");
  //   const sellTx = await exchangeFacet.sell(1, 1000000000);
  //   receipt = await sellTx.wait()
  //   if (!receipt.status) {
  //     throw Error(`exchangeFacet Sell failed: ${sellTx.hash}`)
  //   }
  //   console.log("=======================TestSell End=======================" + sellTx.hash);

  // })


  // it('should add test1 functions', async () => {
  //   const Test1Facet = await ethers.getContractFactory('Test1Facet')
  //   const test1Facet = await Test1Facet.deploy()
  //   await test1Facet.deployed()
  //   addresses.push(test1Facet.address)
  //   const selectors = getSelectors(test1Facet).remove(['supportsInterface(bytes4)'])
  //   tx = await diamondCutFacet.diamondCut(
  //     [{
  //       facetAddress: test1Facet.address,
  //       action: FacetCutAction.Add,
  //       functionSelectors: selectors
  //     }],
  //     ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
  //   receipt = await tx.wait()
  //   if (!receipt.status) {
  //     throw Error(`Diamond upgrade failed: ${tx.hash}`)
  //   }
  //   result = await diamondLoupeFacet.facetFunctionSelectors(test1Facet.address)
  //   // console.log("这个facet的Function集合" + result);
  //   // 该函数为判断两个数组是否长度一致的断言函数
  //   assert.sameMembers(result, selectors)
  // })

  // it('should test function call', async () => {
  //   const test1Facet = await ethers.getContractAt('Test1Facet', diamondAddress)
  //   const tx = await test1Facet.test1Func10();
  //   // call函数获取返回值的方式
  //   console.log("数据:" + tx.toString());
  // })

  
})



