const axios = require("./useAxios");
const debug = require("debug")("m_axios");
const statistics = require("./statistics");
 
const m_axios = async ({uri, method = "GET", data = {}}) => {
  const url = process.env.LMS_API_URL + uri;
  const options = {
    method,
    timeout: 3000, // 3 seconds timeout
    headers: { apikey: process.env.LITMOSE_API_KEY },
    data,
  };
const res =  await axios(url, options)
return res
//     .then(({ data }) => {
//       statistics.setCounter_successful_request = 1;
//       return data;
//     })
//     .catch((error) => {
//         console.log("DATA:", data);
//       if (error.response) {
//         statistics.setCounter_code_4xx_or_500 = 1;
//         // The request was made and the server responded with a status code that falls out of the range of 200
//         // Something like 4xx or 500
//         console.log(
//           "The request was made and the server responded with a status code of 4xx or 500."
//         );
//       } else if (error.request) {
//         statistics.setCounter_response_was_received = 1;
//         // The request was made but no response was received
//         // `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
//         console.log("The request was made but no response was received.");
//       } else {
//         statistics.setCounter_general_error = 1;
//         // Something happened in setting up the request that triggered an Error
//         console.log(
//           "Something happened in setting up the request that triggered an Error"
//         );
//       }
//       return undefined;
//     });
};
 
module.exports = m_axios;
 