---
title: Key Concepts in JavaScript
date: 2025-11-14 14:46:47
updated: 2026-02-01 15:53:37
categories:
  - JavaScript
---

# this
1."this" is the object that calls the method.
```javascript
let cat = {
    name: "Tom",
    sayName() {
        console.log("My name is " + this.name);
    }
}
cat.sayName();
```
The output:
`My name is Tom`

2.Global functions are essentially methods of the `window`.
```js
function func(){
    console.log(this);
}
func();
```
The output:
`[object Window]`

<!-- more -->

3.dom element
```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <button id="btn">Click me</button>
</body>
<script>
    const btn = document.getElementById("btn");
    btn.onclick = function(){
        console.log(this);
    }
</script>
</html>
```
The output is:
`<button id="btn">Click me</button>`

4.However, if we write like this, the output is surprisingly changed.
```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <button id="btn">Click me</button>
</body>
<script>
    const btn = document.getElementById("btn");
    btn.onclick = () =>{
        console.log(this);
    }
</script>
</html>
```
The output is:
`[object Window]`

**Why this happened?**

 Regular Function `function() {}`  has `dynamic this binding`, while Arrow Function `() => {}` has `lexical this binding`. 

For Regular Function: `this` refers to the element that triggered the event.

For Arrow Function: `this` is determined by where the function is defined, not how it's called.
