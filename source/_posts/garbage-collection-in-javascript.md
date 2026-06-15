---
title: Garbage Collection in JavaScript
date: 2026-02-22 22:12:18
updated: 2026-03-07 17:47:34
categories:
  - JavaScript
---

# 何为垃圾？

test在栈内存，{ name: "test"}和[1, 2, 3, 4, 5]都在堆内存中，{ name: "test"}被覆盖掉了，成了堆内存中的垃圾。

<!-- more -->

```js
let test = { name: "test"};

test = [1, 2, 3, 4, 5];

console.log(test);
```

# 引用计数法

是一种早期浏览器使用的方法。
