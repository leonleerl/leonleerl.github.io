---
title: ES6 key concepts
date: 2026-02-19 15:21:00
updated: 2026-04-16 21:21:00
categories:
  - JavaScript
---

# Async/Await

在function前面加上Async关键字，会让这个函数的返回结果变成一个Promise对象。如代码所示。
await关键字不能像async一样可以单独存在，只能放在async函数中，如test3所示。

<!-- more -->

```js
async function test() {
    return "Hello World";
}

async function test2() {
    return Promise.resolve("Hello World");
}

async function test3() {
    let result = await test2();
    console.log(result);
}
let result = test();
let result2 = test2();
test3();

console.log(result);
console.log(result2);

result2.then((result) => {
    console.log(result);
});

```
运行结果：
```terminal
(base) leonlee@Mac ES6 % node async-await-demo.mjs
Promise { 'Hello World' }
Promise { <pending> }
Hello World
Hello World
```

在Promise函数内部发生了错误该怎么捕获？如下代码使用 then 会让 catch 的代码显得非常臃肿冗余。

```js

const getJSON = () => {
    const jsonString = "{invalid JSON data}";

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("网络请求发生错误");
        }, 2000);
    });
}

const makeRequest = async () => {
    try {
        getJSON()
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.log(error);
            console.log("第一个catch");
        });
    } catch (error) {
        console.log(error);
        console.log("第二个catch");
    }
}

makeRequest();
```
运行结果：
```terminal
(base) leonlee@Mac ES6 % node async-await-demo.mjs
网络请求发生错误
第一个catch
```

这个时候如果用async await，代码就清晰了很多。而且还可以捕获到Promise内部的错误。

```js

const getJSON = () => {
    const jsonString = "{invalid JSON data}";

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("网络请求发生错误");
        }, 2000);
    });
}

const makeRequest = async () => {
    try {
        let data = await getJSON();
        console.log(data);
    } catch (error) {
        console.log(error);
        console.log("第二个catch");
    }
}

makeRequest();
```

```terminal
(base) leonlee@Mac ES6 % node async-await-demo.mjs
网络请求发生错误
第二个catch
```

面试官如果问：“async/await 相比 Promise 的优势在哪里?”你该做何回答🤔。

async/await异步代码在形式上同步化，通过生成器（Generator）和自动执行器实现了协程（Coroutine）的效果。

这里出现了两个新的术语`生成器(Generator)和自动执行器`及`协程(Coroutine)`。

## Generator和function*

生成器(Generator)和迭代器是async/await的**底层实现原理**。在 ES6 早期，还没有 async/await 时，大牛们是用 Generator（生成器）来模拟它的。

生成器 (function*)： 它是一个可以“中途停止”的函数。看到 yield 关键字，函数就会交出执行权，停在那。

迭代器 (Iterators)： 一个专门负责调用生成器 next() 方法的函数。它发现 yield 后面是一个 Promise，就等这个 Promise 成功后，自动把结果塞回给生成器，让它继续跑。

底层逻辑： async 函数其实就是一个被包装过的 Generator，而浏览器引擎（如 V8）在后台充当了那个迭代器。

## Coroutine

协程是一个深层的概念。一个程序可以有多个执行流，它们可以主动让出控制权，稍后再恢复。

1. 当代码运行到 await 时，该函数会暂停。
2. 它把 JS 主线程的控制权“交还”给事件循环（Event Loop）。
3. 主线程可以去处理点击事件、渲染页面。
4. 等异步任务（如网络请求）回来了，事件循环再把之前的函数推回栈中，从刚才暂停的地方恢复执行。

这种“暂停 -> 恢复”的能力，就是协程的核心特征。

## 来段代码就懂了

通过这个实验，你会发现 async/await 其实就是手动控制 Generator 的自动化版本。

```js
// 1. 定义一个生成器（模拟 async）
function* myGenerator() {
  console.log("开始请求...");
  const res1 = yield new Promise(r => setTimeout(() => r("数据A"), 1000));
  console.log("收到:", res1);
  
  const res2 = yield new Promise(r => setTimeout(() => r("数据B"), 1000));
  console.log("收到:", res2);
}

// 2. 编写一个简易的“执行器”（模拟 await 的底层逻辑）
function run(genFn) {
  const g = genFn(); // 获取迭代器

  function next(data) {
    const result = g.next(data); // 恢复执行，并把上一次的结果传进去
    if (result.done) return; // 执行完了就结束
    
    // 如果没完，等 Promise 完成后继续调用 next
    result.value.then(val => {
      next(val); 
    });
  }

  next();
}

// 3. 运行
run(myGenerator);
```
运行结果：
```terminal
(base) leonlee@Mac ES6 % node async-await-demo.js
开始请求...
收到: 数据A
收到: 数据B
```

这时面试官又问：“既然 await 会暂停函数，那它会阻塞主线程吗？”

答：“不会。await 只会暂停`当前函数(协程)`的执行，它会立即释放主线程的控制权，让主线程去处理其他微任务或宏任务。这正是 JS 处理高并发异步任务的核心机理。”

切记：
**永远不要在循环里直接 await。如果你需要同时请求 10 个接口，用 Promise.all**

```js
// 模拟一个 1秒 的异步请求
const fetchData = (id) => new Promise(res => setTimeout(() => res(`Data ${id}`), 1000));

// 【实验 A】：串行（总耗时约 2秒）
async function series() {
    console.time('series');
    const d1 = await fetchData(1);
    const d2 = await fetchData(2);
    console.log(d1, d2);
    console.timeEnd('series');
}

// 【实验 B】：并行（总耗时约 1秒）
async function parallel() {
    console.time('parallel');
    const p1 = fetchData(1); // 注意：这里没有 await，Promise 已经开始执行了
    const p2 = fetchData(2);
    const results = await Promise.all([p1, p2]);
    console.log(results);
    console.timeEnd('parallel');
}

series().then(() => {
    console.log('--------------------------------');
    parallel();
}).catch(err => {
    console.error(err);
});
```
代码结果：
```terminal
(base) leonlee@Mac ES6 % node async-await-demo.js
Data 1 Data 2
series: 2.020s
--------------------------------
[ 'Data 1', 'Data 2' ]
parallel: 1.005s
```

# 详谈Promise

面试官问：“如果你有 3 个接口，其中一个挂了，你还想要剩下两个的结果，怎么办？”

| API | 特点 | 适用场景 |
|--------|--------|--------|
| Promise.all | 全部成功才成功，一个失败即整体失败 | 强依赖的一组请求 |
| Promise.allSettled | 无论成败，返回所有结果的数组 | 互不干扰的独立任务 |
| Promise.any | 只要有一个成功就返回，全部失败才报错 | 取最快、最可靠的源 |
| Promise.withResolvers | (2024新特性) 将 resolve 暴露到外部 | 延迟构建、流式处理 |

```js
let promise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        const user = { id: 1, name: "Tom1" };
        reject(user);
    }, 1000);
});

let promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        const user = { id: 2, name: "Tom2" };
        resolve(user);
    }, 2000);
});

let promise3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        const user = { id: 3, name: "Tom3" };
        reject(user);
    }, 3000);
});

Promise.race([promise1, promise2, promise3]).then((results) => {
    console.log(results);
}).catch((error) => {
    console.log("error caught");
    console.log(error);
}).finally(() => {
    console.log("finally");
});
```

# for await...of

普通的 for...of 循环是处理内存中已经存在的数据（比如一个普通的数组）。而 for await...of 是处理随时间流逝才逐个产生的数据。

想象你正在刷短视频：

* 同步数组： 服务器一次性把 100 个视频全传给你。你用 for...of 循环播放。
* 异步流： 你看完第 1 个，服务器才传第 2 个。你不知道第 3 个什么时候到。这时候你需要 for await...of。

底层原理：`异步迭代器(Async Iterator)`

普通的数组实现了 Symbol.iterator 接口，而异步迭代源实现了 Symbol.asyncIterator 接口。 它的 next() 方法返回的不是 { value, done }，而是一个 Promise，这个 Promise 最终会 resolve 成 { value, done }。

这段代码你会发现每一轮循环都会自动暂停并等待Promise完成。

```js
// 模拟一个异步数据源：每隔一秒产生一个随机数字

async function* asyncRandomGenerator() {
    for (let i = 0; i < 5; i++) {
        // 模拟 1 秒延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        const num = Math.floor(Math.random() * 5) + 1;
        yield num; 
    }
}

async function test() {
    console.log("--- 开始获取 ---");
    for await (const num of asyncRandomGenerator()) {
        console.log(`[${new Date().toLocaleTimeString()}] 拿到:`, num);
    }
}

test();
```

那么这个时候面试官问你：“for await...of和Promise.all有什么区别？”

答：

* Promise.all： 它是“并发”的。如果你有 5 个 Promise，它会同时启动它们，等最慢的那个回来后，一次性给你所有结果。
* for await...of： 它是“串行”的。它拿完第 1 个，才去拿第 2 个。它保证了异步任务的顺序执行。

面试官接着问：“如果我有一个很大的文件流，或者需要按顺序处理一批 API 请求，我该用哪个？”

答：“应该用 for await...of。因为它不会像 Promise.all 那样瞬间挤爆内存或触发服务器并发限制，它提供了一种[背压（Backpressure）](https://nodejs.org/en/learn/modules/backpressuring-in-streams)机制，处理完一个再处理下一个。”  

例如如下代码：

```js
import fs from 'fs';

async function readFileLineByLine() {
  const readable = fs.createReadStream('huge_log_file.txt', { encoding: 'utf8' });
  
  // Readable Stream 实现了异步迭代器接口
  for await (const chunk of readable) {
    console.log('读取到了一块数据:', chunk);
  }
}
```

# Top-level Await (ES2022)

在 ES2022 之前，await 只能在 async 函数内部使用。如果你想在模块顶层获取异步数据，你不得不写这种丑陋的 IIFE（立即调用函数表达式）：

```js
// 旧做法
(async () => {
  const data = await fetchConfig();
  export const config = data; // 报错！export 不能在函数内部
})();
```

**什么是 Top-level Await？**

它允许你在 异步模块（Async Modules） 的顶层直接使用 await。这意味着整个模块的加载会等待这个异步操作完成后，才宣告“加载完毕”。

例如，有文件A db.mjs

```js
// 模拟连接数据库
console.log("1. 开始连接数据库...");
await new Promise(res => setTimeout(res, 2000)); 
export const connection = { status: "Connected", id: 9527 };
console.log("2. 数据库连接成功！");
```

和文件B app.mjs

```js
import { connection } from './db.mjs';

// 注意：这里不需要写 async 函数包裹
console.log("3. 正在启动应用，检查连接：", connection.status);
```

运行 node app.mjs，会观察到：

1. 控制台先停顿 2 秒。
2. 严格按照 1 -> 2 -> 3 的顺序打印。
3. app.mjs 会阻塞等待 db.mjs 中的 await 执行完毕。

底层原理：**模块执行图 (Module Graph)**

在底层，JS 引擎（如 V8）会将模块依赖关系看作一张图。

* 普通模块： 一边链接一边执行。
* 异步模块： 当引擎遇到 await 时，它会暂停当前模块及其父模块的执行，但不会阻塞主线程（事件循环依然可以处理其他任务）。
* 并行加载： 如果 app.mjs 同时引入了 db.mjs 和 config.mjs，这两个异步模块的 await 是并行启动的，类似于 Promise.all 的逻辑。

面试官问：“既然 await 会阻塞模块执行，那如果网络很慢，页面不就白屏了吗？”

答：

1. 作用域局限： 它只阻塞依赖该模块的链路，不会阻塞不相关的代码块或主线程的渲染。
2. 确定性： 它解决了“竞态条件（Race Condition）”。以前如果异步初始化没完成，导出的变量可能是 undefined；现在它保证了 import 拿到的值一定是初始化完成后的。
3. 错误处理： 如果顶层 await 失败，该模块及其依赖它的模块都不会执行，这比带着错误强行运行要安全得多。

| 特性 | ES2017 async/await | ES2022 Top-level await |
|--------|--------|--------|
| 使用位置 | 必须在 async 函数内部 | 可以在 ESM 模块最顶层 |
| 导出能力 | 很难在异步完成后导出变量 | 轻松导出异步获取的变量 |
| 阻塞范围 | 仅阻塞当前函数内部执行流 | 阻塞当前模块及其父模块的加载 |
| 环境要求 | 任何 JS 环境 | 必须是 ES Modules 环境 |

# 解构与 Rest/Spread

... 运算符在 ES2018 扩展到了对象上，它极大地简化了状态管理（如 React/Redux）。

面试官问：“const b = { ...a } 是深拷贝还是浅拷贝？”

答：是浅拷贝。它只克隆了对象的第一层基本类型值，对于引用类型（对象、数组），它只拷贝了内存地址。

```js
const original = { a: 1, nested: { b: 2 } };
const copy = { ...original };

copy.a = 100;
copy.nested.b = 999; 

console.log(original.a);        // 1 (基本类型，不受影响)
console.log(original.nested.b); // 999 (引用类型，被篡改了！)
```

# 可选链 ?.

在 ?. 出现之前，我们要读取 user.profile.address.city 需要写一长串 &&。

?. 是一个短路操作符。如果 . 左侧的值是 null 或 undefined，它会立即停止运算并返回 undefined，而不会抛出 TypeError。

```js
const user = null;

// 旧写法：报错 TypeError
// console.log(user.name); 

// 新写法：安全返回 undefined
console.log(user?.name); 

// 函数调用也适用
const data = { getAge: null };
console.log(data.getAge?.()); // 不会报错，返回 undefined
```

# 空值合并 ??

细节对比：?? vs ||

* || (逻辑或)： 只要左侧是 Falsy（false, 0, "", NaN, null, undefined），就返回右侧。
* ?? (空值合并)： 只有左侧是 Nullish（null, undefined），才返回右侧。

```js
const userCount = 0;

// ❌ 使用 || 的错误结果
const count1 = userCount || 10; // 结果是 10，因为 0 被视为 false

// ✅ 使用 ?? 的正确结果
const count2 = userCount ?? 10; // 结果是 0，因为 0 不是 null 或 undefined
```

# 逻辑赋值运算符

这是 ??、||、&& 与 = 的结合，旨在减少重复代码。

* a ||= b：等同于 a || (a = b) (如果 a 没值/为假，赋新值)
* a ??= b：等同于 a ?? (a = b) (如果 a 彻底不存在，赋新值)

```js
const config = { timeout: 0, title: "" };

config.timeout ??= 3000; // 不会赋值，因为 0 存在
config.title ||= "Default Title"; // 会赋值，因为 "" 是 Falsy

console.log(config); // { timeout: 0, title: "Default Title" }
```

# Event Loop

在这一节中，我们会搞清楚三个概念：`执行栈（Call Stack）`、`微任务（Microtask）`、`宏任务（Macrotask）`。核心规则：执行优先级。

宏任务： 计时器，ajax，读取文件

微任务：promise.then()

执行顺序：

1. 同步程序
2. process.nextTick
3. 微任务
4. 宏任务
5. setImmediate

看这段令人头疼的代码：

```js
console.log('1'); 

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

new Promise((resolve) => {
  console.log('4');
  resolve();
}).then(() => {
  console.log('5');
});

async function test() {
  console.log('6');
  await Promise.resolve();
  console.log('7');
}

test();

console.log('8');
```

没关系，让我们来一步一步分解！

**第一轮：执行同步代码（清空执行栈）**

1.console.log('1'): 直接打印 1。

2.setTimeout: 这是一个宏任务。JS 引擎把它扔进宏任务队列（挂起），暂不执行。

3.new Promise:

* 注意！Promise 构造函数里的代码是同步执行的。所以打印 4。
* resolve() 被调用，.then() 里的回调被扔进微任务队列。

4.test():

* 调用函数，打印 6。
* 遇到 await Promise.resolve()。await 之后的所有代码（即 console.log('7')）会被理解为 .then() 里的内容，扔进微任务队列。此时 test 函数暂停，主线程跳出函数继续往下走。

5.console.log('8'): 打印 8。

第一轮结束，目前打印了：1, 4, 6, 8

**第二轮：清空微任务**

此时执行栈空了，JS 引擎去检查微任务队列。队列里现在有两个：

1. Promise.then (来自第4步) -> 打印 5。
2. await 后的残余 (来自第6步) -> 打印 7。

微任务全部清空。此时打印了：1, 4, 6, 8, 5, 7

**第三轮：执行宏任务**

微任务清空后，JS 引擎去看宏任务队列。

1. setTimeout 的回调开始执行
2. 打印 2。
3. 里面又发现一个 Promise.resolve().then()。重点： 这是一个新的微任务，执行完当前这个宏任务（setTimeout 回调）后，引擎会发现它，并立即执行它。
4. 打印 3。

全剧终。打印顺序：1, 4, 6, 8, 5, 7, 2, 3

## 面试题

面试题1

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

面试题2

```js
console.log("A");

process.nextTick(() => {
  console.log("B");
});

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

面试题3

```js
console.log("A");

process.nextTick(() => {
  console.log("B");
  process.nextTick(() => {
    console.log("C");
  });
});

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");
```

面试题4

```js
console.log("A");

setTimeout(() => {
  console.log("B");

  Promise.resolve().then(() => {
    console.log("C");
  });

}, 0);

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");
```

面试题5

```js
setTimeout(() => {
  console.log("timeout");
}, 0);

setImmediate(() => {
  console.log("immediate");
});
```

面试题6

```js
console.log("1");

setTimeout(() => {
  console.log("2");
  process.nextTick(() => {
    console.log("3");
  });
  Promise.resolve().then(() => {
    console.log("4");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("5");
});

process.nextTick(() => {
  console.log("6");
});

console.log("7");
```

答案
```terminal
1: A D C B
2: A D B C
3: A E B C D
4: A E D B C
5: 不一定，可能 timeout immediate，也可能 immediate timeout
6. 1 7 6 5 2 3 4
```

# const对象的属性为什么可以被修改？

因为类型是引用类型，变量person仅仅保存的是对象的地址（指针），意味着const仅保证地址（指针）不发生改变，修改对象的属性不会改变对象的地址（指针），所以是被允许的。也就是说const定义的引用类型只要指针不发生改变，其他的不论怎么变都是可以的。

基本类型存放在栈内存；引用类型放在堆地址，栈中只保存引用类型指向的地址。

```js
const person = {
    name: "John",
    age: 20
}

person.name = "Tom";
console.log(person.name); // Tom
```

# 箭头函数

箭头函数的this永远指向上一层作用域的this，且箭头函数的this在定义时就被确定了，所以在使用时无法改变箭头函数的this。

```js
var id = "Global"

const func = () => {
    console.log(this.id);
}

func(); // Global
func.call({id: "Obj"}); // Global
func.apply({id: "Obj"}); // Global
func.bind({id: "Obj"})(); // Global
```

那么，利用这个特性，很利于封装回调函数。例如在DOM事件的回调函数封装在一个对象里面。如果把下面代码中的箭头函数改为普通function函数，则会报错，因为this的指向会在调用时变成调用者，在这个例子中也就是document而非我们想要的handler。

```js
var handler = {
    id: "123456",

    init: function() {
        document.addEventListener("click", (event) => {
            this.doSomething(event);
        });
    },

    doSomething: function(e) {
        console.log("Handling", e.type, "for", this.id);
    }
}

handler.init(); // Handling click for 123456
```

优点：简化代码。可以把如下代码

```js
function insert(value) {
    return {
        into: function(arr) {
            return {
                after: function(afterValue) {
                    arr.splice(arr.indexOf(afterValue) + 1, 0, value);
                    return arr;
                }
            }
        }
    }
}

console.log(insert(5).into([1, 2, 3, 4]).after(3)); // [1, 2, 3, 5, 4]
```

简化为：

```js
let insert = (value) => ({
    into: (arr) => ({
        after: (afterValue) => {
            arr.splice(arr.indexOf(afterValue) + 1, 0, value);
            return arr;
        },
    })
})

console.log(insert(5).into([1, 2, 3, 4]).after(3)); // [1, 2, 3, 5, 4]
```

缺点1：this的作用域问题

```js
const person = {
    age: 18,
    add: () => {
        console.log("this is:", this); // this === window
        this.age++;
    },
};

person.add();
console.log(person.age);
```

改回function就没有这个问题了。
```js
const person = {
    age: 18,
    add: function() {
        console.log("this is:", this); // this === person
        this.age++;
    },
};

person.add();
console.log(person.age); // 19
```

缺点2: 动态绑定的时候就不能使用箭头函数

```js
var button = document.getElementById("button");

button.addEventListener("click", () => { // this === window
    this.classList.add("on");
});
```

```js
var button = document.getElementById("button");

button.addEventListener("click", function() { // this === button
    this.classList.add("on");
});
```

## 面试题

问输出是什么？

```js
function foo() {
    return () => {
        return () => {
            return () => {
                console.log("id: ", this.id);
            }
        }
    }
}

var f = foo.call({id: 1});
var t1 = f.call({id: 2})()();
var t2 = f().call({id: 3})();
var t3 = f()().call({id: 4});
```

**核心点**是：箭头函数的 this 在定义时就被固定，不会随调用方式改变。

**具体过程**

1. f = foo.call({id: 1})
    * foo 里的 this 被设为 {id: 1}
    * 所有嵌套的箭头函数都从 foo 的作用域里继承这个 this，即 this 一直是 {id: 1}
2. .call({id: 2})、.call({id: 3})、.call({id: 4}) 不起作用
    * 箭头函数忽略 .call() 传入的 this
    * 它们始终使用定义时的 this（即 {id: 1}）
3. 三层箭头函数的 this 都一样
    * 无论通过哪种方式（`f.call(...)()()`、`f().call(...)()`、`f()().call(...)`）调用
    * 打印出的都是同一个 this.id，也就是 1

**小结**

普通函数：this 由调用方式决定（谁调用、.call / .apply 等）

箭头函数：this 在定义时确定，不能通过 .call / .apply 或 bind 修改
因此，无论怎么调用，这里 console.log("id: ", this.id) 都会输出 id: 1。

# class和构造函数

在ES6之前，没有class时候是这样创建类的：

```js
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.staticMethod = function () {
    console.log("static method");
}

Person.prototype.sayName = function() {
    console.log(this.name);
};

Person.prototype.sayAge = function() {
    console.log(this.age);
};

let person1 = new Person("John", 20);
person1.sayName();
person1.sayAge();
Person.staticMethod();
```

有了class之后，可以用class来写

```js
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    sayName() {
        console.log(this.name);
    }

    sayAge() {
        console.log(this.age);
    }

    static staticMethod() {
        console.log("static method");
    }
}

let person1 = new Person("John", 20);
person1.sayName();
person1.sayAge();
Person.staticMethod();
```

那这俩的区别是什么呢？

ES6中，class的原型方法`不可以`枚举。

ES5中，构造函数上的原型方法`可以`枚举。

此话怎么讲？看代码：

```js
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.sayName = function() {
    console.log(this.name);
};

Person.prototype.sayAge = function() {
    console.log(this.age);
};

Person.staticMethod = function() {
    console.log("static method");
};

let person1 = new Person("John", 20);
for (let prop in person1) {
    console.log(prop);
}
```
运行结果：
```terminal
name
age
sayName
sayAge
```

而class的话：

```js
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    sayName() {
        console.log(this.name);
    }

    sayAge() {
        console.log(this.age);
    }

    static staticMethod() {
        console.log("static method");
    }
}

let person1 = new Person("John", 20);
for (let prop in person1) {
    console.log(prop);
}
```
运行结果：
```terminal
name
age
```

# 内部方法[[Construct]]

[[Construct]]是Javascript引擎的一个内部方法，主要用户创建和初始化对象。我们不能直接访问它，而是JavaScriopt引擎在背后用来处理通过new关键字创建新对象的机制。

不是所有函数都可以作为构造函数，只有具有[[Construct]]的函数才能作为构造函数。

```js
function isConstructor(func) {
    try {
        Reflect.construct(Object, [], func);
        return true;
    } catch (error) {
        return false;
    }
}

function test1() {}

const test2 = () => {};

console.log(isConstructor(test1)); // true
console.log(isConstructor(test2)); // false
```

#手写实现Promise.all()方法

它接受Promise对象的数组作为输入，并返回一个新的Promise对象。只有当数组中的`所有Promimse都成功`完成时才会执行then里面的回调函数，如果`任何一个Promise失败`，都会执行catch函数。
