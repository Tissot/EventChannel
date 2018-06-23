'use strict';

class EventChannel {
  constructor() {
    let _maxListeners = 10;
    let _events = Object.create(null);

    Reflect.defineProperty(this, 'maxListeners', {
      enumerable: true,
      get() {
        return _maxListeners;
      },
      set(val) {
        if (val <= 0 || !Number.isInteger(val)) {
          throw new RangeError('property "maxListeners" must be a non-negative interger.');
        }

        _maxListeners = val;
      }
    });

    Reflect.defineProperty(this, 'events', {
      enumerable: true,
      get() {
        return _events;
      },
      set() {
        throw new Error('can not set property "event".');
      }
    });
  }

  /**
    * 添加 listener 函数到名为 eventName 的事件的监听器数组的末尾。
    * 不会检查 listener 是否已被添加。
    * 多次调用并传入相同的 eventName 和 listener 会导致 listener 被添加与调用多次。
    * 
    * @since 0.0.1
    * @param eventName {any} 事件名称。
    * @param listener {Function} 回调函数。
    * @returns {Object} 返回一个 EventChannel 引用，可以链式调用。
    * @example 
    * 
  */ 
  on(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('argument "listener" must be a function.');
    }

    const event = this.events[eventName] = this.events[eventName] || [];
    if (event.length < this.maxListeners) {
      event.push(listener);
    } else {
      throw new Error(`${event.length} "${String(eventName)}" listeners added. Please increase emitter.maxListeners."`);
    }

    return this;
  }

    /**
    * 添加一个单次 listener 函数到名为 eventName 的事件。
    * 下次触发 eventName 事件时，监听器会被调用，然后移除。
    * 
    * @since 0.0.1
    * @param eventName {any} 事件名称。
    * @param listener {Function} 回调函数。
    * @returns {Object} 返回一个 EventChannel 引用，可以链式调用。
    * @example 
    * 
  */ 
  once(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('argument "listener" must be a function.');
    }

    const onceListener = (...args) => listener.apply(this, args);
    onceListener.once = true;
    this.on(eventName, onceListener);
    return this;
  }

  /**
    * 从名为 eventName 的事件的监听器数组中移除指定的最后一个 listener。
    * removeListener 最多只会从监听器数组里移除一个监听器实例。 如果任何单一的监听器被多次添加到指定 eventName 的监听器数组中，则必须多次调用 removeListener 才能移除每个实例。
    * 
    * @since 0.0.1
    * @param eventName {any} 事件名称。
    * @param listener {Function} 回调函数。
    * @returns {Object} 返回一个 EventChannel 引用，可以链式调用。
    * @example 
    * 
  */ 
  off(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('argument "listener" must be a function.');
    }

    const event = this.events[eventName];
    if (event) {
      for (let i = event.length - 1; i >= 0; --i) {
        if (event[i] === listener) {
          event.splice(i, 1);
          break;
        }
      }
    }

    return this;
  }

  /**
    * 移除指定 eventName 的监听器数组中的所有 listener。
    * 
    * @since 0.0.1
    * @param eventName {any} 事件名称。
    * @returns {Object} 返回一个 EventChannel 引用，可以链式调用。
    * @example 
    * 
  */ 
  allOff(eventName) {
    this.events[eventName] = undefined;

    return this;
  }

  /**
    * 按监听器的注册顺序，同步地调用每个注册到名为 eventName 事件的监听器，并传入提供的参数。
    * 如果注册的为单次监听器，监听器调用之后被移除。
    * 
    * @since 0.0.1
    * @param eventName {any} 事件名称。
    * @param [...args] {Array} 传入回调函数的参数数组。
    * @returns {boolean} 如果事件有监听器，则返回 true ，否则返回 false。
    * @example 
    * 
  */ 
  emit(eventName, ...args) {
    const event = this.events[eventName];

    if (event) {
      let i = 0;
      while (i < event.length) {
        const listener = event[i];
        listener.apply(this, args);
        if (listener.once) {
          event.splice(i, 1);
        } else {
          ++i;
        }
      }

      return true;
    } else {
      return false;
    }
  }
}

module.exports = EventChannel;
