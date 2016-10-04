import 'BBSContainer.sol';

contract BBSPost is BBSContainer {
  uint8 public stake;
  string public text;
  string public title;

  function BBSPost(string _text, string _title, address _parent,  address _owner, address _validator) 
  BBSContainer(_parent, _owner, _validator) {
    text = _text;
    title = _title;
  }
}

