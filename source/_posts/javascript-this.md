---
title: JavaScript This
date: 2026-02-22 14:49:12
updated: 2026-03-08 10:52:49
categories:
  - JavaScript
---

# this是在运行时绑定还是编译时绑定？

this是用于访问当前方法所属的对象。

<!-- more -->

```js
function foo() {
    console.log(this);
}

var obj = {
    name: "obj",
    foo: foo
}

// 调用方式1: 直接调用
foo();
// 调用方式2: 通过对象调用
obj.foo();
// 调用方式3: 通过call或apply调用
foo.call("hello world")
```
在浏览器中的运行结果：
```terminal
Window {window: Window, self: Window, document: document, name: '', location: Location, …}
{name: 'obj', foo: ƒ}
String {'hello world'}
```

通过这个例子，我们可以知道：
* this和函数定义的位置没有关系，只和调用者有关系
* this是在运行时被绑定的

# 隐式绑定

1.通过对象调用函数绑定this

在这个例子中obj调用了foo()方法。因此this会隐式地被绑定obj对象上
```js
function foo() {
    console.log(this);
}

var obj = {
    name: "obj",
    foo: foo
}

obj.foo();
```
运行结果
```terminal
{name: 'obj', foo: ƒ}
```

下面这个例子可能会对初学者带来疑惑：

```js
function foo() {
    console.log(this);
}

var obj1 = {
    name: "obj1",
    foo: foo
}

var obj2 = {
    name: "obj2",
    obj1: obj1
}

obj2.obj1.foo();
```

结果是什么呢？是：
```terminal
{ name: 'obj1', foo: [Function: foo] }
```
所以**结论**是：永远记住，谁`直接`调用foo()（换言之，谁离foo()更近），那么foo()中的this就指向谁。

# 显式绑定

显式绑定有两种方法，call 和 bind

## call

```js
function foo() {
    console.log(this);
}

foo.call(window);
foo.call({name: "obj"});
foo.call(666);
```
运行结果：
```terminal
Window {window: Window, self: Window, document: document, name: '', location: Location, …}
{name: 'obj'}
Number {666}
```

## bind

foo()是原函数，bar是新函数（通过bind给bar绑定了调用者）。因此，今后执行bar的时候，函数中的this永远指向obj。

```js
function foo() {
    console.log(this);
}

var obj = {
    name: "obj",
}

var bar = foo.bind(obj);

bar();
```
运行结果:
```terminal
{ name: 'obj' }
```

# new关键字绑定

常见面试问题：通过new关键字创建一个新对象的步骤是什么？构造函数是如何创建新对象的？

当我们使用new关键字调用函数的时候，会执行如下操作：
1. 创建一个空对象
2. 空对象的\_\_proto\_\_属性指向构造函数的Prototype属性
3. 执行构造函数，如果构造函数中有this，则此this指向刚刚创建的空对象
4. 返回刚刚创建的对象

```js
function Student(name) {
    console.log(this); // Student {}
    this.name = name; // Student {name: "xiaoming"}
}

var xiaoming = new Student("xiaoming");
console.log(xiaoming.name);
```
运行结果：
```terminal
Student {}
xiaoming
```

# 显式、隐式、new绑定的优先级

显式绑定优先级高于隐式绑定

```js
function foo() {
    console.log(this);
}

var obj1 = {
    name: "obj1",
    foo: foo
}

var obj2 = {
    name: "obj2",
    foo: foo
}

// 隐式绑定
obj1.foo(); // obj1
obj2.foo(); // obj2

// 隐式绑定和显示绑定同时存在
obj1.foo.call(obj2); // obj2, 说明显示绑定优先级更高
```

new 绑定优先级高于隐式绑定

```js
function foo() {
    console.log(this);
}

var obj = {
    name: "obj",
    foo: foo
}

new obj.foo(); // foo {}
```

new绑定优先级高于显式绑定

```js
function foo() {
    console.log(this);
}

var obj = {
    name: "obj",
    foo: foo
}

var bar = foo.bind(obj);
var newObj = new bar();
```

所以，new绑定 > 显式绑定(bind) > 隐式绑定

# 面试题

面试题1
```js
function foo() {
    console.log(this);
}

var obj1 = {
    name: "obj1",
    foo: foo
}

var obj2 = {
    name: "obj2",
}

(obj2.foo = obj1.foo)();
```

面试题2

```js
var name = "全局window"

var person = {
    name: "person",
    sayName: function() {
        console.log(this.name);
    }
}

function sayName() {
    var fun = person.sayName;
    fun();
    person.sayName();
    (b = person.sayName) ();
}

sayName();
```

答案：
```terminal
面试题1
(obj2.foo = obj1.foo)() -> window

面试题2
fun() -> 全局window
person.sayName() -> person
(b = person.sayName)(); -> 全局window
```
