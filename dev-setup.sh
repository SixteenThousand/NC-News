#!/bin/sh

touch .env.test
touch .env.development
# the contents of these files should be sh scripts which set the PGDATABASE
# environment variable to the name of your local test & development
# databases, respectively. Uncomment the next section if you wish to set
# these up automatically:
# TEST_DB='nc_news_testing'
# DEV_DB='nc_news_development'
# echo "PGDATABASE=$TEST_DB" >> .env.test
# echo "PGDATABASE=$DEV_DB" >> .env.development
# psql -c "CREATE DATABASE $TEST_DB; CREATE DATABASE $DEV_DB;"

# logging can be enabled by setting the ENABLE_LOGGING variable.
# Uncomment the line below if you would like logging to be on in development.
# Note the value of ENABLE_LOGGING doesn't matter; it just has to be set.
# echo "ENABLE_LOGGING=true"

npm install
npm run setup-dbs
npm run seed
