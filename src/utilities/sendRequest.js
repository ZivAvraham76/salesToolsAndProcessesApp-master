const debug = require("debug")("SendRequestClass");
const m_axios = require("./m_axios");

class SendRequest {
  static instance = null;
  processing = false;
  counter = 0; // Counter for the number of requests sent

  constructor() {
    if (SendRequest.instance) {
      return SendRequest.instance;
    }

    this.requestsQueue = [];
    this.requestTimestamps = [];

    this.maxRequests = parseInt(process.env.MAX_REQUEST_SENT || "99");

    SendRequest.instance = this;
    return this;
  }

  static getInstance() {
    if (!SendRequest.instance) {
      SendRequest.instance = new SendRequest();
    }
    return SendRequest.instance;
  }

  addRequestToQueue(request) {
    return new Promise((resolve, reject) => {
      // console.log("Receive a new request to add to requestQueue");
      this.requestsQueue.push({ request, resolve, reject });
      // console.log("Number of requests in queue:", this.requestsQueue.length);
      this.processQueue();
    });
  }

  sleep(time) {
    console.log("Will sleep for " + time + " milliseconds");
    return new Promise((resolve) => setTimeout(resolve, Math.ceil(time)));
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.requestsQueue.length > 0) {
      try {

        const now = Date.now();

        // Clean timestamps older than 1 minute
        this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 60000);

        if (this.requestTimestamps.length >= this.maxRequests) {
          const timeSinceFirst = now - this.requestTimestamps[0];
          const waitTime = 60000 - timeSinceFirst;
          if (waitTime > 0) {
            console.log(`Reached ${this.maxRequests} requests. Waiting ${waitTime}ms.`);
            await this.sleep(waitTime);
          }
          // After sleeping, clean the timestamps again
          this.requestTimestamps = this.requestTimestamps.filter(t => Date.now() - t < 60000);
        }

        const nextRequest = this.requestsQueue.shift();
        this.counter++;
        console.log("Sending request number:", this.counter, Date(), nextRequest.request.uri);
        // console.log("len timestemp:", this.requestTimestamps.length);

        if (nextRequest) {
          await this.sendRequest(nextRequest);
        }
      } catch (error) {
        console.error(error);
      }
    }

    debug("Queue is empty or fully processed.");
    this.processing = false;
  }

  async sendRequest({ request, resolve, reject }) {
    try {
      const now = Date.now();
      this.requestTimestamps.push(now);

      const DATA = await m_axios(request);
      resolve(DATA);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  }
}

const sendRequest = SendRequest.getInstance();
module.exports = sendRequest;
