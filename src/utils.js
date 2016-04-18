// dependencies
import escapeRegexp from 'escape-regexp';

/**
* @module toRegExp
* @param {string} pattern - a dictionary key
* @returns {regexp} regexp - the replacer
*/
export function toRegExp(pattern) {
  if (pattern[0] === '/') {
    return new RegExp(pattern.replace(/(^\/|\/$)/g, ''), 'gi');
  }
  return new RegExp(escapeRegexp(pattern), 'gi');
}

export function normalizeDictionary(dictionary) {
  if (dictionary instanceof Array) {
    return dictionary;
  }

  const defines = [];
  for (const pattern in dictionary) {
    if (dictionary.hasOwnProperty(pattern) === false) {
      continue;
    }

    defines.push({
      pattern,
      options: dictionary[pattern],
    });
  }
  return defines;
}

/**
* @module setProps
* @param {token} token - a target
* @param {object} properties - a token properties
* @returns {token} - the modified token
*/
export function setProps(token, properties = {}) {
  for (const key in properties) {
    if (properties.hasOwnProperty(key) === false) {
      continue;
    }
    // 'key' -> 'setKey'
    const methodName = `set${key[0].toUpperCase()}${key.slice(1)}`;
    if (typeof token[methodName] === 'function') {
      token[methodName](properties[key]);
    }
  }
  return token;
}

/**
* @module resolveDollar
* @param {string} string - a target token value with the $ symbol ($1~)
* @param {array} matches - an array to replace the $
* @returns {value} - the modified string
*/
export function resolveDollar(string, matches = []) {
  if (typeof string !== 'string') {
    return string;
  }

  const value = string.replace(/\$(\d+)/g, (match, num) => matches[num - 1]);
  if (
    /^0x[0-9a-f]+$/i.test(value)
    || /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(value)
  ) {
    return Number(value);
  }
  return value;
}

/**
* @module resolveDollars
* @param {object} target - a target properties
* @param {array} matches - an array to replace the $
* @returns {object} - the modified properties
*/
export function resolveDollars(target = {}, matches = []) {
  const normalized = {};
  for (const key in target) {
    if (target.hasOwnProperty(key) === false) {
      continue;
    }

    const normalizedKey = resolveDollar(key, matches);
    if (typeof target[key] === 'object') {
      normalized[normalizedKey] = resolveDollars(target[key], matches);
    } else {
      normalized[normalizedKey] = resolveDollar(target[key], matches);
    }
  }
  return normalized;
}
