var http = require('http');
var https= require('https');

function getLoggedInUser(token, callback) {

    let awsURL = 'https://api.amazon.com/user/profile?access_token='+token;

    var req = https.request(awsURL, res => {
        res.setEncoding('utf8');
        var returnData = "";
  
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
          var result = JSON.parse(returnData);
          callback(result);
  
        });
    });
    req.end();
  }

  getLoggedInUser('Atza|IwEBIDLo3ugrXWV03G04ijTj9yBhW6ZlQ4xau8U2Kd5i3h1viXXVrxGigbtROdaxsM8SnHiV4XVC3ThgvgfL-8PR6HVpdser9m78wgebSAULe6oz-C2efk10FBwEmn3T4B1jdkYNSGclhJ5yluCQYwhfXekpx_SABg5ZfdK1RnIdKPYJ5b7kltPh50Sz4KhS9xR7nq8tH6MZcg4y6Xu3pXftZV93ZFYt6AU3Axep7WQgHK189I7alwuPKRZhIW_itVPiPhfjjmQ-mi6nlWCMqK1ObYruF8kcgk0yoLEoN0xtYc2bBQpvjm8RT_dDZTXSZVY-43F02hSfLh9JyTZi0ZMugxLsnP1Tv2wRVR7QZ0MK8c9NuEaJtMb39YboypHst4khqwctLF-3AjB1afSI9HxCmovJpwJVYEtxxqPjzBwsFpETwLwksg0BSRknCArHByXtU-mEtNViUbnzIjwAH0w00sMuXIOCNnGWwRQ2bLggZICyJST5-jrFfn-4t_ryHStrd7G3cgfA9RX2V_xU8d6DxK20Puzm4lkzzdk1Y3hhwhmZsA3goPDG1jwKfIamvBAydx0',function(data){
    console.log("Data from REST call : ",data)
  });

module.exports.getLoggedInUser=getLoggedInUser;
