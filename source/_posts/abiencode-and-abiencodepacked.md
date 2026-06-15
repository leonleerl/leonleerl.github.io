---
title: abi.encode and abi.encodePacked
date: 2026-02-08 14:52:10
updated: 2026-03-01 18:37:41
categories:
  - Web3
---

# abi.encode

```js
function stringEncode() public pure returns (bytes memory) {
    bytes memory someString = abi.encode("some string");
    return someString;
}
```

The returned value:

```js
0x
0000000000000000000000000000000000000000000000000000000000000020 // offset
000000000000000000000000000000000000000000000000000000000000000b // length
736f6d6520737472696e67000000000000000000000000000000000000000000 // data
```
![image](/blogs/abi-encode-and-abi-encodePacked/1.png)

<!-- more -->

# abi.encodePacked

```js
function stringEncodePacked() public pure returns (bytes memory) {
    bytes memory someString = abi.encodePacked("some string");
    return someString;
}
```

```js
0x736f6d6520737472696e67
```

The result is obvious that all the "zeros" are removed compared with `abi.encode`, which is called **packed encoding**.

So, abi.encodePacked returns the raw concatenation of the data without ABI metadata. `abi.decode` is not applicable for this method.

The scenarios we can use `abi.encodePacked`:

* keccak256(...)
* building signing messages (EIP-712–style inputs)
* not going to decode the result

The scenarios we CAN"T use it:

* The data must be decoded later
* data is used for contract-to-contract ABI calls

# Code
```js
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Encoding {
    
    function stringEncode() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string");
        return someString;
    }

    function stringEncodePacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked("some string");
        return someString;
    }

    function stringDecode() public pure returns (string memory) {
        string memory someString = abi.decode(stringEncode(), (string));
        return someString;
    }

    // This doesn't work!
    function stringDecodePacked() public pure returns (string memory) {
        string memory someString = abi.decode(stringEncodePacked(), (string));
        return someString;
    }

    function multiEncode() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string", "it's bigger!");
        return someString;
    }

    function multiDecode() public pure returns (string memory, string memory) {
        (string memory someString, string memory someOtherString) = abi.decode(multiEncode(), (string, string));
        return (someString, someOtherString);
    }

    function multiEncodePacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked("some string", "it's bigger!");
        return someString;
    }

    // This doesn't work!
    function multiDecodePacked() public pure returns (string memory, string memory) {
        (string memory someString, string memory someOtherString) = abi.decode(multiEncodePacked(), (string, string));
        return (someString, someOtherString);
    }
}
```
