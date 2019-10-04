# Imagine Learning: web-code-formatting
This package contains Imagine Learning standardized formatting configuration files for prettier and js-beautify.

## prettier
https://github.com/prettier/prettier

- Prettier allows for sharing configuration files using an entry in your application's package.json file (source: https://prettier.io/docs/en/configuration.html)
- If prettier is the only formatter being used in your application you can use this package directly in your package.json as demonstrated below as the `prettier-config.json` is the main export. 
```
{
  "name": "my-il-application",
  "version": "0.0.1",
  "prettier": "@imaginelearning/web-code-formatting"
}
```

- You may also use it in a script by specifying the file path explicitly:
```
"scripts": {
    "format:prettier": "prettier --config node_modules/@imaginelearning/web-code-formatting/prettier-config.json --ignore-path \"node_modules/**\" --write \"**/*.{ts,js,json,scss,css}\""
}
```





## js-beautify
https://github.com/beautify-web/js-beautify

- js-beautify does not use a package.json entry when checking for configurations so explicit path must be used.
```
"scripts": {
    "format:beautify": "find ./src -name '*.html' -print0 | xargs -0 node_modules/.bin/html-beautify -r --config node_modules/@imaginelearning/web-code-formatting/jsbeautify-config.json"
}
```

