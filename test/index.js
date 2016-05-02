// dependencies
import assert from 'assert';
import sinon from 'sinon';
import Itako from 'itako';

// target
import ItakoTextTransformerDictionary from '../src';

// fixture
const transform = (words, options, transformerOptions = {}) => {
  const transformer = new ItakoTextTransformerDictionary(transformerOptions);
  const path = 'transformers.dictionary.options';
  const itako = new Itako([], [transformer]).setOption(path, options);
  return itako.transform(words);
};

// specs
describe('use rewrite option', () => {
  it('if rewrite is true, it should be replaced with a new token', () => {
    const tokens = transform('abc', {
      b: { exchange: { type: 'extra' } },
      '/(a)/': { rewrite: { type: 'audio', value: '02 Hyperballad.m4$1' } },
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'audio');
    assert(tokens[0].value === '02 Hyperballad.m4a');
  });

  it('should ignore unless text token', () => {
    const tokens = transform('abc', {
      '/.+/': { rewrite: { type: 'ignoreme' } },
      a: { rewrite: { type: 'audio', value: '02 Hyperballad.m4$1' } },
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'ignoreme');
    assert(tokens[0].value === 'abc');
  });
});

describe('use replace option', () => {
  it('it should be replaced by case-insensitive', () => {
    assert(transform('🍣', { '🍣': '🍕' })[0].value === '🍕');
    assert(transform('foo', { foo: 'bar' })[0].value === 'bar');
    assert(transform('foobar', { foo: 'bar' })[0].value === 'barbar');
    assert(transform('foofoo', { foo: 'bar' })[0].value === 'barbar');
    assert(transform('FooFoo', { foo: 'bar' })[0].value === 'barbar');
    assert(transform('日本語', { 日本語: 'jp' })[0].value === 'jp');

    assert(transform('foo', { foo: { replace: 'bar' } })[0].value === 'bar');
  });

  it('if type is text, it will continue to apply the definition', () => {
    assert(transform('abc', { a: 'b', b: 'c' })[0].value === 'ccc');
  });

  it('if prefix is slash, it should replace as regular expression', () => {
    assert(transform('foofoo', { '/^foo/': 'bar' })[0].value === 'barfoo');
    assert(transform('foofoo', { '/foo$/': 'bar' })[0].value === 'foobar');
    assert(transform('foofoo', { '/^foo$/': 'bar' })[0].value === 'foofoo');
    assert(transform('foofoo', { '/(foo)/': '$1bar' })[0].value === 'foobarfoobar');
    assert(transform('foofoo', { '/(f)(o)o/': '$1$2$2' })[0].value === 'foofoo');
  });

  it('should ignore unless text token', () => {
    const tokens = transform('foo', {
      '/.+/': { rewrite: { type: 'ignoreme' } },
      foo: { replace: 'bar' },
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'ignoreme');
    assert(tokens[0].value === 'foo');
  });
});

describe('use exchange option', () => {
  it('it should create a new token using defined the properties', () => {
    const tokens = transform('abc', {
      a: { exchange: { type: 'audio' } },
      b: { exchange: "{ type: 'extra', value: 'beep' }" },
    });
    assert(tokens.length === 3);
    assert(tokens[0].type === 'audio');
    assert(tokens[0].value === 'a');
    assert(tokens[1].type === 'extra');
    assert(tokens[1].value === 'beep');
    assert(tokens[2].type === 'text');
    assert(tokens[2].value === 'c');
  });

  it('if specify subpattern in key, should replace the $ properties by using the sub-pattern', () => {
    const tokens = transform('volume:1', {
      '/(volume):(\\d)/': { exchange: { type: 'audio', options: { $1: '$2' } } },
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'audio');
    assert(tokens[0].value === 'volume:1');
    assert(tokens[0].options.volume === 1);
  });

  it('should ignore unless text token', () => {
    const tokens = transform('volume:1', {
      '/.+/': { rewrite: { type: 'ignoreme' } },
      '/(volume):(\\d)/': { exchange: "{ type: 'audio', options: { $1: '$2' } }" },
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'ignoreme');
    assert(tokens[0].value === 'volume:1');
  });
});

describe('use toggle option', () => {
  it('should toggle the options from the matching value', () => {
    const tokens = transform('1ふー2ばー3ばず4', {
      '/(\\d)/': { toggle: { volume: '$1' } },
    });
    assert(tokens.length === 3);
    assert(tokens[0].value === 'ふー');
    assert(tokens[0].options.volume === 1);
    assert(tokens[1].value === 'ばー');
    assert(tokens[1].options.volume === 2);
    assert(tokens[2].value === 'ばず');
    assert(tokens[2].options.volume === 3);
  });

  it('if specify subpattern in key, should replace the $ options by using the sub-pattern', () => {
    const tokens = transform('(volume:1)abc', {
      '/\\((volume):(\\d)\\)/': { toggle: { $1: '$2' } },
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'text');
    assert(tokens[0].value === 'abc');
    assert(tokens[0].options.volume === 1);
  });

  it('should ignore unless text token', () => {
    const tokens = transform('(volume:1)abc', {
      '/.+/': { rewrite: { type: 'ignoreme' } },
      '/\\((volume):(\\d)\\)/': "{ toggle: { $1: '$2' } }",
    });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'ignoreme');
    assert(tokens[0].value === '(volume:1)abc');
  });
});

describe('use onMatch option', () => {
  it('it should pass the token and properties and matches to the onMatch callback', () => {
    const onMatch = sinon.spy(() => true);
    const words = 'lorem ipsum dolor sit amet, consectetur adipisicing elit.';
    const tokens = transform(words, {
      '/(lorem)/': { replace: 'ろーれむ' },
      ipsum: { exchange: { value: 'いぷさむ' } },
      '/(dolor)/': { toggle: { speaker: '$1' } },
      '/(sit|amet|consectetur|adipisicing|elit)/': { rewrite: { type: 'foo' } },
    }, { onMatch });
    assert(tokens.length === 1);
    assert(tokens[0].type === 'foo');
    assert(tokens[0].value === 'sit');

    assert(onMatch.callCount === 4);
    assert(onMatch.args[0].length === 4);
    assert(onMatch.args[0][0].method === 'replace');
    assert(onMatch.args[0][0].replacement.value === 'ろーれむ');
    assert(onMatch.args[0][1].value === 'lorem ipsum dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[0][2].value === 'ろーれむ ipsum dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[0][3].length === 1);
    assert(onMatch.args[0][3][0] === 'lorem');

    assert(onMatch.args[1].length === 4);
    assert(onMatch.args[1][0].method === 'exchange');
    assert(onMatch.args[1][0].replacement.value === 'いぷさむ');
    assert(onMatch.args[1][1].value === 'ろーれむ ipsum dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[1][2].value === 'いぷさむ');
    assert(onMatch.args[1][3].length === 0);

    assert(onMatch.args[2].length === 4);
    assert(onMatch.args[2][0].method === 'toggle');
    assert(onMatch.args[2][0].replacement.speaker === '$1');
    assert(onMatch.args[2][1].value === 'dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[2][2].options.speaker === 'dolor');
    assert(onMatch.args[2][3].length === 1);
    assert(onMatch.args[2][3][0] === 'dolor');

    assert(onMatch.args[3].length === 4);
    assert(onMatch.args[3][0].method === 'rewrite');
    assert(onMatch.args[3][0].replacement.type === 'foo');
    assert(onMatch.args[3][1].value === 'sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[3][2].value === 'sit');
    assert(onMatch.args[3][2].type === 'foo');
    assert(onMatch.args[3][3].length === 1);
    assert(onMatch.args[3][3][0] === 'sit');
  });

  it('if return value is false, it should not change the token', () => {
    const onMatch = sinon.spy(() => false);
    const words = 'lorem ipsum dolor sit amet, consectetur adipisicing elit.';
    const tokens = transform(words, {
      '/(lorem)/': { replace: 'ろーれむ' },
      ipsum: { exchange: "{ value: 'いぷさむ' }" },
      '/(dolor)/': { toggle: { speaker: '$1' } },
      '/(sit|amet|consectetur|adipisicing|elit)/': { rewrite: { type: 'foo' } },
    }, { onMatch });

    assert(tokens.length === 1);
    assert(tokens[0].type === 'text');
    assert(tokens[0].value === 'lorem ipsum dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.callCount === 4);
    assert(onMatch.args[0].length === 4);
    assert(onMatch.args[0][0].method === 'replace');
    assert(onMatch.args[0][0].replacement.value === 'ろーれむ');
    assert(onMatch.args[0][1].value === 'lorem ipsum dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[0][2].value === 'ろーれむ ipsum dolor sit amet, consectetur adipisicing elit.');
    assert(onMatch.args[0][3].length === 1);
    assert(onMatch.args[0][3][0] === 'lorem');
  });
});

describe('mixin', () => {
  it('in many options, it should work', () => {
    const words = 'lorem ipsum dolor sit amet, consectetur adipisicing elit.';
    const tokens = transform(words, {
      ',': '、',
      '.': '。',
      lorem: { replace: 'ろーれむ' },
      ipsum: { exchange: { value: 'いぷさむ' } },
      '/(dolor)/': { toggle: "{ speaker: '$1' }" },
      '/sit|amet|consectetur|adipisicing|elit/': 'ふー',
    });
    assert(tokens.length === 3);
    assert(tokens[0].type === 'text');
    assert(tokens[0].value === 'ろーれむ');
    assert(tokens[1].type === 'text');
    assert(tokens[1].value === 'いぷさむ');
    assert(tokens[2].type === 'text');
    assert(tokens[2].value === 'ふー ふー、 ふー ふー ふー。');
    assert(tokens[2].options.speaker === 'dolor');
  });

  it('use normalized define, it should work', () => {
    const words = 'lorem ipsum dolor sit amet, consectetur adipisicing elit.';
    const tokens = transform(words, [
      {
        pattern: ',',
        method: 'replace',
        replacement: '、',
      },
      {
        pattern: '.',
        method: 'replace',
        replacement: '。',
      },
      {
        pattern: 'lorem',
        method: 'replace',
        replacement: 'ろーれむ',
      },
      {
        pattern: 'ipsum',
        method: 'exchange',
        replacement: 'いぷさむ',
      },
      {
        pattern: '/(dolor)/',
        method: 'toggle',
        replacement: "{speaker:'$1'}",
      },
      {
        pattern: '/sit|amet|consectetur|adipisicing|elit/',
        method: 'replace',
        replacement: "{value:'ふー'}",
      },
    ]);
    assert(tokens.length === 3);
    assert(tokens[0].type === 'text');
    assert(tokens[0].value === 'ろーれむ');
    assert(tokens[1].type === 'text');
    assert(tokens[1].value === 'いぷさむ');
    assert(tokens[2].type === 'text');
    assert(tokens[2].value === 'ふー ふー、 ふー ふー ふー。');
    assert(tokens[2].options.speaker === 'dolor');
  });
});
