---
title: Merkle Tree
date: 2025-07-23 12:04:36
updated: 2026-01-17 17:03:32
categories:
  - Data Structure
---

To create the **Merkle Tree** in **Blockchain** field
```
const { keccak256 } = require("js-sha3");

<!-- more -->

class MerkleTree {
  constructor(data) {
    this.leaves = data.map((item) => keccak256(item));
    this.tree = this.buildTree(this.leaves);
    this.root = this.tree[this.tree.length - 1][0];
  }

  buildTree(leaves) {
    const tree = [leaves];

    while (tree[tree.length - 1].length > 1) {
      const currentLevel = tree[tree.length - 1];
      const nextLevel = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || currentLevel[i];
        nextLevel.push(keccak256(left + right));
      }

      tree.push(nextLevel);
    }

    return tree;
  }

  getProof(index) {
    const proof = [];
    let currentIndex = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const currentLevel = this.tree[level];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < currentLevel.length) {
        proof.push({
          hash: currentLevel[siblingIndex],
          position: isRightNode ? "left" : "right",
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  static verify(leaf, proof, root) {
    let hash = leaf;

    for (const { hash: siblingHash, position } of proof) {
      hash =
        position === "left"
          ? keccak256(siblingHash + hash)
          : keccak256(hash + siblingHash);
    }

    return hash === root;
  }
}

const transactions = [
  "tx1: Alice -> Bob (1 ETH)",
  "tx2: Bob -> Charlie (0.5 ETH)",
  "tx3: Charlie -> David (2 ETH)",
  "tx4: David -> Eve (1.5 ETH)",
];

const merkleTree = new MerkleTree(transactions);
console.log("Merkle Root:", merkleTree.root);
console.log("Merkle Tree:", merkleTree.tree);
console.log("Merkle Tree Leaves:", merkleTree.leaves);
console.log("Merkle Tree Length:", merkleTree.tree.length);

// generate proof for tx2
const proof = merkleTree.getProof(1);
console.log("Proof for tx2:", proof);

// verify proof
const isValid = MerkleTree.verify(
  keccak256(transactions[1]),
  proof,
  merkleTree.root
);
console.log("Verification result:", isValid);

```
result:
```
Merkle Root: b0af4c18c4e47e8bb63ac2c46b0a49ef8428ced33cd79a9cf6956ecd644e41bb
Merkle Tree: [
  [
    'b6b329adfd004c2b486a2fd42db962d8ab169b490e51bb7e6e49643625489c08',
    '830619e4884b5b82095a7b88e5999bb6f42fe1660c96b5c7a918eb653f3d2c6f',
    '119959a36b238123c6789207e03190070a73678ef012d3d9887ff806671cfcf7',
    '394160627be009c2e3974a141df811150feb75bc85264ec297aaa1984e29ffa2'
  ],
  [
    '8ffa2686a0386b73b259a97ea4ba8e82a50a167190b8f3fa1f86f84e90e9b5ba',
    'a3835e19c70044e14a712e78b31b894ded4016e57d1661420dbd7a7eb41c0c42'
  ],
  [
    'b0af4c18c4e47e8bb63ac2c46b0a49ef8428ced33cd79a9cf6956ecd644e41bb'
  ]
]
Merkle Tree Leaves: [
  'b6b329adfd004c2b486a2fd42db962d8ab169b490e51bb7e6e49643625489c08',
  '830619e4884b5b82095a7b88e5999bb6f42fe1660c96b5c7a918eb653f3d2c6f',
  '119959a36b238123c6789207e03190070a73678ef012d3d9887ff806671cfcf7',
  '394160627be009c2e3974a141df811150feb75bc85264ec297aaa1984e29ffa2'
]
Merkle Tree Length: 3
Proof for tx2: [
  {
    hash: 'b6b329adfd004c2b486a2fd42db962d8ab169b490e51bb7e6e49643625489c08',
    position: 'left'
  },
  {
    hash: 'a3835e19c70044e14a712e78b31b894ded4016e57d1661420dbd7a7eb41c0c42',
    position: 'right'
  }
]
Verification result: true
```
