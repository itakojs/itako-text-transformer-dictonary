Itako Text Transformer Dictionary
---

<p align="right">
  <a href="https://npmjs.org/package/itako-text-transformer-dictionary">
    <img src="https://img.shields.io/npm/v/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/itakojs/itako-text-transformer-dictionary">
    <img src="http://img.shields.io/travis/itakojs/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://ci.appveyor.com/project/59naga/itako-text-transformer-dictionary">
    <img src="https://img.shields.io/appveyor/ci/59naga/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/itakojs/itako-text-transformer-dictionary/coverage">
    <img src="https://img.shields.io/codeclimate/github/itakojs/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/itakojs/itako-text-transformer-dictionary">
    <img src="https://img.shields.io/codeclimate/coverage/github/itakojs/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://gemnasium.com/itakojs/itako-text-transformer-dictionary">
    <img src="https://img.shields.io/gemnasium/itakojs/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
</p>

Installation
---
```bash
npm install itako-text-transformer-dictionary --save
```

Usage
---

## `ItakoTextTransformerDictionary` -> `transformer`

specify instance as second argument of the [Itako constructor](https://github.com/itakojs/itako#usage) as the value of the array.

```html
<script src="https://npmcdn.com/itako"></script>
<script src="https://npmcdn.com/itako-text-reader-speech-synthesis"></script>
<script src="https://npmcdn.com/itako-audio-reader-audio-context"></script>
<script src="https://npmcdn.com/itako-text-transformer-dictionary"></script>
<script>
var textReader = new ItakoTextReaderSpeechSynthesis;
var audioReader = new ItakoAudioReaderAudioContext;
var transformer = new ItakoTextTransformerDictionary;
var itako = new Itako([textReader, audioReader], [transformer], {
  read: {
    serial: true,
  },
  transformers: {
    dictionary: {
      options: [
        // replace token.value to 'hello (pitch:2) world (pitch:0.5)'
        {
          pattern: 'greeting',
          options: {
            replace: 'hello (pitch:2) world (pitch:0.5)',
          },
        },
        // change token.options to $1:$2 (remove the matched value)
        {
          pattern: '/(volume|pitch):([\\.\\d]+)/',
          options: {
            toggle: {
              $1: '$2',
            },
          },
        },
        // create new token using properties instead of `nintendo`
        {
          pattern: 'nintendo',
          options: {
            exchange: {
              type: 'audio',
              value: 'http://static.edgy.black/fixture.wav',
            },
          },
        },
        // if match, overrides all tokens using new instance
        {
          pattern: '/play\\((.+?).wav\\)/',
          options: {
            rewrite: {
              type: 'audio',
              value: 'http://static.edgy.black/$1.wav',
            },
          },
        },
        // if match, passed arguments of transform to onMatch
        {
          pattern: '/@([\\S]+)/',
          options: {
            replace: 'registered the `$1`',
            onMatch: function (token, name, matches) {
              // do staff...
              // if return false, abort the transform.
            },
          },
        },
      ],
    },
  },
});

// speech-synthesis say 'hello world, guys'. then play sound `fixture.wav`.'
itako.read('greeting, guys. (pitch:0.75) nintendo');

// play sound `fixture.wav` only.
itako.read('play(fixture.wav)');

// say "registered the `59naga`"
itako.read('@59naga');
</script>
```

Development
---
Requirement global
* NodeJS v5.10.0
* Npm v3.8.3

```bash
git clone https://github.com/itakojs/itako-text-transformer-dictionary
cd itako-text-transformer-dictionary
npm install

npm test
```

License
---
[MIT](http://59naga.mit-license.org/)
