var source = "__SOURCE__";

// sleep a bit, to gain ether for account[0], to pay for deployment
console.log('************* Sleeping a bit to gain ether for deployment *******');
admin.sleepBlocks(1);
console.log('************* Done **********************************************');

// we're going to unlock accounts[0] and use it to make the etherbbs object, and register prototypes
// of the other contracts (they're really like classes)
var thing;

personal.unlockAccount(eth.accounts[0], "");
 
var compiled_source = eth.compile.solidity(source);

var compiled_bbs = compiled_source.EtherBBS;

var bbs_contract = eth.contract(compiled_bbs.info.abiDefinition);
// this instantiates the class into an object on the blockchain
var bbs = bbs_contract.new({ from:eth.accounts[0], data: compiled_bbs.code, gas: 3000000});

var compiled_container = compiled_source.BBSContainer;
var BBSContainer = eth.contract(compiled_container.info.abiDefinition);

var compiled_forum = compiled_source.BBSForum;
var BBSForum = eth.contract(compiled_forum.info.abiDefinition);

var compiled_account = compiled_source.BBSAccount;
var BBSAccount = eth.contract(compiled_account.info.abiDefinition);

var compiled_post = compiled_source.BBSPost;
var BBSPost = eth.contract(compiled_post.info.abiDefinition);

// sleep a bit to let all that finalize on the blockchain
admin.sleepBlocks(2);

function test() {
  distributeEther();
  admin.sleepBlocks(2);
  pass1();
  pass2();
  pass3();
  pass4();
  pass5();
  admin.sleepBlocks(2);
  distributeEther();
  console.log("\x1b[32m", "**************************************************");
  console.log("\x1b[32m", "Mined EtherBBS instance at ");
  console.log("\x1b[31m", "\t" + bbs.address);
  console.log("\x1b[32m", "Find the EtherBBS ABI definition, and all the others, in contracts/binaries");
  return true;
}

// this helps us spread out ether to the other 4 accounts.
// accounts[1] will be registered to user holdor at the end of the staging run.
// accounts accounts[2], accounts[3] and accounts[4] are also there for you to play with.
function distributeEther() {
  accounts = eth.accounts;
  shareAmount = eth.getBalance(eth.accounts[0]) / eth.accounts.length;
  for (i=1; i < eth.accounts.length; i++) {
    console.log("sending " + web3.fromWei(shareAmount, 'ether') + " ether to account " + i);
    eth.sendTransaction({from:eth.accounts[0], to:eth.accounts[i], value: shareAmount});
  }
}


function pass1() {
  /* This is a story about a BBS. */

  passMsg(1);

  // does the bbs have any child containers?
  assert(bbs.isLeaf() == true, 
      "isLeaf(): should tell whether a BBSContainer is a leaf",
      '');

  // we're going to do a write transaction from account[1], so we'd better unlock it.  I don't think personal.unlock is available from web3. 
  // to the best of my knowledge, the sendTransaction() method will open up a dialog where you can enter the passphrase.  let me know if that's not true?
  personal.unlockAccount(eth.accounts[1], "");

  cost = bbs.createUser.estimateGas("hodlor", eth.accounts[1], {from: eth.accounts[1], gas: 3000000});
  console.log('Gas cost for createUser: ' + cost)
 
  // accounts[1] will be registered to 'hodlor', with the staking address accounts[1].  staking is not in the MVP.  you can send 0x0 or any address you wish.
  bbs.createUser.sendTransaction("hodlor", eth.accounts[1], {from: eth.accounts[1], gas: 3000000});

 // we're going to make some forums next, which only god (the owner of the bbs object) can do (so far).  so we have to unlock accounts[0]
  personal.unlockAccount(eth.accounts[0], "");

  //make a couple accounts
  bbs.addForum.sendTransaction("General discussion of the platform and ecosystem", "Ethereum", {from: eth.accounts[0], gas: 3000000});

  bbs.addForum.sendTransaction("Platform and Dapp development discussions", "EthDev", {from: eth.accounts[0], gas: 3000000});

  // sleep a bit, to ensure that the next forum will be the last in the series.  We'll be checking this later.
  admin.sleepBlocks(2);

  bbs.addForum.sendTransaction("Trading and Markets discussions", "EthMarkets", {from: eth.accounts[0], gas: 3000000});

  // sleep some more blocks to make sure all transactions are well processed before the next pass is run.
  admin.sleepBlocks(3);
}



function pass2() {
  passMsg(2);
  /* RECV ********************************************/

  // ask for the address that is registered to the account accounts[1].  you'll get back 0x0 if the account is not registered.
  account_addr = bbs.myAccount({from: eth.accounts[1]});

  // this gives you the account object, which you can call methods on.
  account = BBSAccount.at(account_addr);

  // it better be 'hodlor'
  assert(account.tag() == 'hodlor', 
      'createUser should create an account',
      "found tag: " + account.tag()
      );

  // the bbs object's children are forums.  this should have an index of 2, since we made 3 of them.
  assert(bbs.lastChildIndex() == 2,
      "lastChildIndex() should be able to retrieve last topic index",
      "got: " + bbs.lastChildIndex()
      );

  // give us a size 20 page of the BBS' children. 
  forums = bbs.page20(bbs.lastChildIndex(), 0);

  // This gives us the last forum address on the BBS, since page20 sends you the most recently created child at index 0
  forum = forums[0];

  lastForum = BBSForum.at(forum);

  assert(lastForum.title() == "EthMarkets",
      "Last forum should be registered",
      "got: " + lastForum.title()
      );


  lastForum = BBSPost.at(forum);

  assert(lastForum.title() == "EthMarkets",
      "Should be able to cast an object to its superclass",
      "got: " + lastForum.title()
      );



  /* SEND *************************************/

  // not in the MVP.  I'm changing the registered staking address for the hodlor account to accounts[0].
  account.registerStakingAddress.sendTransaction(eth.accounts[0], {from: eth.accounts[1], gas: 3000000});

  // we're going to send transactions from accounts[1] next, so we have to unlock it.
  personal.unlockAccount(eth.accounts[1], "");

  // this request should fail, since accounts[1] already made an account called 'hodlor'
  bbs.createUser.sendTransaction("kayagoban", eth.accounts[1], {from: eth.accounts[1], gas: 3000000});

  personal.unlockAccount(eth.accounts[2], "");
  // this request should succeed, since accounts[2] has no bbs user account
  bbs.createUser.sendTransaction("kayagoban", 0x0, {from: eth.accounts[2], gas: 3000000});


  personal.unlockAccount(eth.accounts[1], "");

  // we're going to add a topic to the last forum.
  bbs.addTopic.sendTransaction(forum, "Lorem ipsum blah blah blergh text",  "Details about new release", {from: eth.accounts[1], gas: 3000000});

  // let's add a bunch of topics.
  for (i = 0; i < 25; i++) {
    bbs.addTopic.sendTransaction(forum, "Samuel L. Ipsum blah blah",  "New version of Mist Available", {from: eth.accounts[1], gas: 3000000});
  }

  // process the requests.
  admin.sleepBlocks(2);

  // make one more topic.  the previous sleepBlocks call should ensure this is the last topic to be processed.
  bbs.addTopic.sendTransaction(forum, "Lorem ipsum blah blah blergh text",  "The Last Topic", {from: eth.accounts[1], gas: 3000000});


  // make sure they're all well processed.
  admin.sleepBlocks(5);
}

function pass3() {
  passMsg(3);

  // let's grab the user associated with accounts[1]
  account_addr = bbs.myAccount({from: eth.accounts[1]});
  account = BBSAccount.at(account_addr);

  // it better still be hodlor, because the request to make kayagoban should have failed.
  assert(account.tag() == 'hodlor', 
      'createUser should not overwrite your account if already created',
      "found tag: " + account.tag()
      );

  // let's unlock accounts[2] now.
  personal.unlockAccount(eth.accounts[2], "");

  // let's grab the user associated with accounts[2]
  account2_addr = bbs.myAccount({from: eth.accounts[2]});
  account2 = BBSAccount.at(account2_addr);

  assert(account2.tag() == 'kayagoban', 
      'createUser should create the second account',
      "found tag: " + account2.tag()
      );

  // kayagoban doesn't like the cut of hodlor's jib.  block that goober.
  account2.addBlock(account.address, {from: eth.accounts[2]} ); 
  //adding another for the fuck of it
  account2.addBlock(account2.address, {from: eth.accounts[2]} ); 


  personal.unlockAccount(eth.accounts[1], "");

  // NOT IN MVP  - the staking address should have been updated.
  assert(account.stakingAddress() == accounts[0], 
      'should register staking address',
      "found staking address: " + account.stakingAddress()
      );

  //Grab BBS last forum.
  forum = BBSForum.at(bbs.lastChild());

  // grab the index of the last topic from the last forum.
  ci = forum.lastChildIndex();

  // get the first page of topics from the last forum.
  topics = forum.page20(ci, 0); 

  // get the topic object.  it should be at the address topics[0]
  lastTopic = BBSPost.at(topics[0]);

  // make sure it really is the last topic we created.
  assert( lastTopic.title() == 'The Last Topic', 
      'page20() should be able to retrieve last topic index',
      "got: " + lastTopic.title()
      );

  // Get next page of 20 (there should be 7 topics remaining)
  topics = forum.page20(ci, 1); 

  // grab that last topic.
  lastTopic = BBSPost.at(topics[6]);

  // topics[6] should be an address, but topics[7] should be 0x0
  assert(topics[6] !="0x0000000000000000000000000000000000000000" && topics[7] == "0x0000000000000000000000000000000000000000",
      "second page of page20() should have correct count",
      "got lastTopic.title(): " + lastTopic.title() + ' and topicAddresses: ' + topics
      );
  
  /* SEND **********/

  // NOT IN MVP - here I'm validating the staking address for user 'hodlor'
  personal.unlockAccount(eth.accounts[0], "");
  eth.sendTransaction({to: account.address, from: eth.accounts[0], gas: 300000, value: 1})

  personal.unlockAccount(eth.accounts[1], "");

  // grab the first and last topics on the last forum.
  lastTopic = BBSPost.at(forum.lastChild());
  firstTopic = BBSPost.at(forum.firstChild());

  // add some posts to the last topic.
  cost = bbs.addPost.estimateGas(lastTopic.address, "1I have an opinion about this and blah blah blh blah blha", {from: eth.accounts[1], gas: 28000});
  console.log('Gas cost for addPost: ' + cost)
 
  bbs.addPost.sendTransaction(lastTopic.address, "1I have an opinion about this and blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});
  bbs.addPost.sendTransaction(lastTopic.address, "1No, you are wrong;  blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});
  bbs.addPost.sendTransaction(lastTopic.address, "1OMGLOLWTFBBQ", {from: eth.accounts[1], gas: 3000000});

  // add some posts to the first topic.
  bbs.addPost.sendTransaction(firstTopic.address, "2I have an opinion about this and blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});
  bbs.addPost.sendTransaction(firstTopic.address, "2No, you are wrong;  blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});
  bbs.addPost.sendTransaction(firstTopic.address, "2OMGLOLWTFBBQ", {from: eth.accounts[1], gas: 3000000});

  // process
  admin.sleepBlocks(3);
}

function pass4() {
  passMsg(4);

  account_addr = bbs.myAccount({from: eth.accounts[1]});
  account = BBSAccount.at(account_addr);

  personal.unlockAccount(eth.accounts[2], "");
  // let's grab the user associated with accounts[2]
  account2_addr = bbs.myAccount({from: eth.accounts[2]});
  account2 = BBSAccount.at(account2_addr);

  /*
  assert(account2.lastBlockIndex({from: eth.accounts[2]}) == 0, 
      'blocklistLastItemIndex should return 0',
      "got: " + account2.lastBlockIndex({from: eth.accounts[2]})
      );
      */

  blocklist = account2.blocklist();
  thing = blocklist;

  /*
  assert(blocklist[0] == account.address, 
      'should retrieve the address of user hodlor',
      "got: " + blocklist[0]
      );
*/
  personal.unlockAccount(eth.accounts[1], "");

  assert(account.stakeVerified() == true, 
      "account stake should be verified",
      "account was not verified"
      );

  forum = BBSForum.at(bbs.lastChild());

  lastTopic = BBSPost.at(forum.lastChild());
  firstTopic = BBSPost.at(forum.firstChild());

  testPost = BBSPost.at(lastTopic.firstChild());
  otherPost = BBSPost.at(lastTopic.firstChild());

  assert(
    bbs.lastChild() != lastTopic.firstChild(),
      "crazy shit should not happen",
      "found crazy shit." 
      );

  assert(
      testPost.text() == "1I have an opinion about this and blah blah blh blah blha", 
      "should find first post of last topic",
      "found '" + testPost.text()
      );

  bbs.addPost.sendTransaction(testPost.address, "3I have an opinion about this and blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});
  bbs.addPost.sendTransaction(testPost.address, "3No, you are wrong;  blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});
  bbs.addPost.sendTransaction(testPost.address, "3OMGLOLWTFBBQ", {from: eth.accounts[1], gas: 3000000});

  bbs.addPost.sendTransaction(otherPost.address, "4I have an opinion about this and blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});

  admin.sleepBlocks(1);

  bbs.addPost.sendTransaction(otherPost.address, "4No, you are wrong;  blah blah blh blah blha", {from: eth.accounts[1], gas: 3000000});


  bbs.addPost.sendTransaction(otherPost.address, "4OMGLOLWTFBBQ", {from: eth.accounts[1], gas: 3000000});

  admin.sleepBlocks(2);
}

function pass5() {
  passMsg(4);

  forum = BBSForum.at(bbs.lastChild());
  lastTopic = BBSPost.at(forum.lastChild());
  aPost = BBSPost.at(lastTopic.firstChild());
  firstReply = BBSPost.at(aPost.firstChild());

  assert(
      firstReply.text() == "3I have an opinion about this and blah blah blh blah blha", 
      "should find reply",
      "found '" + firstReply.text()
      );



}


function assert(truthValue, testDescription, errorOutput) {
  console.info("\x1b[33m", testDescription);

  if (!truthValue) {
    throw("\tfailure: " + errorOutput);
  }
  else {
    console.info("\x1b[32m", "\tsuccess");
  }
}

function passMsg(passNo) {
  console.log("\x1b[37m","** PASS " + passNo + "**************************");
}


/*
   var reg_contract = web3.eth.contract(compiled.GlobalRegistrar.info.abiDefinition);

   var registrar = reg_contract.new({from:web3.eth.accounts[0], data: compiled.GlobalRegistrar.code, gas: 3000000}, function(e, reg_contract){
   if(!e) {

   if(!contract.address) {
   console.log("Contract transaction send: TransactionHash: " + bbs_contract.transactionHash + " waiting to be mined...");

   } else {
   console.log("Contract mined! Address: " + bbs_contract.address);
   console.log(bbs_contract);
   }

   }
   })

   console.log("bbs contract address:");
   console.log(bbs_contract.address);


   primary = eth.accounts[0];

   personal.unlockAccount(primary, "useless");

   txhash = eth.sendTransaction({from: primary, data: bbs_contract.code});

   eth.getBlock("pending", true).transactions;
   */






// contractaddress = eth.getTransactionReceipt(txhash).contractAddress;


// etherbbs = eth.contract(compiled.EtherBBS.info.abiDefinition).at(contractaddress);


// eth.getCode(contractaddress);





//multiply7 = eth.contract(contract.info.abiDefinition).at(contractaddress);
//fortytwo = multiply7.multiply.call(6);



/*

   primary = eth.accounts[0];
   balance = web3.fromWei(eth.getBalance(primary), "ether");

   personal.unlockAccount(primary, "useless");
// miner.setEtherbase(primary)

miner.start(8); admin.sleepBlocks(10); miner.stop()  ;

// 0xc6d9d2cd449a754c494264e1809c50e34d64562b
primary = eth.accounts[0];
balance = web3.fromWei(eth.getBalance(primary), "ether");

globalRegistrarTxHash = admin.setGlobalRegistrar("0x0");

//'0x0'
globalRegistrarTxHash = admin.setGlobalRegistrar("", primary);
//'0xa69690d2b1a1dcda78bc7645732bb6eefcd6b188eaa37abc47a0ab0bd87a02e8'
miner.start(1); admin.sleepBlocks(1); miner.stop();
//true
globalRegistrarAddr = eth.getTransactionReceipt(globalRegistrarTxHash).contractAddress;
//'0x3d255836f5f8c9976ec861b1065f953b96908b07'
eth.getCode(globalRegistrarAddr);
//...
admin.setGlobalRegistrar(globalRegistrarAddr);
registrar = GlobalRegistrar.at(globalRegistrarAddr);

hashRegTxHash = admin.setHashReg("0x0");
hashRegTxHash = admin.setHashReg("", primary);
txpool.status
miner.start(1); admin.sleepBlocks(1); miner.stop();
hashRegAddr = eth.getTransactionReceipt(hashRegTxHash).contractAddress;
eth.getCode(hashRegAddr);

registrar.reserve.sendTransaction("HashReg", {from:primary});
registrar.setAddress.sendTransaction("HashReg",hashRegAddr,true, {from:primary});
miner.start(1); admin.sleepBlocks(1); miner.stop();
registrar.owner("HashReg");
registrar.addr("HashReg");

urlHintTxHash = admin.setUrlHint("", primary);
miner.start(1); admin.sleepBlocks(1); miner.stop();
urlHintAddr = eth.getTransactionReceipt(urlHintTxHash).contractAddress;
eth.getCode(urlHintAddr);

registrar.reserve.sendTransaction("UrlHint", {from:primary});
registrar.setAddress.sendTransaction("UrlHint",urlHintAddr,true, {from:primary});
miner.start(1); admin.sleepBlocks(1); miner.stop();
registrar.owner("UrlHint");
registrar.addr("UrlHint");

globalRegistrarAddr = "0xfd719187089030b33a1463609b7dfea0e5de25f0"
admin.setGlobalRegistrar(globalRegistrarAddr);
registrar = GlobalRegistrar.at(globalRegistrarAddr);
admin.setHashReg("");
admin.setUrlHint("");

///// ///////////////////////////////

admin.stopNatSpec();
primary = eth.accounts[0];
personal.unlockAccount(primary, "00")

globalRegistrarAddr = "0xfd719187089030b33a1463609b7dfea0e5de25f0";
admin.setGlobalRegistrar(globalRegistrarAddr);
registrar = GlobalRegistrar.at(globalRegistrarAddr);
admin.setHashReg("0x0");
admin.setHashReg("");
admin.setUrlHint("0x0");
admin.setUrlHint("");


registrar.owner("HashReg");
registrar.owner("UrlHint");
registrar.addr("HashReg")
registrar.addr("UrlHint");


/////////////////////////////////////
eth.getBlockTransactionCount("pending");
miner.start(1); admin.sleepBlocks(1); miner.stop();

source = "contract test {\n" +
"   /// @notice will multiply `a` by 7.\n" +
"   function multiply(uint a) returns(uint d) {\n" +
"      return a * 7;\n" +
"   }\n" +
"} ";
contract = eth.compile.solidity(source).test;
txhash = eth.sendTransaction({from: primary, data: contract.code});

eth.getBlock("pending", true).transactions;

miner.start(1); admin.sleepBlocks(1); miner.stop();
contractaddress = eth.getTransactionReceipt(txhash).contractAddress;
eth.getCode(contractaddress);

multiply7 = eth.contract(contract.info.abiDefinition).at(contractaddress);
fortytwo = multiply7.multiply.call(6);

/////////////////////////////////

// register a name for the contract
registrar.reserve.sendTransaction(primary,  {from: primary});
registrar.setAddress.sendTransaction("multiply7", contractaddress, true, {from: primary});
////////////////////////

admin.stopNatSpec();
filename = "/info.json";
contenthash = admin.saveInfo(contract.info, "/tmp" + filename);
admin.register(primary, contractaddress, contenthash);
eth.getBlock("pending", true).transactions;
miner.start(1); admin.sleepBlocks(1); miner.stop();

admin.registerUrl(primary, contenthash, "file://" + filename);
eth.getBlock("pending", true).transactions;
miner.start(1); admin.sleepBlocks(1); miner.stop();


// retrieve contract address using global registrar entry with 'multply7'
contractaddress = registrar.addr("multiply7);
// retrieve the info using the url 
info = admin.getContractInfo(contractaddress);
multiply7 = eth.contract(info.abiDefinition).at(contractaddress);
// try Natspec
admin.startNatSpec();
fortytwo = multiply7.multiply.sendTransaction(6, { from: primary });
*/
