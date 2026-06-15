---
title: Handwrite JavaScript
date: 2026-02-24 13:04:08
updated: 2026-05-16 19:33:34
categories:
  - JavaScript
---

# call

See this branch: [https://github.com/leonleerl/handwrite-js/tree/call](https://github.com/leonleerl/handwrite-js/tree/call)

<!-- more -->

call 允许一个函数在另一个对象的上下文中执行，也就是说你可以借用一个函数，并临时将它的 this 指向任意对象。

call allows a function to be executed in the context of a different object, meaning you can borrow a function and temporarily point its this to any object you want.
```js
Function.prototype.myCall = function (context, ...args) {
    context = context || window;
    context.fn = this;
    const result = context.fn(...args);
    delete context.fn;
    return result;
  };
  
  const dog = {
    name: "Dog~",
    sayHi: function () {
      console.log(`I'm ${this.name}`);
    }
  };
  
  const cat = {
    name: "Cat~"
  };
  
dog.sayHi.myCall(cat);

```

# apply

See this branch: [https://github.com/leonleerl/handwrite-js/tree/apply](https://github.com/leonleerl/handwrite-js/tree/apply)

apply 和 call 作用完全相同，都是借用函数并临时将 this 指向任意对象。唯一的区别是参数传递方式：apply 要求把所有参数放进一个数组里传入。

apply does exactly the same thing as call. It borrows a function and temporarily points its this to any object you want. The only difference is how arguments are passed: apply requires all arguments to be packed into an array.

```js
Function.prototype.myApply = function (context, args) {
    context = context == null ? window : Object(context);
    const key = Symbol();
    context[key] = this;
    const result = args ? context[key](...args) : context[key]();
    delete context[key];
    return result;
  };

const dog = {
    name: "Dog Charlie",

    getName: function() {
        return this.name;
    },

    getSum: function(...args) {
        return args.reduce((acc, curr) => acc + curr, 0);
    }
}

const cat = {
    name: "Cat Lily",
}

console.log(dog.getSum.myApply(cat, [1, 2, 3, 4, 5])); // 15
```

# bind

See this branch: [https://github.com/leonleerl/handwrite-js/tree/bind](https://github.com/leonleerl/handwrite-js/tree/bind)

bind 和 call/apply 的作用相同，都是将函数的 this 绑定到指定对象上。区别在于 bind 不会立即执行函数，而是返回一个永久绑定了 this 的新函数，让你在任何时候调用它，this 都不会丢失。

bind does the same thing as call/apply. It ties a function's this to a specific object. The difference is that bind doesn't execute the function immediately. Instead, it returns a new function with this permanently locked in, so no matter when or where you call it, this will never be lost.

```js
Function.prototype.myCall = function (context, ...args) {
    context = context || window;
    context.fn = this;
    const result = context.fn(...args);
    delete context.fn;
    return result;
  };

  Function.prototype.myBind = function (context, ...args1) {
    const fn = this;
  
    function boundFunction(...args2) {
    // if it is new called
      if (this instanceof boundFunction) {
        return new fn(...args1, ...args2);
      }
  
      return fn.apply(context, [...args1, ...args2]);
    }
  
    // maintain the prototype chain
    boundFunction.prototype = Object.create(fn.prototype);
  
    return boundFunction;
  };

  function foo(a, b) {
    console.log(this.name);
    return a + b;
  }
  
  const obj = { name: "obj" };
  
  // bind will not execute immediately, it will return a new function
  const boundFoo = foo.myBind(obj, 1);
  
  const result = boundFoo(2); // obj
  console.log(result); // 3

```

# new

See this branch: [https://github.com/leonleerl/handwrite-js/tree/new](https://github.com/leonleerl/handwrite-js/tree/new)

当你写new Foo()的时候，JS内部做了四件事情：

1. 创建一个空对象
2. 把空对象的prototype指向构造函数的prototype
3. 把构造函数的this绑定到这个空对象上并执行
4. 判断构造函数的返回值。如果构造函数返回的是一个对象，就返回那个对象；否则，返回我们创建的空对象obj。

```js
function myNew(Constructor, ...args) {
    const obj = {};
    obj.__proto__ = Constructor.prototype;
    const result = Constructor.call(obj, ...args);
    
    return result !== null && typeof result === "object" ? result : obj;
}

function Person(name, age) {
    this.name = name;
    this.age = age;

    // this.sayHi = function() {
    //     console.log(`Hello, my name is ${this.name}, and I'm ${this.age} years old.`);
    // }
}

Person.prototype.sayHi = function() {
    console.log(`Hello, my name is ${this.name}, and I'm ${this.age} years old.`);
}

const person = myNew(Person, "John", 20);
person.sayHi();
```

# instanceof

See this branch: [https://github.com/leonleerl/handwrite-js/tree/instanceof](https://github.com/leonleerl/handwrite-js/tree/instanceof)

instanceof 用来判断一个对象是否是某个构造函数的实例。

```js
person instanceof Person // true
```

执行过程：

1. 取得右边构造函数的prototype
2. 取得左边构造函数的prototype
3. 判断两者是否相等，相等则返回true
4. 不相等则继续往上找，一直找到 null 为止

```js
person.__proto__ 
    → Person.prototype ✅ 找到了，返回 true

// 如果没找到，继续往上：
person.__proto__.__proto__ 
    → Object.prototype

person.__proto__.__proto__.__proto__ 
    → null，返回 false
```
实现代码：
```js
function myInstanceof(left, right) {
    right_prototype = right.prototype;
    let left_prototype = left.__proto__;
    while (true) {
        if (left_prototype === right_prototype) {
            return true;
        }
        if (left_prototype === null) {
            return false;
        }
        left_prototype = left_prototype.__proto__;
    }
}

function Person(name, age) {
    this.name = name;
    this.age = age;
}

const person = new Person("John", 20);
console.log(myInstanceof(person, Person)); // true

console.log(myInstanceof([], Array)); // true
console.log(myInstanceof("", String)); // true
```

# Promise

```js
class MyPromise {

    static PENDING = "pending";
    static FULFILLED = "fulfilled";
    static REJECTED = "rejected";

    constructor(executor) {
        this.status = MyPromise.PENDING;
        this.value = null;
        this.callbacks = [];
        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (error) {
            this.reject(error);
        }
    }

    resolve(value) {
        if (this.status !== MyPromise.PENDING) return;
        this.status = MyPromise.FULFILLED;
        this.value = value;
        setTimeout(() => {
        this.callbacks.map(callback => {
                callback.onFulfilled(value);
            })
        }, 0)
    }

    reject(reason) {
        if (this.status !== MyPromise.PENDING) return;
        this.status = MyPromise.REJECTED;
        this.value = reason;
        setTimeout(() => {
            this.callbacks.map(callback => {
                callback.onRejected(reason);
            })
        }, 0)
    }

    then(onFulfilled, onRejected) {
        if (typeof onFulfilled !== 'function') {
            onFulfilled = () => { this.value };
        }
        if (typeof onRejected !== 'function') {
            onRejected = () => { this.value };
        }
        return new MyPromise((resolve, reject) => {
            if (this.status === MyPromise.PENDING) {
                this.callbacks.push({
                    onFulfilled: (value) => {
                        try {
                            let result = onFulfilled(value);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    },
                    onRejected: (reason) => {
                        try {
                            let result = onRejected(reason);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }
                })
            }
            if (this.status === MyPromise.FULFILLED) {
                setTimeout(() => {
                    try {
                        let result = onFulfilled(this.value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }, 0)
            }
            if (this.status === MyPromise.REJECTED) {
                setTimeout(() => {
                    try {
                        let result = onRejected(this.value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }, 0)
            }
        });
    }
}

```
