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
             callback(response.Item.dependents,response.Item.personalinfo);
        }
    });
}

let saveDiagnosis = function(diagnosisItem,callback){

    console.log("Inside DAO : ",diagnosisItem );
    
    diagnosisItem.lastupdate= new Date().toString()
    var params = {
        Item:diagnosisItem,
        TableName:'Diagnosis'
    };
    docClient.put(params, function (err, data) {

        console.log("Inside PUT Err  : ", err );
        console.log("Inside PUT data : ", data );

        if (err) {
            console.log("Diagnosis::Save::Error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("Saved Successfully");
             callback("Diagnosis Details Saved in Database");
        }
    });

}

module.exports.getDependents = getDependents;
module.exports.saveDiagnosis = saveDiagnosis;