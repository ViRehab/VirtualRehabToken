pragma solidity 0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract VRToken is StandardToken {

  uint8 public constant decimals = 18;
  string public constant name = "VirtualRehab";
  string public constant symbol = "VRH";

  uint public constant INITIAL_SUPPLY = 400000000 * (10 ** uint256(decimals));

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = totalSupply_;
    emit Transfer(address(0), msg.sender, totalSupply_);
  }
}
