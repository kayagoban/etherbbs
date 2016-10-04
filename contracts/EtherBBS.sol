import 'BBSForum.sol';
import 'BBSAccount.sol';


contract AmIOnTheFork {
  function forked() constant returns(bool);
}

contract EtherBBS is BBSContainer {

  mapping (address => address) accounts;
  mapping (string => address) tags; 

  uint8 public stakeLowerBoundExp = 18;

  event errorEvent(address sender, string message);
  event forumAddedEvent(address sender);
  event topicAddedEvent(address sender, address parent, address topic);
  event postAddedEvent(address sender, address parent, address post);
  event userAddedEvent(address sender, string message);

  function EtherBBS() BBSContainer(0x0, msg.sender, this) {
  }


  modifier officialChain {
    AmIOnTheFork amIOnTheFork = AmIOnTheFork(0x2bd2326c993dfaef84f696526064ff22eba5b362);

    if  (amIOnTheFork.forked() == false) {
      errorEvent(msg.sender, 'EtherBBS accounts are only available on the official ethereum chain'); 
      throw;
    }
   _ 
  }


  /* Must override this so that addChild() will work on the bbs object for making forums
     Since the owner doesn't need an account */
  modifier ifValidated {
    _
  }

  modifier ifValidAccount { 
    if (accounts[msg.sender] == 0x0) 
      throw;
    _
  }

  /* Users */
  
  /* add officialChain modifier before production deploy */
  function createUser(string tag, address stakingAddress)  public { 
    if (accounts[msg.sender] != 0x0) {
      errorEvent(msg.sender, 'This Ethereum account has already registered as a user - if you wish to make another user account, you must use a different Ethereum account to register it.');
      throw;
    }

    if(tags[tag] != 0x0) {
      errorEvent(msg.sender, 'That user tag has already been registered - choose another and try registering again.');
      throw;
    }

    /* THIS DOES NOT WORK YET - FAILS SILENTLY. This conversion is necessary to measure length */
    /*
    bytes memory tagb = bytes(tag);

    if(tagb.length < 32) {
      errorEvent(msg.sender, 'You must limit your tag to 32 characters.  Please choose another and try registering again.');
      throw;
    }
    */

    address newUser = new BBSAccount(tag, msg.sender, stakingAddress);
    accounts[msg.sender] = newUser;
    tags[tag] = msg.sender;
    userAddedEvent(msg.sender, 'Your user has been successfully registered on EtherBBS.');
  }

  function myAccount() constant public returns(address) {
    return accounts[msg.sender];
  }

  /* Forums */
  /* Currently only supports God making forums */
  function addForum(string text, string title) 
  ifOwner public {
    BBSForum forum = new BBSForum(text, title, this, owner, this);
    addChild(forum);
    forumAddedEvent(msg.sender);
  }   

  /* Topics */
  function addTopic(BBSContainer forum, string text, string title) 
  ifValidAccount public {
    BBSPost topic = new BBSPost(text, title, forum, accounts[msg.sender], this);

    forum.addChild(topic);
    topicAddedEvent(msg.sender, topic, forum);
  }

  /* Posts */
  function addPost(BBSContainer parent, string text) 
  ifValidAccount public {
    BBSPost post = new BBSPost(text, '', parent, accounts[msg.sender], this);
    parent.addChild(post);
    postAddedEvent(msg.sender, post, parent);
  }

}

