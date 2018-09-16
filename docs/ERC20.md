# ERC20 interface (ERC20.sol)

**contract ERC20 is [ERC20Basic](ERC20Basic.md)**

**ERC20**

see https://github.com/ethereum/EIPs/issues/20

## Functions

- [allowance](#allowance)
- [transferFrom](#transferfrom)
- [approve](#approve)

### allowance

```js
function allowance(address _owner, address _spender) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _owner | address |  | 
| _spender | address |  | 

### transferFrom

```js
function transferFrom(address _from, address _to, uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _from | address |  | 
| _to | address |  | 
| _value | uint256 |  | 

### approve

```js
function approve(address _spender, uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _spender | address |  | 
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