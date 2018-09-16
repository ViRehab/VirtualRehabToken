# Virtual Rehab Token (VRH) ERC20 Token Contract (VRHToken.sol)

**contract VRHToken is [StandardToken](StandardToken.md), [CustomPausable](CustomPausable.md), [BurnableToken](BurnableToken.md)**

**VRHToken**

The Virtual Rehab Token (VRH) has been created as a centralized currency 
to be used within the Virtual Rehab network. Users will be able to purchase and sell 
VRH tokens in exchanges. The token follows the standards of Ethereum ERC20 Standard token. 
Its design follows the widely adopted token implementation standards. 
This allows token holders to easily store and manage their VRH tokens using existing solutions 
including ERC20-compatible Ethereum wallets. The VRH Token is a utility token 
and is core to Virtual Rehab’s end-to-end operations.
 
The $VRH utility token has four use cases:

1. Allows users to order and download programs from Virtual Rehab Online Portal
2. Allows users to request additional analysis (using Virtual Rehab unique expert system, which uses Artificial Intelligence) of executed programs
3. Incentivizes users with $VRH tokens reward for seeking help and counselling from medical doctors, psychologists, and therapists (Proof of Therapy)
4. Allows users to pay for services received at the Virtual Rehab Therapy Center

## Modifiers

- [canTransfer](#cantransfer)
- [whenNotMinted](#whennotminted)

### canTransfer

Checks if the supplied address is able to perform transfers.

```js
modifier canTransfer (address _from) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _from | address | The address to check against if the transfer is allowed. | 

### whenNotMinted

Checks if the minting for the supplied key was already performed.

```js
modifier whenNotMinted (string _key) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _key | string | The key or category name of minting. | 

## Functions

- [computeHash](#computehash)
- [releaseTokenForTransfer](#releasetokenfortransfer)
- [disableTokenTransfers](#disabletokentransfers)
- [setICOEndDate](#seticoenddate)
- [mintTokens](#minttokens)
- [mintOnce](#mintonce)
- [mintTokensForAdvisors](#minttokensforadvisors)
- [mintTokensForFounders](#minttokensforfounders)
- [mintTokensForServices](#minttokensforservices)
- [transfer](#transfer)
- [transferFrom](#transferfrom)
- [approve](#approve)
- [increaseApproval](#increaseapproval)
- [decreaseApproval](#decreaseapproval)
- [sumOf](#sumof)
- [bulkTransfer](#bulktransfer)
- [burn](#burn)

### computeHash

Computes keccak256 hash of the supplied value.

```js
function computeHash(string _key) private
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _key | string | The string value to compute hash from. | 

### releaseTokenForTransfer

This function enables token transfers for everyone. 
Can only be enabled after the end of the ICO.

```js
function releaseTokenForTransfer() public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### disableTokenTransfers

This function disables token transfers for everyone.

```js
function disableTokenTransfers() public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### setICOEndDate

This function enables the whitelisted application (internal application) to set the ICO end date and can only be used once.

```js
function setICOEndDate(uint256 _date) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _date | uint256 | The date to set as the ICO end date. | 

### mintTokens

```js
function mintTokens(address _to, uint256 _value) private
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _to | address | The address which will receive the minted tokens. | 
| _value | uint256 | The amount of tokens to mint. | 

### mintOnce

Mints the tokens only once against the supplied key (category).

```js
function mintOnce(string _key, address _to, uint256 _amount) private
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _key | string | The key or the category of the allocation to mint the tokens for. | 
| _to | address | The address receiving the minted tokens. | 
| _amount | uint256 | The amount of tokens to mint. | 

### mintTokensForAdvisors

Mints the below-mentioned amount of tokens allocated to the Virtual Rehab advisors.

```js
function mintTokensForAdvisors() public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### mintTokensForFounders

Mints the below-mentioned amount of tokens allocated to the Virtual Rehab founders.

```js
function mintTokensForFounders() public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### mintTokensForServices

Mints the below-mentioned amount of tokens allocated to Virtual Rehab services.

```js
function mintTokensForServices() public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### transfer

```js
function transfer(address _to, uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _to | address | The destination wallet address to transfer funds to. | 
| _value | uint256 | The amount of tokens to send to the destination address. | 

### transferFrom

Transfers tokens from a specified wallet address.

```js
function transferFrom(address _from, address _to, uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _from | address | The address to transfer funds from. | 
| _to | address | The address to transfer funds to. | 
| _value | uint256 | The amount of tokens to transfer. | 

### approve

Approves a wallet address to spend on behalf of the sender.

```js
function approve(address _spender, uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _spender | address | The address which is approved to spend on behalf of the sender. | 
| _value | uint256 | The amount of tokens approve to spend. | 

### increaseApproval

Increases the approval of the spender.

```js
function increaseApproval(address _spender, uint256 _addedValue) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _spender | address | The address which is approved to spend on behalf of the sender. | 
| _addedValue | uint256 | The added amount of tokens approved to spend. | 

### decreaseApproval

Decreases the approval of the spender.

```js
function decreaseApproval(address _spender, uint256 _subtractedValue) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _spender | address | The address of the spender to decrease the allocation from. | 
| _subtractedValue | uint256 | The amount of tokens to subtract from the approved allocation. | 

### sumOf

Returns the sum of supplied values.

```js
function sumOf(uint256[] _values) private
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _values | uint256[] | The collection of values to create the sum from. | 

### bulkTransfer

Allows only the admins and/or whitelisted applications to perform bulk transfer operation.

```js
function bulkTransfer(address[] _destinations, uint256[] _amounts) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _destinations | address[] | The destination wallet addresses to send funds to. | 
| _amounts | uint256[] | The respective amount of fund to send to the specified addresses. | 

### burn

Burns the coins held by the sender.

```js
function burn(uint256 _value) public
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _value | uint256 | The amount of coins to burn. | 

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
