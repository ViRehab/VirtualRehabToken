# Pausable (CustomPausable.sol)

**contract CustomPausable is [CustomAdmin](CustomAdmin.md)**

**CustomPausable**

Base contract which allows children to implement an emergency stop mechanism.

## Contract Members
**Constants & Variables**

```js
bool public paused;
```

**Events**

```js
event Pause();
event Unpause();

```

## Modifiers

- [whenNotPaused](#whennotpaused)
- [whenPaused](#whenpaused)

### whenNotPaused

Modifier to make a function callable only when the contract is not paused.

```js
modifier whenNotPaused() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### whenPaused

Modifier to make a function callable only when the contract is paused.

```js
modifier whenPaused() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [pause](#pause)
- [unpause](#unpause)

### pause

called by the owner to pause, triggers stopped state

```js
function pause() public

```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### unpause

called by the owner to unpause, returns to normal state

```js
function unpause() public

```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

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
