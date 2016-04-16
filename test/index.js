// dependencies
import test from 'ava';
import Itako from 'itako';

// target
import ItakoTextTransformerDictionary from '../src';

// fixture
const transformer = new ItakoTextTransformerDictionary;
const transform = (words, options) => {
  const path = 'transformers.dictionary.options';
  const itako = new Itako([], [transformer]).setOption(path, options);
  return itako.transform(words);
};

// specs
test('it should be replaced by case-insensitive', (t) => {
  t.true(transform('🍣', { '🍣': '🍕' })[0].value === '🍕');
  t.true(transform('foo', { foo: 'bar' })[0].value === 'bar');
  t.true(transform('foobar', { foo: 'bar' })[0].value === 'barbar');
  t.true(transform('foofoo', { foo: 'bar' })[0].value === 'barbar');
  t.true(transform('FooFoo', { foo: 'bar' })[0].value === 'barbar');
  t.true(transform('日本語', { 日本語: 'jp' })[0].value === 'jp');

  t.true(transform('foo', { foo: { replace: 'bar' } })[0].value === 'bar');
});

test('if type is text, it will continue to apply the definition', (t) => {
  t.true(transform('abc', { a: 'b', b: 'c' })[0].value === 'ccc');
});

test('if define the property name of the itako-token, should create a new token', (t) => {
  const tokens = transform('abc', { a: { type: 'audio' }, b: { type: 'extra' } });
  t.true(tokens.length === 3);
  t.true(tokens[0].type === 'audio');
  t.true(tokens[0].value === 'a');
  t.true(tokens[1].type === 'extra');
  t.true(tokens[1].value === 'b');
  t.true(tokens[2].type === 'text');
  t.true(tokens[2].value === 'c');
});

test('if the definition name begins with a slash, it should replace using regular expression', (t) => {
  t.true(transform('foofoo', { '/^foo/': 'bar' })[0].value === 'barfoo');
  t.true(transform('foofoo', { '/foo$/': 'bar' })[0].value === 'foobar');
  t.true(transform('foofoo', { '/^foo$/': 'bar' })[0].value === 'foofoo');
});

test('if rewrite is true and match the key, it should be replaced with a new token', (t) => {
  const tokens = transform('abc', {
    a: { type: 'audio', value: '02 Hyperballad.m4a', rewrite: true },
    b: { type: 'extra' },
  });
  t.true(tokens.length === 1);
  t.true(tokens[0].type === 'audio');
  t.true(tokens[0].value === '02 Hyperballad.m4a');
});

test('in many options, it should work', (t) => {
  const words = 'lorem ipsum dolor sit amet, consectetur adipisicing elit.';
  const tokens = transform(words, {
    ',': '、',
    '.': '。',
    lorem: 'ろーれむ',
    ipsum: { value: 'いぷさむ' },
    dolor: { type: 'どるぁー' },
    '/sit|amet|consectetur|adipisicing|elit/': 'ふー',
  });
  t.true(tokens.length === 4);
  t.true(tokens[0].type === 'text');
  t.true(tokens[0].value === 'ろーれむ');
  t.true(tokens[1].type === 'text');
  t.true(tokens[1].value === 'いぷさむ');
  t.true(tokens[2].type === 'どるぁー');
  t.true(tokens[2].value === 'dolor');
  t.true(tokens[3].type === 'text');
  t.true(tokens[3].value === 'ふー ふー、 ふー ふー ふー。');
});
