---
title: Create Create2 Create3
date: 2026-02-02 17:50:49
updated: 2026-05-11 17:27:13
categories:
  - Web3
---

In this article, we will discuss how to create contract address and deploy it onto a specific address on chain.

<!-- more -->

# Create

First, let's explain how the address gets generated?

When we use `new Contract()` (CREATE), 

```js
contract address = hash(msg.sender + nonce)
```

Which is essentially:

```js
keccak256( rlp.encode( sender, nonce ) )[12:]
```

**What is nonce?**

| Creator | meaning of nonce |
|--------|--------|
| As EOA | the transactions it has sent |
| As Contract Factory | the number of contracts it has generated |

The problem of CREATE: the generated address isn't predictable.

# Create2

To solve the problem of "Create", Create2 provided a way to generate address that is controllable.

```js
keccak256( 0xff + deployer + salt + keccak256(init_code) )[12:]
```

| Paramter | Origin |
|--------|--------|
| deployer | address of the factory address |
| salt | by yourself |
| init_code | contract byte code |

# Create3

To solve the problem of "Create2", Create3 provided a way to generate controllable address without relying on contract byte code.

Remeber there are only 2 steps: 

1.Use **CREATE2** to create a fixed deployer address called A. 
```js
A = keccak(0xff + factory + salt + deployerBytecodeHash)
```

2.Use **CREATE** to create the user contract

```js
userContract = keccak(rlp(A_address, nonce))[12:]
```
Deployer A is a new contract, so the nonce starts from 1. Since it is the first time for A to **CREATE**, nonce will be 1 permanently.

As a result, the address will become:

```js
userContract = keccak(A + 1)
```

Now let's look at the definition of **CREATE3** below, isn't it clear?

> CREATE3 works by first deploying a one-time deployer contract A using CREATE2, and then having A deploy the target contract using CREATE. Since A is freshly deployed, its nonce for the first contract creation is always 1, which makes the final contract address depend only on the salt and the factory, rather than on the user contract’s bytecode.

# Minimal Proxy

We can introduce a new concept **Minimal Proxy** ([EIP-1167](https://eips.ethereum.org/EIPS/eip-1167)).

> A minimal proxy is a lightweight contract that delegates all execution to a single implementation contract, allowing many contract instances to share the same logic while maintaining separate storage.

Deploying full smart contracts repeatedly is expensive because each deployment stores the entire bytecode on-chain. If you need many contracts with the same logic (for example: wallets, ERC20 tokens, vaults), deploying them normally wastes gas.

Minimal proxies solve this by:
* Deploying the logic code only once
* Creating tiny proxy contracts that reuse that logic

```java
User → Proxy Contract → delegatecall → Implementation Contract
```

Implementation code:
```js
pragma solidity ^0.8.20;

contract WalletLogic {
    address public owner;
    uint public balance;

    function init(address _owner) external {
        require(owner == address(0), "Already initialized");
        owner = _owner;
    }

    function deposit() external payable {
        balance += msg.value;
    }

    function withdraw(uint amount) external {
        require(msg.sender == owner, "Not owner");
        balance -= amount;
        payable(owner).transfer(amount);
    }
}
```

Minimal Proxy code:
```js
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";

contract WalletFactory {
    address public implementation;

    event WalletCreated(address wallet);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createWallet() external returns (address wallet) {

        wallet = Clones.clone(implementation);

        WalletLogic(payable(wallet)).init(msg.sender);

        emit WalletCreated(wallet);
    }
}
```
