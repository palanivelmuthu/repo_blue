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

  getLoggedInUser('Atza|IwEBIEIwD-7amohYznAyTi1nsy5VHu08fAYvfhgNcyngAlYPt6tESZkffQh2Wj74qQao6oNWqTLp2hcjgyTnh_GG3CaRfyDm038y5djZI_susr6MQN4BsX5N_BMthC4LEYkALp8LdhuwNzg3Bzbcj04czAQauYxKy4cng5uQHzM-DCks1DEljlAJsjy--IpmU_lmUqQY0WSz387T3fZlj3ld89Waevk7FUZURlL973k25NXrsVl0GO03STsDzvkRpBandLFUZVCgmxmXEmpfHnaH71r_3oAKhk0pqAOADds3en2iEptJUgWYMO3A0D6Kn0g8bLQWGjZjPlvfnqzXdSU8WlFA7nHY9rbuORHYZCeQX7vxqn_Ov5iBFjJkhVsgLmtk-pcqVfLMf2MhoFsoqicg7k8XpTBKMKvvs9fGaV75tNx3qmJlEcA90aTxAXZP-WiHJ_W2LccTmxc-i_ILuS2KYB94F53Ub8QgxZ8R2UF1-xfvll5UVtQyaSZpS8_bEuQHGB47iqJdTUnof8HXvRAEL-Dk',function(data){
    console.log("Data from REST call : ",data)
  });

module.exports.getLoggedInUser=getLoggedInUser;
