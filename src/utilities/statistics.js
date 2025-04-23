class Statistics {
  static instance = null;
  processing = false; // Add a processing flag

  constructor() {
    if (Statistics.instance) {
      return Statistics.instance;
    }

    // The code that needs to run for the first instance only
    this.counter_successful_request = 0;
    this.counter_status_code_4xx_or_500 = 0;
    this.counter_no_response_was_received = 0;
    this.counter_general_error = 0;

    Statistics.instance = this;

    return this;
  }

  static getInstance() {
    if (!Statistics.instance) {
      Statistics.instance = new Statistics();
    }
    return Statistics.instance;
  }

  get getCounter_successful_request() {
    return this.counter_successful_request;
  }

  set setCounter_successful_request(n = 1) {
    this.counter_successful_request++;
  }

  get getCounter_code_4xx_or_500() {
    return this.counter_status_code_4xx_or_500;
  }

  set setCounter_code_4xx_or_500(n = 1) {
    this.counter_status_code_4xx_or_500++;
  }

  get getCounter_response_was_received() {
    return this.counter_no_response_was_received;
  }

  set setCounter_response_was_received(n = 1) {
    this.counter_no_response_was_received++;
  }

  get getCounter_general_error() {
    return this.counter_general_error;
  }

  set setCounter_general_error(n = 1) {
    this.counter_general_error++;
  }
}

const statistics = Statistics.getInstance();
module.exports = statistics;