-- schema.sql -*- mode: sql; sql-product: postgres; -*-
--
-- data storage for bitmark blockchain data

-- the installation script will ignore this line
\echo "--- use the: 'install-schema' script rather than loading this file directly ---" \q

-- initial setup
\connect postgres

-- note: the install-schema will use the password from etc/mobile.conf
--       in place of the tag below when loading this file into the database
CREATE USER bitmark ENCRYPTED PASSWORD '@CHANGE-TO-SECURE-PASSWORD@';
ALTER ROLE bitmark ENCRYPTED PASSWORD '@CHANGE-TO-SECURE-PASSWORD@';

-- drop/create database is controlled by install-schema options
--@DROP@DROP DATABASE IF EXISTS @CHANGE-TO-DBNAME@;
--@CREATE@CREATE DATABASE @CHANGE-TO-DBNAME@;

-- connect to the database
\connect @CHANGE-TO-DBNAME@

-- drop schema and all its objects, create the schema and use it by default
DROP SCHEMA IF EXISTS mobile CASCADE;
CREATE SCHEMA IF NOT EXISTS mobile;

SET search_path = mobile;                              -- everything in this schema for schema loading
ALTER ROLE bitmark SET search_path TO mobile, PUBLIC;    -- ensure user sees the schema first

--- grant to mobile ---
GRANT USAGE ON SCHEMA mobile TO bitmark;
ALTER DEFAULT PRIVILEGES IN SCHEMA mobile GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bitmark;
ALTER DEFAULT PRIVILEGES IN SCHEMA mobile GRANT SELECT, UPDATE ON SEQUENCES TO bitmark;

CREATE TABLE mobile.account (
    account_number TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- device_platform enumeration
CREATE TYPE device_platform AS ENUM ('ios', 'android');

CREATE TYPE push_client AS ENUM('primary', 'beta');

-- TABLE push_uuid
CREATE TABLE mobile.push_uuid (
    account_number TEXT REFERENCES mobile.account(account_number),
    token TEXT NOT NULL,
    platform device_platform NOT NULL,
    client push_client DEFAULT 'primary',
	  PRIMARY KEY(token, platform)
);

-- push notification item status
CREATE TYPE push_item_status AS ENUM ('fresh', 'read', 'completed');

-- TABLE push_item
CREATE TABLE mobile.push_item (
    id SERIAL PRIMARY KEY,
    account_number TEXT REFERENCES mobile.account(account_number),
    source TEXT NOT NULL,
    title TEXT DEFAULT NULL,
    message TEXT DEFAULT NULL,
    data JSONB DEFAULT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    status push_item_status DEFAULT 'fresh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE bitmark_tracking
CREATE TABLE mobile.bitmark_tracking (
    bitmark_id TEXT,
    account TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      PRIMARY KEY(bitmark_id, account)
);

-- finished
SET search_path TO DEFAULT;
