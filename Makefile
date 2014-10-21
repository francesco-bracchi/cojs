NPM			= npm
GULP               	= node_modules/.bin/gulp

all: gulp

update: 
	$(NPM) install

gulp: update
	$(GULP)

clean: update
	$(GULP) clean

distclean: update
	$(GULP) distclean

doc: update
	$(GULP) doc

publish: gulp
	$(NPM) publish build/lib

test: update
	$(GULP) test	

watch: update
	$(GULP) watch
