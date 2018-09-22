# CustomAdmin.sol

**contract CustomAdmin is [Ownable](Ownable.md)**

**CustomAdmin**

## Contract Members
**Constants & Variables**

```js
mapping(address => bool) public admins;
uint256 public numberOfAdmins;
```

**Events**

```js
event AdminAdded(address indexed addr);
event AdminRemoved(address indexed addr);
```

## Modifiers

- [onlyAdmin](#onlyadmin)

### onlyAdmin

Throws if called by any account that's not an administrator.

```js
modifier onlyAdmin() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [addAdmin](#addadmin)
- [removeAdmin](#removeadmin)

### addAdmin

Add an address to the adminstrator list.

```js
function addAdmin(address addr) public onlyAdmin
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| addr | address | address | 

### removeAdmin

Remove an address from the administrator list.

```js
function removeAdmin(address addr) public onlyAdmin
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| addr | address | address | 

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
