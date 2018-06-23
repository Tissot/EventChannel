'use strict';

const assert = require('assert');
const EventChannel = require('../src/EventChannel');

describe('EventChannel', () => {
  let myEmitter;

  const eventName0 = 'argument'
  const eventName1 = 'behavior';
  const eventName2 = 'returnVal';
  const eventName3 = 'this';

  const emitArgs = [];

  const types = [
    Number(),       // Number
    String(),       // String
    Boolean(),      // Boolean
    null,           // null
    undefined,      // undefined
    new Array(),    // Array
    new Object(),   // Object
    new Function()  // Function
  ];

  let invokedOrder = [];
  const listeners = [];

  before(() => {
    // 初始化 10 个不同的随机参数。
    for (let i = 0; i < 10; ++i) {
      let arg = '';
      for (let j = 0; j < 3; ++j) {
        const random = Math.floor(Math.random() * 10);
        arg += String(random);
      }
      emitArgs.push(arg);
    }

    // 初始化 10 个不同的多次监听器和 10 个不同的单次监听器。
    for (let i = 0; i < 10; ++i) {
      listeners.push((...args) => {
        if (args.length === emitArgs.length && args.every((arg, index) => arg === emitArgs[index])) {
          invokedOrder.push(listeners[i]);
        }
      });
    }

    for (let i = 0; i < 10; ++i) {
      const onceListener = (...args) => {
        if (args.length === emitArgs.length && args.every((arg, index) => arg === emitArgs[index])) {
          invokedOrder.push(listeners[i + 10]);
        }
      }
      onceListener.once = true;
      listeners.push(onceListener);
    }
  });

  beforeEach(() => {
    myEmitter = new EventChannel();
  });
  
  describe('maxListeners', () => {
    it('default value', () => assert.strictEqual(myEmitter.maxListeners, 10));

    it('limit', () => {
      assert.throws(
        () => myEmitter.maxListeners = 0,
        err => err.name === 'RangeError'
      );

      assert.throws(
        () => myEmitter.maxListeners = 10.2,
        err => err.name === 'RangeError'
      );

      assert.doesNotThrow(
        () => myEmitter.maxListeners = 1000
      );
    });
  });

  describe('events', () => {
    it('default value', () => assert.deepStrictEqual(myEmitter.events, Object.create(null)));

    console.log(myEmitter)
    it('constant', () => assert.throws(
        () => myEmitter.events = Object.create(null),
        err => err.name === 'Error'
    ));
  });

  describe('on', () => {
    it('argument "listener" type', () => {
      types.filter(type => typeof type !== 'function').forEach(type => assert.throws(
        () => myEmitter.on(eventName0, type),
        err => err.name === 'TypeError')
      );

      assert.doesNotThrow(() => myEmitter.on(eventName0, new Function()));
    });

    it('behavior', () => {
      const expectedOrder = [];
    
      myEmitter.maxListeners = 1000;
      for (let i = 0; i < myEmitter.maxListeners; ++i) {
        const random = Math.floor(Math.random() * 10);
        expectedOrder.push(listeners[random]);
        myEmitter.on(eventName1, listeners[random]);
      }
  
      assert.deepStrictEqual(myEmitter.events[eventName1], expectedOrder);

      assert.throws(
        () => myEmitter.on(eventName1, listeners[0]),
        err => err.name === 'Error'
      );
    });

    it('return value', () => {
      const returnVal = myEmitter.on(eventName2, listeners[0]);

      assert.deepStrictEqual(returnVal, myEmitter);
    });
  })

  describe('once', () => {
    it('argument "listener" type', () => {
      types.filter(type => typeof type !== 'function').forEach(type => assert.throws(
        () => myEmitter.once(eventName0, type),
        err => err.name === 'TypeError')
      );

      assert.doesNotThrow(() => myEmitter.once(eventName0, new Function()));
    });

    it('behavior', () => {
      const expectedOrder = [];
      const event = myEmitter.events[eventName1] = myEmitter.events[eventName1] || [];
  
      myEmitter.maxListeners = 1000;
      for (let i = 0; i < myEmitter.maxListeners; ++i) {
        const random = Math.floor(Math.random() * 10);
        expectedOrder.push(listeners[random]);
        myEmitter.once(eventName1, listeners[random]);
  
        assert.strictEqual(event[i].once, true);
  
        event[i](...emitArgs);
      }
  
      assert.deepStrictEqual(invokedOrder, expectedOrder);
  
      invokedOrder = [];

      assert.throws(
        () => myEmitter.once(eventName1, listeners[0]),
        err => err.name === 'Error'
      );
    });

    it('return value', () => {
      const returnVal = myEmitter.once(eventName2, listeners[0]);

      assert.deepStrictEqual(returnVal, myEmitter);
    });
  });

  describe('off', () => {
    it('argument "listener" type', () => {
      types.filter(type => typeof type !== 'function').forEach(type => assert.throws(
        () => myEmitter.off(eventName0, type),
        err => err.name === 'TypeError')
      );

      assert.doesNotThrow(() => myEmitter.off(eventName0, new Function()));
    });

    it('behavior', () => {
      const expectedOrder = [];
      const event = myEmitter.events[eventName1] = myEmitter.events[eventName1] || [];
  
      myEmitter.maxListeners = 1000;
      for (let i = 0; i < myEmitter.maxListeners; ++i) {
        const random = Math.floor(Math.random() * 10);
        expectedOrder.push(listeners[random]);
        event.push(listeners[random]);
      }
  
      for (let i = 0; i < myEmitter.maxListeners / 2; ++i) {
        const random = Math.floor(Math.random() * 10);
        for (let j = expectedOrder.length - 1; j >= 0; --j) {
          if (expectedOrder[j] === listeners[random]) {
            expectedOrder.splice(j, 1);
            break;
          }
        }
        myEmitter.off(eventName1, listeners[random]);
      }
  
      assert.deepStrictEqual(event, expectedOrder);
    });

    it('return value', () => {
      const returnVal = myEmitter.off(eventName2, listeners[0]);

      assert.deepStrictEqual(returnVal, myEmitter);
    });
  });

  describe('allOff', () => {
    it ('behavior', () => {
      myEmitter.events[eventName1] = myEmitter.events[eventName1] || [];
  
      myEmitter.maxListeners = 1000;
      for (let i = 0; i < myEmitter.maxListeners; ++i) {
        const random = Math.floor(Math.random() * 10);
        myEmitter.events[eventName1].push(listeners[random]);
      }
  
      myEmitter.allOff(eventName1);
  
      assert.strictEqual(myEmitter.events[eventName1], undefined);
    });

    it('return value', () => {
      const returnVal = myEmitter.allOff(eventName2, listeners[0]);

      assert.deepStrictEqual(returnVal, myEmitter);
    });
  });

  describe('emit', () => {
    it('behavior', () => {
      const expectedOrder = [];
      const event = myEmitter.events[eventName1] = myEmitter.events[eventName1] || [];
  
      myEmitter.maxListeners = 1000;
      for (let i = 0; i < myEmitter.maxListeners; ++i) {
        const random = Math.floor(Math.random() * 10 + 10);
        expectedOrder.push(listeners[random]);
        event.push(listeners[random]);
      }
  
      myEmitter.emit(eventName1, ...emitArgs);
  
      assert.deepStrictEqual(invokedOrder, expectedOrder);
  
      invokedOrder = [];
  
      let i = 0;
      while (i < expectedOrder.length) {
        if (expectedOrder[i].once) {
          expectedOrder.splice(i, 1);
        } else {
          ++i;
        }
      }
  
      myEmitter.emit(eventName1, ...emitArgs);
  
      assert.deepStrictEqual(invokedOrder, expectedOrder);
    });

    it('return value', () => {
      let returnVal = myEmitter.emit(eventName2);
  
      assert.strictEqual(returnVal, false);

      returnVal = myEmitter.on(eventName2, listeners[0]).emit(eventName2);

      assert.strictEqual(returnVal, true);
    });
  });

  describe('"this" in listener', () => {
    it('normal function', () => {
      function listener () {
        assert.deepStrictEqual(this, myEmitter);
      }

      myEmitter.on(eventName3, listener).once(eventName3, listener).emit(eventName3);
    });

    it('arrow function', () => {
      const listener = () => {
        assert.deepStrictEqual(this, {});
      };

      myEmitter.on(eventName3, listener).once(eventName3, listener).emit(eventName3);
    });
  });
});
