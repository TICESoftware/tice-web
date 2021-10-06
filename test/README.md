# Development to run tests

To run the tests, the (for now private) submodules `Server` and `CnC` are needed.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests

To run selenium tests locally run:
```
yarn run test:local
```
`local` needs firefox and a geckodriver to be installed (e.g. `brew cask install firefox` and `brew install geckodriver`)

To run tests on BrowserStack, configure the env variables `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` and run
```
yarn run test:remote
```
