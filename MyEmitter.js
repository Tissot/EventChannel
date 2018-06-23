'use strict';

class MyEmitter {
  constructor() {
    this.maxListeners = 10;
    this.events = Object.create(null);
  }

  on(type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" must be a function.');
    }

    const event = this.events[type] = this.events[type] || [];
    if (event.length < this.maxListeners) {
      event.push(listener);
    } else {
      throw new RangeError(`${event.length} "${String(type)}" listeners added. Please increase emitter.maxListeners."`);
    }
  }

  emit(type, ...args) {
    const event = this.events[type];

    if (event) {
      let i = 0;
      while (i < event.length) {
        const listener = event[i];
        listener(...args);
        if (!listener.once) {
          ++i;
        }
      }
    }
  }

  off(type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" must be a function.');
    }

    const event = this.events[type];
    if (event) {
      for (let i = event.length - 1; i >= 0; --i) {
        if (event[i] === listener) {
          event.splice(i, 1);
          break;
        }
      }
    }
  }

  allOff(type) {
    this.events[type] = undefined;
  }

  once(type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" must be a function.');
    }

    const onceListener = (...args) => {
      listener(...args);
      this.off(type, onceListener);
    };
    onceListener.once = true;
    this.on(type, onceListener);
  }
}

// // // const test = new EventEmitter();
// // const test = new MyEmitter();

// // function foo() {
// //   console.log('foo');
// // }

// // test.once('233', foo);
// // test.on('233', () => console.log('bar'));
// // test.on('233', foo);
// // console.log(test)

// // test.emit('233');
// // // test.off('233', foo);
// // // test.emit('233');
