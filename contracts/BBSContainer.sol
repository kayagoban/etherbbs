contract BBSContainer {
  // the validator is trusted and can add children.
  address public validator;
  address public owner;
  address public parent;
  address[] children;

  modifier ifOwner {
    if (owner != msg.sender)
      throw;
    _
  }

  modifier ifValidated {
    if (msg.sender != validator) 
      throw;
    _
  }

  function BBSContainer(address _parent, address _owner, address _validator) {
    owner = _owner;
    parent = _parent;
    validator = _validator;
  }

  function isLeaf() constant public returns (bool) {
    if (children.length > 0)
      return false;

    return true;
  }

  function lastChildIndex() constant public returns (uint) {
    return children.length - 1;
  }

  function numChildren() constant public returns (uint) {
    return children.length;
  }

  function childAtIndex(uint index) constant public returns (address) {
    return children[index];
  }

  function addChild(address child) ifValidated { 
    children.push(child);
  }    

  function firstChild() constant public returns (address) {
    return children[0];
  }

  function lastChild() constant public returns (address) {
    return children[children.length - 1];
  }

  /* Return fixed-size paged array of children, newest(last) being first. */
  function page20(uint childIndex, uint pageIndex) constant public returns (address[20] memory pageResults) {  

    childIndex = childIndex - (pageIndex * 20);

   /* A word about this conditional int(lastIndex - i) >= 0...
      the cast to int is necessary because otherwise it's a uint which
      by definition is always larger than 0 when not 0.
    */
    for (uint i = 0; i < 20 && (int(childIndex - i) >= 0); i++) {
      pageResults[i] = children[(childIndex - i)]; 
    }

    return pageResults;
  }

}

