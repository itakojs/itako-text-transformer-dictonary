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
    return utils.normalizeDictionary(dictionary).reduce((tokens, define) => {
      const { pattern, options } = define;
      const opts = typeof options === 'string' ? { replace: options } : options;
      if (opts.rewrite) {
        return this.rewrite(tokens, pattern, options);
      }
      if (opts.replace) {
        return tokens.reduce(
          (previous, token) => previous.concat(this.replace(token, pattern, opts)),
          [],
        );
      }
      if (opts.toggle) {
        return tokens.reduce(
          (previous, token) => previous.concat(this.toggle(token, pattern, opts)),
          [],
        );
      }
      if (opts.exchange) {
        return tokens.reduce(
          (previous, token) => previous.concat(this.exchange(token, pattern, opts)),
          [],
        );
      }
      return tokens;
    }, originalTokens);
  }

  /**
  * @method rewrite
  * @param {token[]} originalTokens - a target tokens
  * @param {string} pattern - a replace target
  * @param {object} opts - use rewrite and onMatch option
  * @returns {tokens[]} tokens - ignore or return the modified tokens
  */
  rewrite(originalTokens, pattern, opts = {}) {
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

      const normalizedProps = utils.resolveDollars(opts.rewrite, matches);
      const token = utils.setProps(
        originalToken
          .clone({ transformer: this, rewrite: true })
          .setValue(value),
        normalizedProps,
      );

      const onMatch = opts.onMatch || (() => true);
      if (onMatch.call(this, token, normalizedProps, matches) === false) {
        return originalTokens;
      }
      return [token];
    }

    return originalTokens;
  }

  /**
  * @method toggle
  * @param {token} originalToken - a source token
  * @param {string} pattern - a replace target
  * @param {object} opts - use replace and onMatch option
  * @returns {token} replacedToken - ignore or return the modified tokens
  */
  replace(originalToken, pattern, opts = {}) {
    if (originalToken.type !== 'text') {
      return originalToken;
    }

    const regexp = utils.toRegExp(pattern);
    const [value, ...matches] = regexp.exec(originalToken.value) || [''];
    if (typeof opts.replace === 'string' && value.length) {
      const token = originalToken
        .clone({ transformer: this })
        .setValue(originalToken.value.replace(regexp, opts.replace));

      const onMatch = opts.onMatch || (() => true);
      if (onMatch.call(this, token, opts.replace, matches) !== false) {
        return token;
      }
    }
    return originalToken;
  }

  /**
  * @method toggle
  * @param {token} originalToken - a source token
  * @param {string} pattern - a replace target
  * @param {object} opts - use toggle and onMatch option
  * @returns {token|token[]} toggledTokens - ignore or return the modified tokens
  */
  toggle(originalToken, pattern, opts = {}) {
    if (originalToken.type !== 'text') {
      return originalToken;
    }

    const regexp = utils.toRegExp(pattern);

    const children = [];
    let result = regexp.exec(originalToken.value);
    let lastIndexOf = 0;
    let normalizedOptions = {};
    while (result) {
      const [value, ...matches] = result;
      if (result.index > lastIndexOf) {
        const leftValue = originalToken.value.slice(lastIndexOf, result.index);
        const normalizedValue = this.opts.trim ? leftValue.trim() : leftValue;
        if (normalizedValue) {
          children.push(
            originalToken
            .clone({ transformer: this })
            .setOptions(normalizedOptions)
            .setValue(normalizedValue),
          );
        }
      }
      lastIndexOf = result.index + value.length;

      const resolvedOptions = utils.resolveDollars(opts.toggle, matches);
      const token = originalToken
        .clone({ transformer: this })
        .setValue(value)
        .setOptions(resolvedOptions);
      const onMatch = opts.onMatch || (() => true);
      if (onMatch.call(this, token, resolvedOptions, matches) === false) {
        return originalToken;
      }
      normalizedOptions = resolvedOptions;

      result = regexp.exec(originalToken.value);
    }
    if (originalToken.value.length > lastIndexOf) {
      const value = originalToken.value.slice(lastIndexOf);
      const normalizedValue = this.opts.trim ? value.trim() : value;
      children.push(
        originalToken
        .clone({ transformer: this })
        .setOptions(normalizedOptions)
        .setValue(normalizedValue),
      );
    }

    return children;
  }

  /**
  * @method exchange
  * @param {token} originalToken - a source token
  * @param {string} pattern - a replace target
  * @param {object} opts - use exchange and onMatch option
  * @returns {token|token[]} exchangedToken - ignore or return the modified tokens
  */
  exchange(originalToken, pattern, opts = {}) {
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
            .clone({ transformer: this })
            .setValue(normalizedValue),
          );
        }
      }
      lastIndexOf = result.index + value.length;

      const normalizedPropties = utils.resolveDollars(opts.exchange, matches);
      const token = originalToken
        .clone({ transformer: this })
        .setValue(value);
      const onMatch = opts.onMatch || (() => true);
      if (onMatch.call(this, token, normalizedPropties, matches) === false) {
        return originalToken;
      }

      children.push(
        utils.setProps(
          token,
          normalizedPropties,
        )
      );
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
