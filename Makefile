NPM			= npm
GULP               	= node_modules/.bin/gulp
DOCCO			= node_modules/.bin/docco-husky

all: gulp docs

update: 
	$(NPM) install

gulp: update
	$(GULP)

expand: update
	$(GULP) expand

clean: update
	$(GULP) clean

distclean: update
	$(GULP) distclean

docs: update
	$(DOCCO) src

publish: update
	$(GULP) lib
	$(NPM) publish build/lib

test: update
	$(GULP) test	

watch: update
	$(GULP) watch
