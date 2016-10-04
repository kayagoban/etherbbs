import 'BBSPost.sol';

contract BBSForum is BBSPost {

  function BBSForum(string _text, string _title, address _parent, address _owner, address _validator) 
  BBSPost(_text, _title, _parent, _owner, _validator) { 
    return; 
  }
 
  function changeOwner(address new_owner) ifOwner public {
    owner = new_owner;
  }

}
  /* TODO
  
    functions:
      addMod
      banUser
      destroy
      removeTopic
      lockTopic
      setStickyTopic
      removePost
    modifiers
      ifMod
      ifNotBanned
  */



