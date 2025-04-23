const debug = require("debug")("SendRequestClass");
const m_axios = require("./m_axios");
 
class SendRequest {
  static instance = null;
  processing = false; // Add a processing flag
 
  constructor() {
    if (SendRequest.instance) {
      return SendRequest.instance;
    }
 
    // The code that needs to run for the first instance only
    this.requestsQueue = [];
    this.requestTimestamps = [];
    this.lastRequestTime = Date.now(); // Keep track of the last request time
 
    this.maxRequests = parseInt(process.env.MAX_REQUEST_SENT || "100");
    this.timeBetweenRequests = parseInt(
      process.env.TIME_BETWEEN_REQUESTS || "300"
    );
   // 60000 one minute
   //600 10 seconds
   //0/6
    this.coolDownTime = parseInt(process.env.COOL_DOWN_TIME || "1000");
 
    SendRequest.instance = this;
 
    return this;
  }
 
  // A static function that returns the single instance
  static getInstance() {
    if (!SendRequest.instance) {
      SendRequest.instance = new SendRequest();
    }
    return SendRequest.instance;
  }
  canSendRequest() {
    const now = Date.now();
    const lastMinute = this.requestTimestamps.filter(t => now - t < 60000);
    this.requestTimestamps = lastMinute;
    if (lastMinute.length < this.maxRequests) {
      this.requestTimestamps.push(now);
      return true;
    }
    return false;
  }
 
  // An example of another function in the class
  addRequestToQueue(request) {
    return new Promise((resolve, reject) => {
      debug("Receive a new request to add to requestQueue");
      // Save the request and the resolve and reject function in a queue
      this.requestsQueue.push({ request, resolve, reject });
 
      debug("Number of requests in queue:", this.requestsQueue.length);
      this.processQueue();
    });
  }
 
  sleep(time) {
    debug("Will sleep for " + time + " miliseconds");
    return new Promise((resolve) => {
      setTimeout(resolve, Math.ceil(time));
    });
  }
 
  async processQueue() {
    if (this.processing) {
      return; // Prevent multiple concurrent executation
    }
    this.processing = true;
 
    while (this.requestsQueue.length > 0) {
      try {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const timeToWait = this.timeBetweenRequests - timeSinceLastRequest;
 
        if (this.canSendRequest()) {
          if (timeToWait > 0) {
            debug(
              `Need to wait ${timeToWait} milliscond before processing another request`
            );
            // Delay the sending of the request by the specified time
            await this.sleep(timeToWait);
          }
 
          // Process next request in queue
          debug("Remove the first request in requestQueue");
          const nextRequest = this.requestsQueue.shift();
          if (nextRequest) {
            debug("Process a new request from the queue");
            await this.sendRequest(nextRequest);
          }
        } else {
          // Cooldown since max requests have been sent
          console.log(
            `Reached limit of ${this.maxRequests} requests. Cooling down for ${this.coolDownTime}ms.`
          );
          await this.sleep(this.coolDownTime);
          // this.resetRequests();
        }
      } catch (error) {
        console.error(error);
      }
    }
 
    // Once the queue is fully processed, release the lock
    debug("Queue is empty or fully processed.");
    this.processing = false;
  }
 
  async sendRequest({ request, resolve, reject }) {
    try {
      this.requestsSent++;
      this.lastRequestTime = Date.now(); // Record the time the request was sent
 
      const DATA = await m_axios(request);
      // console.log("DATA:", DATA);
      resolve(DATA);
    } catch (error) {
      console.error(error);
    }
  }
 
  resetRequests() {
    debug("Rest request counter");
    this.requestsSent = 0;
  }
}
 
const sendRequest = SendRequest.getInstance();
module.exports = sendRequest;