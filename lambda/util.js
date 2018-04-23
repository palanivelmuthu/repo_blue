var feversymptoms={
    "days":"",
    "bodypain":"",
    "travel":"",
    "surgery":""
};

var headAcheSymptoms ={
    "headacheduration":"",
    "frequency":"",
    "visionblidspotoccurance":"",
    "headlocation":""
};

var populateFeverSymptoms = function(days,bodypain,travel,surgery){
    feversymptoms.days=days;
    feversymptoms.bodypain=bodypain;
    feversymptoms.travel=travel;
    feversymptoms.surgery=surgery;
    return feversymptoms;
}

module.exports.populateFeverSymptoms=populateFeverSymptoms;