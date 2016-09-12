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

[DEMO](https://jsfiddle.net/kn0r4s8f/12/)

## `ItakoTextTransformerDictionary` -> `transformer`

specify instance as second argument of the [Itako constructor](https://github.com/itakojs/itako#usage) as the value of the array.

```html
<script src="https://unpkg.com/itako"></script>
<script src="https://unpkg.com/itako-text-reader-speech-synthesis"></script>
<script src="https://unpkg.com/itako-audio-reader-audio-context"></script>
<script src="https://unpkg.com/itako-text-transformer-dictionary"></script>
<script>
var textReader = new ItakoTextReaderSpeechSynthesis;
var audioReader = new ItakoAudioReaderAudioContext;
var transformer = new ItakoTextTransformerDictionary({
  onMatch: function (define, originalToken, transformedToken, matches) {
    // do staff...
    // if return false, abort the transform.
  },
});
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
          method: 'replace',
          replacement: 'hello (pitch:2) world (pitch:0.5)',
        },
        // change token.options to $1:$2 (remove the matched value)
        {
          pattern: '/(volume|pitch):([\\.\\d]+)/',
          method: 'toggle',
          replacement: "{$1:'$2'}",
        },
        // create new token using properties instead of `nintendo`
        {
          pattern: 'nintendo',
          method: 'exchange',
          replacement: "{type:'audio',value:'http://static.edgy.black/fixture.wav'}",
        },
        // if match, overrides all tokens using new instance
        {
          pattern: '/play\\((.+?).wav\\)/',
          method: 'rewrite',
          replacement: "{type:'audio',value:'http://static.edgy.black/$1.wav'}",
        },
        // if match, passed arguments of transform to onMatch
        {
          pattern: '/@([\\S]+)/',
          method: 'replace',
          replacement: 'registered the `$1`',
        },
      ],
    },
  },
});

// speech-synthesis say 'hello world, guys'. then play sound `fixture.wav`.
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
