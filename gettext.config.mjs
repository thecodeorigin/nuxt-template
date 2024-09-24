export default {
  input: {
    path: './', // only files in this directory are considered for extraction
    include: ['**/*.js', '**/*.ts', '**/*.vue'], // glob patterns to select files for extraction
    exclude: [], // glob patterns to exclude files from extraction
    jsExtractorOpts: [ // custom extractor keyword. default empty.
      {
        keyword: '__', // only extractor default keyword such as $gettext,use keyword to custom
        options: { // see https://github.com/lukasgeiter/gettext-extractor
          content: {
            replaceNewLines: '\n',
          },
          arguments: {
            text: 0,
          },
        },
      },
      {
        keyword: '_n', // $ngettext
        options: {
          content: {
            replaceNewLines: '\n',
          },
          arguments: {
            text: 0,
            textPlural: 1,
          },
        },
      },
    ],
    compileTemplate: false, // do not compile <template> tag when its lang is not html
  },
  output: {
    path: './assets/locale',
    locales: ['en'],
    flat: true,
    linguas: true,
    splitJson: true,
  },
}
