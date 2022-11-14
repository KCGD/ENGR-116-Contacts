OPT="SIMPLE"
JS_OUT="out.js"
JS_IN="main.js"
BUILD_DIR=$(shell pwd)/Builds

default:
	npx tsc

build:
	npx tsc
	npx pkg package.json

install:
	ln -s -v -f "$(BUILD_DIR)/mcc" /usr/local/bin/mcc

clean:
	@find ./src -name "*.js" -type f
	@find ./src -name "*.js" -type f -delete
	@rm main.js