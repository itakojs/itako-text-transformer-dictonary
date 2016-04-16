// dependencies
import escapeRegexp from 'escape-regexp';

// @class ItakoTextTransformerDictionary
export default class ItakoTextTransformerDictionary {
  /**
  * @constructor
  * @param {object} options - a transformer options
  */
  constructor(options = {}) {
    this.name = 'dictionary';
    this.opts = {
      trim: true,
      ...options,
    };
  }

  /**
  * @method toRegExp
  * @param {string} pattern - a dictionary key
  * @returns {regexp} regexp - the replacer
  */
  toRegExp(pattern) {
    if (pattern[0] === '/') {
      return new RegExp(pattern.replace(/(^\/|\/$)/g, ''), 'gi');
    }
    return new RegExp(escapeRegexp(pattern), 'gi');
  }

  /**
  * @method transform
  * @param {tokens[]} originalTokens - a original token
  * @param {object} [dictionary={}] - a transformer options (via itako.option)
  * @returns {tokens[]} tokens - the transformed tokens
  */
  transform(originalTokens, dictionary = {}) {
    return originalTokens.map((originalToken) => {
      let tokens = [originalToken];
      for (const pattern in dictionary) {
        if (dictionary.hasOwnProperty(pattern) === false) {
          continue;
        }

        const regexp = this.toRegExp(pattern);
        const replace = dictionary[pattern];
        tokens = tokens.reduce((previous, token) =>
          previous.concat(this.createDictionaryTokens(token, regexp, replace))
        , []);
      }
      return tokens;
    });
  }

  /**
  * @method createDictionaryTokens
  * @param {token} originalToken - a source token
  * @param {regexp} regexp - a replace target
  * @param {string|object} replace - a replace word / new token properties
  * @returns {token[]} dictionaryToken - the modified tokens
  */
  createDictionaryTokens(originalToken, regexp, replace = {}) {
    if (originalToken.type !== 'text') {
      return originalToken;
    }

    const opts = typeof replace === 'string' ? { replace } : replace;
    const chunks = originalToken.value.split(regexp);
    if (chunks.length > 1) {
      if (typeof opts.replace === 'string') {
        return originalToken
          .clone({ transformer: this })
          .setValue(chunks.join(opts.replace));
      }

      const dictionaryToken = originalToken.clone({ transformer: this });
      for (const key in opts) {
        if (opts.hasOwnProperty(key) === false) {
          continue;
        }

        // 'key' -> 'setKey'
        const methodName = `set${key[0].toUpperCase()}${key.slice(1)}`;
        if (typeof dictionaryToken[methodName] === 'function') {
          dictionaryToken[methodName](opts[key]);
        }
      }

      const matches = originalToken.value.match(regexp);
      if (opts.rewrite && matches !== null) {
        if (opts.value === undefined) {
          dictionaryToken.setValue(matches[0]);
        }
        return dictionaryToken;
      }

      const children = [];
      // eslint-disable-next-line no-loop-func
      chunks.forEach((chunk, i) => {
        const normalizeChunk = this.opts.trim ? chunk.trim() : chunk;
        if (normalizeChunk.length) {
          const child = originalToken
            .clone({ transformer: this })
            .setValue(normalizeChunk);
          children.push(child);
        }

        if (i + 1 < chunks.length) {
          const child = dictionaryToken.clone({ transformer: this });
          if (opts.value === undefined) {
            const matchedValue = originalToken.value.match(regexp)[i];
            child.setValue(matchedValue);
          }
          children.push(child);
        }
      });

      return children;
    }

    return originalToken;
  }
}
