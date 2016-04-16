Itako Text Transformer Dictionary
---

<p align="right">
  <a href="https://npmjs.org/package/itako-text-transformer-dictionary">
    <img src="https://img.shields.io/npm/v/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/itakojs/itako-text-transformer-dictionary">
    <img src="http://img.shields.io/travis/itakojs/itako-text-transformer-dictionary.svg?style=flat-square">
  </a>
  <a href="https://ci.appveyor.com/project/itakojs/itako-text-transformer-dictionary">
    <img src="https://img.shields.io/appveyor/ci/itakojs/itako-text-transformer-dictionary.svg?style=flat-square">
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
var dictionaryTransformer = new ItakoTextTransformerDictionary;
var itako = new Itako([textReader, audioReader], [dictionaryTransformer], {
  read: {
    serial: true,
  },
  transformers: {
    dictionary: {
      options: {
        greeting: 'hello world',
        nintendo: {
          type: 'audio',
          value: 'http://static.edgy.black/fixture.wav',
        },
      },
    },
  },
});

// read "hello world, guys", then play sound `pickup coin`
itako.read('greeting, guys. nintendo');
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
