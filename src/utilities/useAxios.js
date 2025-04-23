const axios = require("axios");
let counter = 0;
const useAxios = (url = {}, options = {}) => {
  counter++;
  // console.log("Request number:", counter);
  // console.log("TIME:", new Date().toLocaleString("en-US", { timeZone: "UTC" }));
  return axios(url, options)
    .then(({ data }) => {
      return data;
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code that falls out of the range of 200
        // Something like 4xx or 500
        console.log(
          "The request was made and the server responded with a status code of 4xx or 500.", error.response.statusText, error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
        console.log("The request was made but no response was received.", error.request.message, error.request.status);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log(
          "Something happened in setting up the request that triggered an Error", error.message, error.status
        );
      }
      return undefined;
    });
};
 
module.exports = useAxios;