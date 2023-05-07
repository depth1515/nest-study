// 版本1 未使用Ioc容器
// class A {
//   constructor(params) {
//     this.params = params;
//   }
// }

// class B extends A {
//   constructor(params) {
//     super(params);
//   }
//   run() {
//     console.log(this.params);
//   }
// }

// new B('hello').run();

// 版本2 使用Ioc容器

class A {
  constructor(params) {
    this.params = params;
  }
}

class C {
  constructor(params) {
    this.params = params;
  }
}

class Container {
  constructor() {
    this.modules = {};
  }
  provide(key, object) {
    this.modules[key] = object;
  }
  get(key) {
    return this.modules[key];
  }
}

const mo = new Container();
mo.provide('a', new A('hello'));
mo.provide('c', new C('hello'));

class B {
  constructor(container) {
    this.a = container.get('a');
    this.c = container.get('c');
  }
  run() {
    console.log(this.a.params + '--' + this.c.params);
  }
}

new B(mo).run();
