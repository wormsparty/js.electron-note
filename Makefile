all:
	npm run watch &
	npm run start
	pkill node
