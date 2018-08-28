pragma solidity 0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./CustomPausable.sol";
contract VRToken is StandardToken, CustomPausable {

  uint8 public constant decimals = 18;
  string public constant name = "VirtualRehab";
  string public constant symbol = "VRH";
  bool public released = false;
  uint public ICOEndDate;
  uint public constant MAX_SUPPLY = 400000000 * (10 ** uint256(decimals));
  uint public constant INITIAL_SUPPLY = (400000000 - 750000 - 2085000 - 60000000) * (10 ** uint256(decimals));
  mapping(bytes32 => bool) private mintingList;


  modifier canTransfer(address _sender) {
    if(paused || !released) {
      if(!admins[_sender]) {
        revert();
      }
    }
    _;
  }
  ///@notice Computes keccak256 hash of the supplied value.
  ///@param _key The string value to compute hash from.
  function computeHash(string _key) private pure returns(bytes32){
    return keccak256(abi.encodePacked(_key));
  }

  ///@notice Check if the minting for the supplied key was already performed.
  ///@param _key The key or category name of minting.
  modifier whenNotMinted(string _key) {
    if(mintingList[computeHash(_key)]) {
      revert();
    }
    _;
  }

  constructor() public {
    mintTokens(msg.sender, INITIAL_SUPPLY);
    emit Transfer(address(0), msg.sender, totalSupply_);
  }

  function transfer(address _to, uint256 value) canTransfer(msg.sender) public returns (bool) {
    return super.transfer(_to, value);
  }


  function releaseTokenForTransfer() public onlyAdmin whenNotPaused {
    if(released) {
      revert();
    }
    released = true;
  }

  function transferFrom(address _from, address _to, uint256 value) canTransfer(_from) public returns (bool) {
    return super.transferFrom(_from, _to, value);
  }

  function setICOEndDate(uint _date) public onlyAdmin {
    require(ICOEndDate == 0);
    require(_date > now);
    ICOEndDate = _date;
  }

  function approve(address _spender, uint256 _value) canTransfer(msg.sender) public returns (bool) {
    return super.approve(_spender, _value);
  }

  function increaseApproval(address _spender, uint256 _addedValue) canTransfer(msg.sender) public returns (bool) {
    return super.increaseApproval(_spender, _addedValue);
  }


  function decreaseApproval(address _spender, uint256 _subtractedValue) canTransfer(msg.sender) public returns (bool) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }

  function mintTokens(address _to, uint _value) internal {
    require(_to != address(0));
    require(totalSupply_.add(_value) <= MAX_SUPPLY);
    balances[_to] = balances[_to].add(_value);
    totalSupply_ = totalSupply_.add(_value);
  }

  function mintOnce(string _key, address _to, uint256 _amount) private whenNotPaused whenNotMinted(_key) {
    _amount = _amount * (10 ** uint256(decimals));
    mintTokens(_to, _amount);
    mintingList[computeHash(_key)] = true;
  }

  function mintTokensForAdvisors() public  onlyAdmin {
    require(ICOEndDate != 0);
    // 1 year
    require(now > (ICOEndDate + 12 * 30 days));
    mintOnce("advisors", msg.sender, 750000);
  }

  function mintTokensForFounders() public onlyAdmin {
    require(ICOEndDate != 0);
    // 1 year
    require(now > (ICOEndDate + 12 * 30 days));
    mintOnce("founders", msg.sender, 60000000);

  }

  function mintTokensForServices() public onlyAdmin  {
    require(ICOEndDate != 0);
    // 2 months
    require(now > (ICOEndDate + 2 * 30 days));
    mintOnce("services", msg.sender, 2085000);
  }

 }
