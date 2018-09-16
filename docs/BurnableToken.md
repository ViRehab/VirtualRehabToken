# Burnable Token (BurnableToken.sol)

**contract BurnableToken is [BasicToken](BasicToken.md)**

**BurnableToken**

Token that can be irreversibly burned (destroyed).

## Functions

- [burn](#burn)
- [_burn](#_burn)

### burn

Burns a specific amount of tokens.

```js
function burn(uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _value | uint256 | The amount of token to be burned. | 

### _burn

```js
function _burn(address _who, uint256 _value) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _who | address |  | 
| _value | uint256 |  | 

## Contracts

- [ERC20Basic](ERC20Basic.md)
- [SafeMath](SafeMath.md)
- [BasicToken](BasicToken.md)
- [StandardToken](StandardToken.md)
- [CustomPausable](CustomPausable.md)
- [BurnableToken](BurnableToken.md)
- [CustomAdmin](CustomAdmin.md)
- [Migrations](Migrations.md)
- [Ownable](Ownable.md)
- [ERC20](ERC20.md)
- [VRHToken](VRHToken.md)