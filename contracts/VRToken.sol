pragma solidity 0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./CustomPausable.sol";
contract VRToken is StandardToken, CustomPausable {

  uint8 public constant decimals = 18;
  string public constant name = "VirtualRehab";
  string public constant symbol = "VRH";

  uint public constant INITIAL_SUPPLY = 400000000 * (10 ** uint256(decimals));

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = totalSupply_;
    emit Transfer(address(0), msg.sender, totalSupply_);
  }

  function transfer(address _to, uint256 value) whenNotPaused public returns (bool) {
    return super.transfer(_to, value);
  }

  function transferFrom(address _from, address _to, uint256 value) whenNotPaused public returns (bool) {
    return super.transferFrom(_from, _to, value);
  }

  function approve(address _spender, uint256 _value) whenNotPaused public returns (bool) {
    return super.approve(_spender, _value);
  }

  function increaseApproval(address _spender, uint256 _addedValue) whenNotPaused public returns (bool) {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(address _spender, uint256 _subtractedValue) whenNotPaused public returns (bool) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }

 }
