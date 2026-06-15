---
title: My Understanding of Web3
date: 2025-11-13 15:08:53
updated: 2026-05-20 21:34:12
categories:
  - Web3
---

# Intro
In this passage, I'm gonna write down all my understanding based on the online book shop web3 project I've done. Here is the github repo: [https://github.com/leonleerl/bookchain](https://github.com/leonleerl/bookchain). I deployed it on Vercel, using Sepolia testnet: 
[https://bookchain-ashen.vercel.app/](https://bookchain-ashen.vercel.app/).

# What is Web3.0?
**What is Blockchain?**

It is a decentralised ledger that stores transaction data publicly.

<!-- more -->

**What is Ethereum?**

It is a blockchain that supports smart contracts.

**What is Smart Contract?**

It is the code deployed on Ethereum that runs autonomously and cannot be changed.

**What is Wallet?**

It is a way to store and control private keys (e.g. MetaMask)

**What is Transaction?**

It is a signed action recorded permanently on the blockchain.

**What is Testnet (e.g. Sepolia)?**

It is a testing version of Ethereum where crypto has no real value.

**What is EVM (Ethernum Virtual Machine)?**

It is a runtime that executes smart contracts.

**What is Gas?**

It is the fee to execute a transaction or run smart contract code.

**What is Private Key?**

It is the secret that proves you own your wallet.

**What is the difference between Ether(ETH) and Biocoin(BTC)?**

Bitcoin is mainly a decentralised digital currency and store of value, while Ether is both a cryptocurrency and the native fuel used to execute smart contracts and power decentralised apps on Ethereum.

# Bitcoin: A Peer-to-Peer Electronic Cash System

阅读《比特币白皮书》有感。

# How do I connect the Wallet?

The tech-stacks are:

* Wagmi: a React Hooks Library, to interact with Ethernum
* Reown Appkit: A UI Component to connect the wallet
* Viem: A Tool Libary for Ethernum

First we should configure the initialisation for Wagmi in `config/index.tsx`:
```javascript
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true, 
  projectId, // WalletConnect Project ID
  networks: [sepolia] 
})
```
Initialise the Reown Appkit modal in context/index.tsx:
```javascript
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: metadata
})

<WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
  <QueryClientProvider>{children}</QueryClientProvider>
</WagmiProvider>
```
Create Provider layer to provide web3 context in `context/index.tsx`:
```javascript
export function Providers({ children, cookies }) {
  return (
    <ContextProvider cookies={cookies}>
      <QueryClientProvider>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </ContextProvider>
  )
}
```
Create the Header UI component to interact with the wallet in `app/components/Header.tsx`:
```javascript
// use Wagmi hooks
const { address, isConnected } = useAccount(); // get the current account info
const { data: balance } = useBalance({ address }); // get balance
const { connect, connectors } = useConnect(); // connnect the wallet
const { disconnect } = useDisconnect(); // disconnect

const handleWalletConnect = () => {
  if (connectors[0]) {
    connect({ connector: connectors[0] }); // trigger connection
  }
};

const handleWalletDisconnect = () => {
  disconnect();
  setWalletAddress(null);
  setIsConnected(false);
};
```

# How to interact with the Smart Contract?
Interact with the smart contracts after successful connection. `app/lib/web3Actions.ts`
```javascript
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

export function usePurchaseBook() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const purchaseBook = async (bookId: number, quantity: number, value: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: BOOKSTORE_ABI,
      functionName: "purchaseBook",
      args: [BigInt(bookId), BigInt(quantity)],
      value,
    });
  };
  // ...
}
```
Trigger smart contract functions from frontend. `app/components/BookCard.tsx`
```javascript
const { isConnected } = useAccount();
const { addToFavorites } = useAddToFavorites(); // get smart contracts methods

const handleToggleFavorite = async () => {
  if (!isConnected) {
    alert("Please connect your wallet");
    return;
  }
  
  await addToFavorites(book.id); // interact with smart contract
};
```

# ABI is easy to understand

以这个简单的counter加减合约为例：

```js
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

contract Demo {

    int public count;

    constructor(int x) {
        count = x;
    }

    modifier numLimitation(){
        _;
        require(count > 0 && count <= 10, "number should in range 1 - 10");
    }

    function increment() public numLimitation{
        count++;
    }

    function decrement () public numLimitation  {
        count--;
    }
}
```

在部署后可以看到部署的详细信息：

![image](/blogs/my-understanding-of-web3/1.png)

**第一行**

`from`: 0x5B3...eddC4 - 你的钱包地址（Remix 提供的测试账户）

`to`: 空值 - 部署合约时 to 字段为空，表示创建新合约

`value`: 0 wei - 部署时没有转账 ETH

`data`: 0x608...00008 - 这是最重要的字段！

这个超长的十六进制数据包含两个部分：

```c
data = 合约字节码 (bytecode) + 构造函数参数 (constructor arguments)
```

**合约字节码(bytecode)**：`0x6080604052348015610010...`

这是Solidity编译器将我的代码编译成了EVM机器码，包含了合约逻辑，modifier，函数等所有代码。这个码不是随机生成的。每次编译相同的代码，得到的字节码是一样的。

**构造函数参数(constructor arguments)**: `...00008  <- 最后的部分`

在构造函数constructor(int x)中需要一个参数，在remix部署的时候我输入了8，所以被编成32字节的十六进制成为了那一串代码。

[https://ethervm.io/decompile](https://ethervm.io/decompile) 这里可以decompile从十六进制得到原始代码。

**其他字段**

**transaction hash**: 0x9c996f294ca2074380...。由交易内容（from, to, data, gas, nonce 等）通过 Keccak-256 哈希算法计算得出是唯一的交易标识符

**transaction cost**: 236930 gas。整个交易消耗的 gas（包括数据存储、计算等）

**execution cost**: 171010 gas。实际执行合约逻辑消耗的 gas（不含基础交易开销）

**output**: 那一长串十六进制。这是合约的 runtime bytecode部署后存储在区块链上的代码与部署时的 bytecode 略有不同（去掉了构造函数相关代码）

---

然后调用decrement()函数，如下图所示，可以得到一些其他信息

![image](/blogs/my-understanding-of-web3/2.png)

**第一行：**

**from**: `0x5B3...eddC4` - 我的钱包地址

**to**: `Demo.decrement() 0xb31...E9CA` - 合约地址和被调用的函数

**value**: `0 wei` - 没有转账

**其他字段：**

**block num**: `56` - 这笔交易被打包进了第56个区块。

**block hash**: `0x9f7480e2302bf8151e31427...` - Block hash是通过该区块的所有内容计算得出的哈希值

**output**: `0x` - 函数没有返回值，所以output为空

# High-level and Low-level Call

**High-level Call**
```js
function callCount(Counter c) public {
    c.count();
}
```

**Low-level Call**
```js
function lowCallCount(address c) public {
    bytes memory methodData = abi.encodeWithSignature("count()");
    c.call(methodData);  // 0x06661abd
}
```

---

对于高级调用，有编译时类型安全的检查。如果count()内部revert，那么整个交易自动revert。

对于低级调用，只需要地址，任何地址都可以，而且运行时`c.call(methodData)`才知道是否成功。 即使失败，调用者也不会自动revert，可以控制成功或失败然后进行之后代码`(bool success, ) = c.call(methodData);`

---

**高级调用的应用场景**

1.已知合约接口

```js
interface ICounter {
    function count() external;
    function getCount() external view returns (uint);
}

function callKnownContract(ICounter c) public {
    c.count();              // 清晰、安全
    uint result = c.getCount(); // 可以接收返回值
}
```

2.需要类型安全

```js
// 编译器会检查参数类型
function transfer(ERC20 token, address to, uint amount) public {
    token.transfer(to, amount);
}
```
3.简单直接的调用

---

**低级调用的应用场景**

1.动态调用未知函数

```js
function dynamicCall(address target, string memory funcName, uint param) public {
    bytes memory data = abi.encodeWithSignature(funcName, param);
    (bool success, ) = target.call(data);
    require(success, "Dynamic call failed");
}

// 可以调用任意函数
dynamicCall(contractAddr, "setValue(uint256)", 42);
dynamicCall(contractAddr, "increment()", 0);
```

2.调用不确定是否存在的函数

```sodility
function tryCall(address target) public returns (bool) {
    bytes memory data = abi.encodeWithSignature("optionalFunction()");
    (bool success, ) = target.call(data);
    
    if (success) {
        // 函数存在且执行成功
        return true;
    } else {
        // 函数不存在或执行失败，但不影响当前交易
        return false;
    }
}
```

3.代理合约

```js
// 转发所有调用到实现合约
fallback() external payable {
    address impl = implementation;
    assembly {
        calldatacopy(0, 0, calldatasize())
        let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
        returndatacopy(0, 0, returndatasize())
        switch result
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
}
```

4.控制gas消耗

```js
function safeLowLevelCall(address target) public {
    bytes memory data = abi.encodeWithSignature("expensiveFunction()");
    
    // 限制 gas，防止被恶意合约耗尽
    (bool success, ) = target.call{gas: 50000}(data);
    
    if (!success) {
        // 处理失败情况
    }
}
```

5.跨合约调用时发送ETH

```js
function callWithEther(address payable target) public payable {
    bytes memory data = abi.encodeWithSignature("deposit()");
    
    // 发送 ETH 同时调用函数
    (bool success, ) = target.call{value: msg.value}(data);
    require(success, "Call with ether failed");
}
```

6.多态调用（升级模式）

```js
// 不需要知道具体实现，只需要地址
function callAnyCounter(address counterAddr) public {
    bytes memory data = abi.encodeWithSignature("count()");
    (bool success, ) = counterAddr.call(data);
    require(success);
}
```

# Call and DelegateCall

**call**:
  - 在目标合约的上下文中执行
  - 修改目标合约的状态变量
  - msg.sender 是调用者

**delegatecall**:
  - 在调用者合约的上下文中执行
  - 修改调用者合约的状态变量
  - msg.sender 保持不变（原始调用者）

示例代码：

```js
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

// 被调用的合约
contract Target {
    uint public number;
    address public sender;
    uint public value;

    function serVars(uint _num) public payable {
        number = _num;
        sender = msg.sender;
        value = msg.value;
    }

}

// 使用call的合约
contract CallerWithCall {
    uint public number;
    address public sender;
    uint public value;

    function callSetVars(address _target, uint _num) public payable {
        (bool success, ) = _target.call{value: msg.value}(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );
        require(success, "Call failed");
    }
}

// 使用delegatecall的合约
contract CallerWithDelegateCall {
    uint public number;
    address public sender;
    uint public value;

    function delegatecallSetVars(address _target, uint _num) public payable {
        (bool success, ) = _target.delegatecall(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );
        require(success, "Delegatecall failed");
    }
}
```
分别运行上面三个合约之后，只有call方法会改变Target合约内部的变量。这是最直观的例子。

用一张图来表示：
![image](/blogs/my-understanding-of-web3/3.png)

# Difference between ETH and Token

**ETH(原生代币)**的接收者可以是任何地址，包括EOA(Externally Owned Account)和合约地址。如果发送到合约地址，那么合约会自动调用receive()函数。

结构：
```javascript
{
  to: '0xabcd...',        // 接收者地址
  value: 10 * 10^18,      // 10 ETH (单位: wei)
  data: "0x"              // 空数据（也可以附加消息）
}
```

**Token(ERC-20代币)**的接收者只能是合约地址。必须调用Token合约的transfer函数，余额记录在Token合约内部。
结构：
```js
{
  to: '0x6874...',  // Token 合约地址（不是接收者！）
  value: 0,         // 不转 ETH，所以是 0
  data: "transfer(0xabcd..., 10*10^18) ABI编码"  // 调用合约函数
}
```

# ERC20 and ERC721 

**ERC20核心接口:**

参考：[https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol)

```js
interface IERC20 {
    // 1. 查询总供应量
    function totalSupply() external view returns (uint256);
    
    // 2. 查询余额
    function balanceOf(address account) external view returns (uint256);
    
    // 3. 转账
    function transfer(address to, uint256 amount) external returns (bool);
    
    // 4. 授权
    function approve(address spender, uint256 amount) external returns (bool);
    
    // 5. 查询授权额度
    function allowance(address owner, address spender) external view returns (uint256);
    
    // 6. 授权转账
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // 事件
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

**ERC721核心接口:**

参考：[https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol)

```js
interface IERC721 {
    // 1. 查询拥有者
    function ownerOf(uint256 tokenId) external view returns (address);
    
    // 2. 查询余额（某人拥有多少个 NFT）
    function balanceOf(address owner) external view returns (uint256);
    
    // 3. 转账
    function transferFrom(address from, address to, uint256 tokenId) external;
    
    // 4. 安全转账
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    
    // 5. 授权
    function approve(address to, uint256 tokenId) external;
    
    // 6. 授权所有
    function setApprovalForAll(address operator, bool approved) external;
    
    // 7. 查询授权
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    
    // 事件
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}
```

# Multisig On-chain Evidence

**Evidence.sol**
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

**EvidenceFactory.sol**

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
