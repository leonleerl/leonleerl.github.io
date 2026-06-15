---
title: What is Multisig On-chain Evidence
date: 2026-02-02 10:56:06
updated: 2026-02-02 11:18:26
categories:
  - Web3
---

# Concept

Easy way to explain: **Multisig On-chain Evidence** is an unchangeable, hashed evidence on chain, signed and confirmed by multiple users.

<!-- more -->

`Multisig`: Multiple designated users confirm one specific thing.

`Evidence Anchoring`: Store the hashed "fingerprint" data on the blockchain.

Imagine a company is signing a contract, it should be signed by different stakeholders with their names on. 

Real implementations in web3.0 apps:

# DAO Governance (Core Use Case)

DAOs rely on collective decision-making.

| Use | Role of Multisig Notarisation |
|--------|--------|
| Proposal records | Proposal hash confirmed and stored on-chain |
| Governance votes | Voting outcomes anchored as proof |
| Treasury execution | Funds released only after multisig approval |

# DeFi Protocol Security Operations

Critical protocol actions are never controlled by one person.

| Scenario | Multisig Role |
|--------|--------|
| Smart contract upgrades | Requires multisig approval |
| Parameter changes (fees, rates) | Multiple signatures needed |
| Emergency pause | Multisig-triggered safeguard |

# NFT & Digital Copyright

| Use | Function |
|--------|--------|
| Proof of authorship | Multi-party verification of creator |
| IP licensing | Contract hash notarised |
| Provenance tracking | Verified history of ownership |

# Cross-Organization Data Trust (Web3 × AI)

| Scenario | Use of Multisig Notarization |
|--------|--------|
| AI training datasets | Multiple institutions verify data source |
| Medical data sharing | Multi-party data validation |
| Research data submission | Timestamped, tamper-proof proof |

# Code

```js
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

interface IEvidence {
    function verify(address _signer) external view returns (bool);
    function getSigner(uint256 _index) external view returns (address);
    function getSignersSize() external view returns (uint256);
}

contract Evidence {

    string evidence;
    address[] signers;
    address public factoryAddress;

    event NewSignatureEvidence(string _evidence, address _sender);

    function callVerify(address _signer) public view returns (bool) {
        return IEvidence(factoryAddress).verify(_signer);
    }

    constructor(string memory _evidence, address _factoryAddress) {
        factoryAddress = _factoryAddress;

        require(callVerify(tx.origin), "signer is not valid");
        evidence = _evidence;
        signers.push(tx.origin);

        emit NewSignatureEvidence(_evidence, tx.origin);
    }

    function getEvidence() public view returns (string memory, address[] memory, address[] memory){
        uint256 size = IEvidence(factoryAddress).getSignersSize();
        address[] memory signerList = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            signerList[i] = IEvidence(factoryAddress).getSigner(i);
        }
        return (evidence, signerList, signers);
    }

    function sign() public returns (bool) {

    require(callVerify(msg.sender), "not authorized signer");
    require(!isSigned(msg.sender), "already signed");

    signers.push(msg.sender);
    emit NewSignatureEvidence(evidence, msg.sender);

    return true;
}
    
    function isSigned(address _signer) internal view returns (bool) {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == _signer) {
                return true;
            }
        }
        return false;
    }

    function isAllSigned() public view returns (bool, string memory) {
        uint256 size = IEvidence(factoryAddress).getSignersSize();
        for (uint256 i = 0; i < size; i++) {
            if (!isSigned(IEvidence(factoryAddress).getSigner(i))){
                return (false, "");
            }
        }

        return (true, evidence);
    }

}
```

```js
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "./Evidence.sol";

contract EvidenceFactory is IEvidence{

    address[] signers;
    mapping(string => address) evidenceKeys;

    event NewEvidence(string _evidence, address _sender, address _evidenceAddress);

    constructor(address[] memory _signers) {
        for(uint256 i; i < _signers.length; i++) {
            signers.push(_signers[i]);
        }
    }

    function verify(address _signer) external view returns (bool){
        for(uint256 i; i< signers.length; i++) {
            if (signers[i] == _signer) {
                return true;
            }
        }
        return false;
    }

    function getSigner(uint256 _index) external view returns (address){
        if (_index < signers.length) {
            return signers[_index];
        } 
        else {
            return address(0);
        }
    }

    function getSignersSize() external view returns (uint256){
        return signers.length;
    }

    function newEvidence(string memory _evidence, string memory _key) public returns (address) {
        Evidence evidence = new Evidence(_evidence, address(this));
        evidenceKeys[_key] = address(evidence);

        emit NewEvidence(_evidence, msg.sender, address(evidence));

        return address(evidence);
    }

    function getEvidence(string memory _key) public view returns (string memory, address[] memory, address[] memory) {
        address addr = evidenceKeys[_key];
        return Evidence(addr).getEvidence();
    }

    function sign(string memory _key) public returns (bool) {
        address addr = evidenceKeys[_key];
        return Evidence(addr).sign();
    }

    function isAllSigned (string memory _key) public view returns (bool, string memory) {
        address addr = evidenceKeys[_key];
        return Evidence(addr).isAllSigned();
    }
}
```
