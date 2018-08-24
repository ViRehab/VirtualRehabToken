pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CustomWhitelist is Ownable {
  mapping(address => bool) public whitelist;
  uint256 public numberOfWhitelists;

  event WhitelistedAddressAdded(address _addr);
  event WhitelistedAddressRemoved(address _addr);

  /**
   * @dev Throws if called by any account that's not whitelisted.
   */
  modifier onlyWhitelisted() {
    require(whitelist[msg.sender] || msg.sender == owner);
    _;
  }

  constructor() public {
    whitelist[msg.sender] = true;
    numberOfWhitelists = 1;
    emit WhitelistedAddressAdded(msg.sender);
  }
  /**
   * @dev add an address to the whitelist
   * @param _addr address
   */
  function addAddressToWhitelist(address _addr) onlyWhitelisted  public {
    require(_addr != address(0));
    require(!whitelist[_addr]);

    whitelist[_addr] = true;
    numberOfWhitelists++;

    emit WhitelistedAddressAdded(_addr);
  }

  /**
   * @dev remove an address from the whitelist
   * @param _addr address
   */
  function removeAddressFromWhitelist(address _addr) onlyWhitelisted  public {
    require(_addr != address(0));
    require(whitelist[_addr]);
    //the owner can not be unwhitelisted
    require(_addr != owner);

    whitelist[_addr] = false;
    numberOfWhitelists--;

    emit WhitelistedAddressRemoved(_addr);
  }

}
