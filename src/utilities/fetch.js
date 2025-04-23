// const axios = require("./useAxios");
const sendRequest = require("./sendRequest");
 
 
const fetch = (uri, method = "GET", data = {}) => {
  return sendRequest.addRequestToQueue({ uri, method, data });
};
// const fetch = (uri, method = "GET", data = {}) => {
// const url = process.env.LMS_API_URL + uri;
// const options = {
//   method,
//   timeout: 3000, // 3 seconds timeout
//   headers: { apikey: process.env.LITMOSE_API_KEY },
//   data,
// };
// const res =   axios(url, options)
// console.log("🟢 FULL RESPONSE:", JSON.stringify(res, null, 2));
// return axios(url, options);
 
// };
 
// .then(({ data }) => {
//   return data;
// })
// .catch((error) => {
//   if (error.response) {
//     // The request was made and the server responded with a status code that falls out of the range of 200
//     // Something like 4xx or 500
//     console.log(
//       "The request was made and the server responded with a status code of 4xx or 500."
//     );
//   } else if (error.request) {
//     // The request was made but no response was received
//     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
//     console.log("The request was made but no response was received.");
//   } else {
//     // Something happened in setting up the request that triggered an Error
//     console.log(
//       "Something happened in setting up the request that triggered an Error"
//     );
//   }
//   return undefined;
// });
// };
 
module.exports = fetch;