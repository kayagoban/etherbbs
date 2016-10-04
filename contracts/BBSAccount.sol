import 'BBSPost.sol';

contract BBSAccount {
  address owner;
  BBSPost[] public posts;
  address[] public blocklist;
  bool public stakeVerified = false;
  address public stakingAddress = 0;
  string public tag;

  uint public creationTime;

  address[] public forumBlocklist;
  address[] public userBlocklist;
  address[] public stakeBlocklist;

  modifier ifOwner() {
    if (msg.sender != owner) 
      throw;

    _
  }

  /*
     If a contract receives Ether (without a function being called), the fallback function is 
     executed. The contract can only rely on the gas stipend (2300 gas) being available to 
     it at that time. This stipend is not enough to access storage in any way. To be sure that 
     your contract can receive Ether in that way, check the gas requirements of the fallback 
     function (for example in the details section in browser-solidity).
   */

  function() {
    if (msg.sender != stakingAddress || msg.value < 1)  
      throw; 

    stakeVerified = true;
  }

  function BBSAccount(string _tag, address _owner, address _stakingAddress) {
    owner = _owner;
    stakingAddress = _stakingAddress;
    tag = _tag;
    creationTime = now;
  }

  function registerStakingAddress(address _stakingAddress) ifOwner public {
    stakingAddress = _stakingAddress;
    stakeVerified = false;
  }

  function addBlock(address addressToBlock) ifOwner public {
    for (uint i=0; i < blocklist.length; i++) {
      if (blocklist[i] == addressToBlock) {
        return;
      }
    }
    blocklist.push(addressToBlock);
    return;
  }

  function removeBlock(address addressToUnblock) ifOwner public {
    for (uint i=0; i < blocklist.length; i++) {
      if (blocklist[i] == addressToUnblock) {
        blocklist[i] = 0xdeadbeef;
      }
    }
    return;
  }
    
  /*
  function blocklistPage100(uint pageIndex) constant public returns (address[20] memory pageResults) {
    uint beginIterator = (20 * pageIndex);

    for (uint i = beginIterator; i < (20 * (pageIndex + 1)) && i < blocklist.length; i++) {
      pageResults[i] = blocklist[beginIterator + i];  
    }

    return pageResults;
  }
  */


}


