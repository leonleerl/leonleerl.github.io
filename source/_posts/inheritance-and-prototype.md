---
title: Inheritance and Prototype
date: 2026-02-20 21:54:08
updated: 2026-03-08 11:15:54
categories:
  - JavaScript
---

# 什么是构造函数

任何函数都可以作为构造函数。当该函数通过 new 关键字调用的时候，我们就称之为构造函数。

<!-- more -->

```js
var Parent = function() {

}
// 定义一个函数，那它只是一个普通的函数，我们不能称它为构造函数

var instance = new Parent();
// 这时这个Parent就不是普通的函数了，而是构造函数，因为是用new调用了它
// 创建了一个Parent构造函数的实例 instance
```

# prototype属性

prototype是函数特有的属性。一句话概括就是：`就让某一个构造函数实例化的所有对象可以找到公共的方法和属性`。

```js
var Parent = function() {

}

Parent.prototype.name = "所有Parent的实例都可以读到我";

let p1 = new Parent();
let p2 = new Parent();

console.log(p1.name); // 所有Parent的实例都可以读到我
console.log(p2.name); // 所有Parent的实例都可以读到我
```

# \_\_proto\_\_

\_\_proto\_\_ 属性是对象特有的属性，表示当前对象的原型是谁。

```js
var Parent = function() {

}

Parent.prototype.name = "所有Parent的实例都可以读到我";

let p1 = new Parent();
let p2 = new Parent();

console.log(p1.__proto__ === Parent.prototype); // true
```

以name属性作为例子。那么原型链的整个流程就是：
1. 先看p1对象上有没有name属性
2. 没有的话再看p1.\_\_proto\_\_(Partent.prototype)上有没有name属性
3. 没有的话再看Object.prototype上有没有name属性
4. 还没有的话那就是null

# \_\_proto\_\_和prototype的区别？

用代码直接说明：
```js
function Person(name) {
    this.name = name;
}
Person.prototype.sayHi = function() {
    console.log("Hi, I'm " + this.name);
};

const person = new Person("John");

// ========== prototype：只有函数有 ==========
console.log(Person.prototype);           // ✅ 有值：{ sayHi: [Function], constructor: Person }
console.log(person.prototype);           // ❌ undefined（实例没有 prototype）

// ========== __proto__：所有对象都有 ==========
console.log(person.__proto__);           // ✅ 有值：Person.prototype
console.log(Person.__proto__);           // ✅ 有值：Function.prototype（函数也是对象）

// ========== 关键等式 ==========
console.log(person.__proto__ === Person.prototype);   // true
// 实例的 __proto__ 指向构造函数的 prototype

// ========== 原型链 ==========
// person 调用 sayHi 时：person -> person.__proto__ -> Person.prototype
person.sayHi();  // "Hi, I'm John"

// 原型链继续往上
console.log(Person.prototype.__proto__ === Object.prototype);  // true
console.log(Object.prototype.__proto__);                        // null（链的终点）
```

`prototype`是函数才有的属性，指向实例的原型模板：
```js
Person.prototype        // { sayHi: fn, constructor: Person }
person.prototype        // undefined，普通对象没有这个属性
```
`__proto__`是每个对象都有的属性，指向它自己的原型：
```js
person.__proto__        // 指向 Person.prototype
Person.__proto__        // 指向 Function.prototype
```

```js
person.__proto__ === Person.prototype // true

person
  └── __proto__ ──→ Person.prototype
                          └── __proto__ ──→ Object.prototype
                                                └── __proto__ ──→ null
```

# constructor

constructor 是对象特有的属性。它表示当前对象的构造函数。在刚刚的例子中，我们使用构造函数Parent()创建了实例对象p1.因此p1的constructor就是Parent()。可以console.log()试试。

```js
var Parent = function() {

}

Parent.prototype.name = "所有Parent的实例都可以读到我";

let p1 = new Parent();
let p2 = new Parent();

console.log(p1.constructor);
console.log(Parent.constructor);
console.log(Function.constructor);

```
运行结果：
```terminal
(base) leonlee@Mac OOP % node index.js
[Function: Parent]
[Function: Function]
[Function: Function]
```

# 原型与原型链面试题

```js
Function.prototype.a = () => {
    console.log(1);
}

Object.prototype.b = () => {
    console.log(2);
}

function A() {}

const a = new A();

a.a(); 
a.b();
A.a();
A.b(); 
```

对于 `new` 出来的对象a的属性，查找顺序如下：

1. a自身
2. a.\_\_proto\_\_ 相当于 A.prototype
3. A.prototype.\_\_proto\_\_ 相当于 Object.prototype
4. Object.prototype.\_\_proto\_\_ 这个为null，原型链查找到尽头

对于 `function` 定义的函数A的属性，查找顺序如下：

1. A自身
2. A.\_\_proto\_\_ 相当于 Function.prototype
3. Function.prototype.\_\_proto\_\_  相当于 Object.prototype
4. Object.prototype.\_\_proto\_\_ 这个为null，原型链查找到尽头

所以答案为：
```terminal
a.a(); // error: a.a is not a function
a.b(); // 2
A.a(); // 1
A.b(); // 2
```

# 更多面试题

刚才那个题太简单？不服？那再来一些。答案在最后面。不懂问AI。

面试题 1
```js
Function.prototype.x = function () { console.log("F"); };
Object.prototype.y = function () { console.log("O"); };

function Foo() {}
const foo = new Foo();

foo.x();
foo.y();
Foo.x();
Foo.y();
```

面试题 2
```js
Function.prototype.a = () => console.log("fa");
Object.prototype.a = () => console.log("oa");

function B() {}
const b = new B();

b.a();
B.a();
```

面试题3
```js
Object.prototype.say = function () { console.log("proto"); };

function C() {}
const c = new C();

c.say = function () { console.log("instance"); };

c.say();
delete c.say;
c.say();
```

面试题4

```js
function Parent() {}
Parent.prototype.m = function () { return "parent"; };

function Child() {}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const c1 = new Child();

console.log(c1.m());
console.log(c1.constructor === Child);
console.log(c1.constructor === Parent);
```

面试题5

```js
function P() {}
function S() {}

S.prototype = Object.create(P.prototype);
// 没有 S.prototype.constructor = S

const s = new S();

console.log(s.constructor === S);
console.log(s.constructor === P);
```

面试题6

```js
Object.prototype.k = function () { return "obj"; };
Function.prototype.k = function () { return "func"; };

function D() {}
const d = new D();

console.log(d.k());
console.log(D.k());
console.log((() => {}).k());
```

面试题7

```js
function E() {}
const e = new E();

console.log(e.__proto__ === E.prototype);
console.log(E.__proto__ === Function.prototype);
console.log(E.prototype.__proto__ === Object.prototype);
```

面试题8

```js
Function.prototype.p = function () { return "FP"; };
Object.prototype.p = function () { return "OP"; };

function G() {}
G.prototype.p = function () { return "GP"; };

const g = new G();

console.log(g.p());
delete G.prototype.p;
console.log(g.p());
console.log(G.p());
```

答案：
 ```terminal
面试题1答案：
1) foo.x() -> 报错（foo.x is not a function）
2) foo.y() -> O
3) Foo.x() -> F
4) Foo.y() -> O

面试题2答案：
1) b.a() -> oa
2) B.a() -> fa

面试题3答案：
1) c.say() -> instance
2) delete c.say 后再 c.say() -> proto

面试题4答案：
1) c1.m() -> "parent"
2) c1.constructor === Child -> true
3) c1.constructor === Parent -> false

面试题5答案：
1) s.constructor === S -> false
2) s.constructor === P -> true

面试题6答案：
1) d.k() -> obj
2) D.k() -> func
3) (() => {}).k() -> func

面试题7答案：
1) e.__proto__ === E.prototype -> true
2) E.__proto__ === Function.prototype -> true
3) E.prototype.__proto__ === Object.prototype -> true

面试题8答案：
1) g.p() -> GP
2) delete G.prototype.p 后再 g.p() -> OP
3) G.p() -> FP
```

# 原型链继承

每个构造函数都有一个原型对象 Prototype。每个实例对象包含一个指向原型对象的指针 \_\_proto\_\_。 每当代码读取实例的某个属性时，都会首先在该实例上搜索这个属性，如果没有找到，则会搜索原型对象。

原型链继承的缺点：原型链继承是包含引用类型值的原型属性会被所有实例共享。换言之，如果一个实例改变了该属性，那么其他实例的该属性也会被改变。如代码所示。

```js

function Parent() {
    this.arr = [1, 2, 3];
}

function Child() {}

Child.prototype = new Parent();

let child1 = new Child();
let child2 = new Child();

console.log(child1.arr);
console.log(child2.arr);

child1.arr.push(4);
console.log(child1.arr);
console.log(child2.arr);
```
运行结果：
```terminal
(base) leonlee@Mac OOP % node index.js
[ 1, 2, 3 ]
[ 1, 2, 3 ]
[ 1, 2, 3, 4 ]
[ 1, 2, 3, 4 ]
```

# 构造函数继承

构造函数继承，通过使用 call 或 apply 方法。我们可以在子类中执行父类构造函数，从而实现继承。

优点：原型属性不会被共享，所以不会出现原型链继承所出现的问题。

缺点：不能继承父类prototype上的属性。

```js
function Parent() {
    this.sayHello = function() {
        console.log("Hello");
    }
}

Parent.prototype.a = "我是父类prototype的a属性"

function Child() {
    Parent.call(this);
}

var child1 = new Child();
var child2 = new Child();

child1.a = "我是子类实例的a属性";

console.log(child1.sayHello === child2.sayHello); // false

console.log(Parent.prototype.a);
console.log(child1.a);
console.log(child2.a);
```
运行结果：
```terminal
(base) leonlee@Mac OOP % node index.js
false
我是父类prototype的a属性
我是子类实例的a属性
undefined
```

# 组合继承

组合继承 = 原型链继承 + 构造函数继承

优点：
1. 原型属性不会被共享
2. 可以继承父类的原型链上的属性和方法

缺点：调用了2次Parent()。它在child的prototype上添加了父类的属性和方法。

```js
function Parent() {
    this.sayHello = function() {
        console.log("Hello");
    }
}

Parent.prototype.a = "我是父类prototype的a属性"

function Child() {
    Parent.call(this);
}

Child.prototype = new Parent();

var child1 = new Child();

console.log(child1.a);
child1.a = "我是子类实例的a属性";
console.log(child1.a);
```
运行结果：
```terminal
(base) leonlee@Mac OOP % node index.js
我是父类prototype的a属性
我是子类实例的a属性
```

# 寄生组合继承

优点：
1. 原型属性不会被共享
2. 可以继承父类的原型链上的属性和方法
3. 只调用了1次Parent()。因此它不会在Child的prototype上添加Parent的属性和方法。

缺点： Child.prototype的原始属性和方法会丢失。

首先先来熟悉一下这段代码：

* proto 是一个普通对象，里面有方法 sayHello。
* Object.create(proto) 会创建一个新对象 obj，并把 obj 的原型（[[Prototype]]）指向 proto。
* obj.sayHello() 时，JS 先在 obj 自身找 sayHello，找不到就沿原型链去 proto 找，于是调用成功并打印 Hello。

可以把它理解为：obj “借用” 了 proto 上的方法，而不是把方法复制一份到自己身上。所以这种写法在多个对象共享方法时更省内存。

```js
var proto = {
    sayHello: function() {
        console.log("Hello");
    }
}

var obj = Object.create(proto);

obj.sayHello();
```
运行结果：
```terminal
(base) leonlee@Mac OOP % node index.js
Hello
```

然后进入寄生组合继承的真实代码：

* Parent 构造函数里定义了 this.sayHello，这是实例方法。
* Parent.prototype.a = ... 给父类原型加了属性 a，这是原型属性。
* Parent.call(this)：在 Child 构造时执行父构造函数，把 sayHello 挂到每个 Child 实例上。
* Child.prototype = Object.create(Parent.prototype)：让 Child 的原型链接到 Parent.prototype，这样 child1 能访问到原型上的 a。
* Child.prototype.constructor = Child：修复 constructor 指向（否则会指向 Parent）。

```js
function Parent() {
    this.sayHello = function() {
        console.log("Hello");
    }
}

Parent.prototype.a = "我是父类prototype的a属性";

function Child() {
    Parent.call(this);
}

// 创建一个没有实力方法的父类实例作为子类的原型
Child.prototype = Object.create(Parent.prototype);
// 修复构造函数的指向
Child.prototype.constructor = Child;

var child1 = new Child();

console.log(child1.a);
child1.a = "我是子类实例的a属性";
console.log(child1.a);

child1.sayHello();
```
运行结果：
```terminal
(base) leonlee@Mac OOP % node index.js
我是父类prototype的a属性
我是子类实例的a属性
Hello
```

访问 child1.a 时，JS 会按这条链找：

1. 先看 child1 自己有没有 a
2. 没有就看 Child.prototype
3. 还没有就看 Parent.prototype
4. 最后到 Object.prototype
5. 都没有就是 undefined

```terminal
child1 (实例对象)
  ├─ 自身属性：
  │    sayHello  (来自 Parent.call(this))
  │    a         (在执行 child1.a = ... 之后才有)
  │
  └─ [[Prototype]] ──> Child.prototype
                        ├─ constructor: Child
                        └─ [[Prototype]] ──> Parent.prototype
                                              ├─ a: "我是父类prototype的a属性"
                                              └─ [[Prototype]] ──> Object.prototype
                                                                    └─ null
```
