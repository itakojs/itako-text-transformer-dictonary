// self dependencies
import * as utils from './utils';

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
  * @method transform
  * @param {tokens[]} originalTokens - a original token
  * @param {object} [dictionary={}] - a transformer options (via itako.option)
  * @returns {tokens[]} tokens - the transformed tokens or ignore
  */
  transform(originalTokens, dictionary = {}) {
    const defines = utils.normalizeDictionary(dictionary);
    return defines.reduce((tokens, define) => {
      switch (define.method) {
        case 'rewrite':
          return this.rewrite(tokens, define);

        case 'replace':
          return tokens.reduce(
            (previous, token) =>
              previous.concat(this.replace(token, define)),
            [],
          );

        case 'toggle':
          return tokens.reduce(
            (previous, token) =>
              previous.concat(this.toggle(token, define)),
            [],
          );

        case 'exchange':
          return tokens.reduce(
            (previous, token) =>
              previous.concat(this.exchange(token, define)),
            [],
          );

        default:
          return tokens;
      }
    }, originalTokens);
  }

  /**
  * @method rewrite
  * @param {token[]} originalTokens - a target tokens
  * @param {object} define - a replacement define
  * @returns {tokens[]} tokens - ignore or return the modified tokens
  */
  rewrite(originalTokens, define) {
    const { pattern, replacement } = define;
    const regexp = utils.toRegExp(pattern);

    for (let i = 0; i < originalTokens.length; i++) {
      const originalToken = originalTokens[i];
      if (originalToken.type !== 'text') {
        continue;
      }
      const [value, ...matches] = regexp.exec(originalToken.value) || [];
      if (value === undefined) {
        continue;
      }

      const normalizedProps = utils.resolveDollars(replacement, matches);
      const token = utils.setProps(
        originalToken
          .clone({ transformer: this, define })
          .setValue(value),
        normalizedProps,
      );

      const onMatch = this.opts.onMatch || (() => true);
      if (onMatch.call(this, define, originalToken, token, matches) === false) {
        return originalTokens;
      }
      return [token];
    }

    return originalTokens;
  }

  /**
  * @method replace
  * @param {token} originalToken - a source token
  * @param {object} define - a replacement define
  * @returns {token} replacedToken - ignore or return the modified tokens
  */
  replace(originalToken, define) {
    const { pattern, replacement } = define;
    if (originalToken.type !== 'text') {
      return originalToken;
    }

    const regexp = utils.toRegExp(pattern);
    const [value, ...matches] = regexp.exec(originalToken.value) || [''];
    if (typeof replacement.value === 'string' && value.length) {
      const token = originalToken
        .clone({ transformer: this, define })
        .setValue(originalToken.value.replace(regexp, replacement.value));

      const onMatch = this.opts.onMatch || (() => true);
      if (onMatch.call(this, define, originalToken, token, matches) !== false) {
        return token;
      }
    }
    return originalToken;
  }

  /**
  * @method toggle
  * @param {token} originalToken - a source token
  * @param {object} define - a replacement define
  * @returns {token|token[]} toggledTokens - ignore or return the modified tokens
  */
  toggle(originalToken, define) {
    const { pattern, replacement } = define;
    if (originalToken.type !== 'text') {
      return originalToken;
    }

    const regexp = utils.toRegExp(pattern);

    const children = [];
    let result = regexp.exec(originalToken.value);
    let lastIndexOf = 0;

    let currentToken = {};
    while (result) {
      const [value, ...matches] = result;
      if (result.index > lastIndexOf) {
        const leftValue = originalToken.value.slice(lastIndexOf, result.index);
        const normalizedValue = this.opts.trim ? leftValue.trim() : leftValue;
        if (normalizedValue) {
          children.push(
            originalToken
            .clone({ transformer: this, define })
            .setOptions(currentToken.options)
            .setValue(normalizedValue),
          );
        }
      }
      lastIndexOf = result.index + value.length;

      const normalizedOptions = utils.resolveDollars(replacement, matches);
      currentToken = originalToken
        .clone({ transformer: this, define })
        .setValue(value)
        .setOptions(normalizedOptions);
      const onMatch = this.opts.onMatch || (() => true);
      if (onMatch.call(this, define, originalToken, currentToken, matches) === false) {
        return originalToken;
      }

      result = regexp.exec(originalToken.value);
    }
    if (originalToken.value.length > lastIndexOf) {
      const value = originalToken.value.slice(lastIndexOf);
      const normalizedValue = this.opts.trim ? value.trim() : value;
      children.push(
        originalToken
        .clone({ transformer: this })
        .setOptions(currentToken.options)
        .setValue(normalizedValue),
      );
    }

    return children;
  }

  /**
  * @method exchange
  * @param {token} originalToken - a source token
  * @param {object} define - a replacement define
  * @returns {token|token[]} exchangedToken - ignore or return the modified tokens
  */
  exchange(originalToken, define) {
    const { pattern, replacement } = define;
    if (originalToken.type !== 'text') {
      return originalToken;
    }

    const regexp = utils.toRegExp(pattern);

    const children = [];
    let result = regexp.exec(originalToken.value);
    let lastIndexOf = 0;
    while (result) {
      const [value, ...matches] = result;
      if (result.index > lastIndexOf) {
        const leftValue = originalToken.value.slice(lastIndexOf, result.index);
        const normalizedValue = this.opts.trim ? leftValue.trim() : leftValue;
        if (normalizedValue) {
          children.push(
            originalToken
            .clone({ transformer: this, define })
            .setValue(normalizedValue),
          );
        }
      }
      lastIndexOf = result.index + value.length;

      const normalizedProps = utils.resolveDollars(replacement, matches);
      const token = utils.setProps(
       originalToken
         .clone({ transformer: this, define })
         .setValue(value),
       normalizedProps,
     );
      const onMatch = this.opts.onMatch || (() => true);
      if (onMatch.call(this, define, originalToken, token, matches) === false) {
        return originalToken;
      }

      children.push(token);
      result = regexp.exec(originalToken.value);
    }
    if (originalToken.value.length > lastIndexOf) {
      const value = originalToken.value.slice(lastIndexOf);
      const normalizedValue = this.opts.trim ? value.trim() : value;
      children.push(
        originalToken
        .clone({ transformer: this })
        .setValue(normalizedValue),
      );
    }

    return children;
  }
}
