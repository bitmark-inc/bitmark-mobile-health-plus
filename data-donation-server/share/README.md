# Database schema files

* install-schema  - program to process schema.sql and load into PostgreSQL
* schema.sql      - to create the initial database for the updaterd program

Note: change the password in the configuarion file **before** running
the installation script as the install script will extract this password.

To load the database into PostgreSQL use the install script:

~~~
# to create
./install-schema --create

# to drop and recreate
./install-schema --drop

# just drop the schema without dropping the entire database
./install-schema
~~~
