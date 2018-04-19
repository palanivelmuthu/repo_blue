var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});

let getDependents = function (emailid,callback) {

    var getparams = {
        TableName: "Member",
        Key: {
            emailid:emailid
        }
    };
    docClient.get(getparams, function (err, response) {

        if (err) {
            console.log("Members::get::error - " + JSON.stringify(err, null, 2));
        } else {
             callback(response.Item.dependents);
        }
    });
}

module.exports.getDependents = getDependents;