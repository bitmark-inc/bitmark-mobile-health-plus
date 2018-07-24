-- data donation schema -*- mode: sql; sql-product: postgres; -*-
--
-- data storage for bitmark data donation

-- the installation script will ignore this line
-- \echo "--- use the: 'install-schema' script rather than loading this file directly ---" \q

-- initial setup
-- \connect postgres

-- note: the install-schema will use the password from etc configuration file
--       in place of the tag below when loaing this file into the database
CREATE USER bitmark_data_donation ENCRYPTED PASSWORD '@CHANGE-TO-SECURE-PASSWORD@';

CREATE DATABASE mobile;

\connect mobile;
CREATE SCHEMA IF NOT EXISTS data_donation;

CREATE TABLE IF NOT EXISTS data_donation.user (
  bitmark_account TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
  timezone TEXT, 
  last_action TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active_bhd_at TIMESTAMP WITH TIME ZONE, 

  PRIMARY KEY(bitmark_account)
);

CREATE TABLE IF NOT EXISTS data_donation.completed_tasks (
  bitmark_account TEXT NOT NULL references data_donation.user(bitmark_account),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- change column name from last_time to completed_at
  task_type TEXT NOT NULL,
  study_id TEXT DEFAULT '',
  completed_status TEXT DEFAULT 'new', 
  bitmark_id TEXT DEFAULT NULL, 
  PRIMARY KEY(bitmark_account, completed_at, task_type, study_id)
);

CREATE TABLE IF NOT EXISTS data_donation.user_joined_study (
  bitmark_account TEXT NOT NULL references data_donation.user(bitmark_account),
  study_id TEXT NOT NULL,
  joined_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY(bitmark_account, study_id)  
);

GRANT CONNECT ON DATABASE mobile TO bitmark_data_donation;
GRANT USAGE ON SCHEMA data_donation TO bitmark_data_donation;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA data_donation TO bitmark_data_donation;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA data_donation TO bitmark_data_donation;