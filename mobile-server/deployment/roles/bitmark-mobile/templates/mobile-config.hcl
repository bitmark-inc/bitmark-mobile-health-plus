network = "testnet"

listen {
    mobileAPI = 9005
    internalAPI = 9006
}

external {
    coreAPIServer = "{{ mobile.core_api_server }}"
    messageQueue = "{{ mobile.message_server }}"
    messageChannel = "mobile-server"
    iftttServer = "{{ mobile.ifttt_server }}"
    pushServer = "{{ mobile.push_server }}"
}

db {
    host = "{{ mobile.db_host }}"
    port = {{ mobile.db_port }}
    username = "bitmark"
    password = "{{ secure_config.mobile.db_password }}"
    dbname = "mobile"
    SSLMode = "disable"
}

data-donation {
    researchers = {
        {{ data_donation.researcher_account_1 }} = "Madelena"
        {{ data_donation.researcher_account_2 }} = "Victor"
    }
}