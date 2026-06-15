---
title: Closures
date: 2026-03-02 16:56:49
updated: 2026-05-03 12:58:53
categories:
  - JavaScript
---

# 作用域链

当我们访问一个变量的时候，JavaScript引擎首先会在`当前作用域`寻找这个变量。如果当前作用域没有这个变量，就回去`上一层作用域`寻找。如果上一层作用域找不到，就去上上层寻找。直到全局作用域`都找不到时，返回undefined。

<!-- more -->

```js
var windowVar = "windowVar";

function outer() {
    var outerVar = "outerVar";
    function inner() {
        var innerVar = "innerVar";
        console.log(outerVar); // outerVar
        console.log(innerVar); // innerVar
        console.log(windowVar); // windowVar
    }
    inner();
}

outer();
```

# 闭包

定义：即使外部函数已经不存在，也可以获取作用域链上变量的函数。

A closure is a function that keeps access to the variables from the scope where it was created, even when that scope has finished running.

对于下面这段代码，我们称`f函数和变量a形成了闭包`。

```js
function outer() {
    const a = 1;
    function f() {
        console.log(a);
    }
    return f;
}

let f = outer();
f();
```

# 闭包可能会导致内存泄漏

```js
/**
 * 闭包导致内存泄漏的示例
 *
 * 闭包会保持对外部变量的引用，只要闭包存在，这些变量就无法被垃圾回收。
 * 如果闭包本身被长期持有（如事件监听、定时器），就会造成内存泄漏。
 */

// ============ 示例 1: 定时器持有大对象 ============
// 闭包引用了 largeData，而 setInterval 会让回调函数一直存在
// 即使 largeData 不再需要，也无法被 GC 回收
function createLeakyTimer() {
  const largeData = new Array(1000000).fill('x'); // 约占用数 MB 内存

  setInterval(() => {
    console.log('timer running, data length:', largeData.length);
    // 闭包捕获了 largeData，只要定时器不清除，largeData 就一直在内存中
  }, 1000);

  // 没有返回 intervalId，调用方无法清除定时器，导致持续泄漏
}

// ============ 示例 2: 事件监听器持有 DOM 和大数据 ============
// 经典的循环引用：DOM 引用闭包，闭包引用 DOM 和大数据
function createLeakyEventHandler() {
  const bigObject = { data: new Array(500000).fill('leak') };

  document.getElementById('myButton').addEventListener('click', function () {
    console.log('clicked', bigObject.data.length);
    // 闭包捕获了 bigObject，且 this/event 可能形成循环引用
    // 即使移除 button，如果监听器未正确移除，内存可能泄漏
  });

  // 未保存 handler 引用，无法 removeEventListener
}

// ============ 示例 3: 闭包缓存无限制增长 ============
function createLeakyCache() {
  const cache = {}; // 闭包中的缓存会一直增长

  return function (key, value) {
    cache[key] = value;
    return cache;
  };
  // 每次调用都会往 cache 里塞数据，永不释放
}

// ============ 示例 4: 在 Node.js 中 - 未清理的订阅 ============
// 模拟：闭包持有大对象，且被 EventEmitter 长期引用
function createLeakySubscriber() {
  const heavyPayload = new Array(100000).fill({ id: 1, name: 'leak' });

  const EventEmitter = require('events');
  const emitter = new EventEmitter();

  emitter.on('data', function () {
    console.log(heavyPayload.length); // 闭包引用 heavyPayload
  });

  // 如果 emitter 是全局或长期存在的，heavyPayload 永远不会被释放
  return emitter;
}
```

# 应用

闭包的应用是：可以封装一段代码。

```js
let a = 10;
let b = 20;

function add(){
    return a + b;
}

function sub() {
    return a - b;
}

let result1 = add();
let result2 = sub();

console.log(result1); // 30
console.log(result2); // -10
```

改写为：

```js

let calculatorModule = (function() {

    let a = 10;
    let b = 20;

    function add(){
        return a + b;
    }
    
    function sub() {
        return a - b;
    }

    return {
        add,
        sub
    }
})();

let result1 = calculatorModule.add();
let result2 = calculatorModule.sub();

console.log(result1); // 30
console.log(result2); // -10

console.log(a); // error: a is not defined
```
