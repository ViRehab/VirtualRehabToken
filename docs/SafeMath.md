# SafeMath.sol

**SafeMath**

## Functions

- [mul](#mul)
- [div](#div)
- [sub](#sub)
- [add](#add)

### mul

Multiplies two numbers, throws on overflow.

```js
function mul(uint256 _a, uint256 _b) internal pure
returns(c uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _a | uint256 |  | 
| _b | uint256 |  | 

### div

Integer division of two numbers, truncating the quotient.

```js
function div(uint256 _a, uint256 _b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _a | uint256 |  | 
| _b | uint256 |  | 

### sub

Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).

```js
function sub(uint256 _a, uint256 _b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _a | uint256 |  | 
| _b | uint256 |  | 

### add

Adds two numbers, throws on overflow.

```js
function add(uint256 _a, uint256 _b) internal pure
returns(c uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _a | uint256 |  | 
| _b | uint256 |  | 

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
