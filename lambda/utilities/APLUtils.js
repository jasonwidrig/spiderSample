const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});


      
function getAPLURL(fileName) {
    
    // change this function when we host things in a different spot
    
    fileName = "Media/" + fileName;

    const bucketName = 'spidertemplepersistence'; 
   
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: fileName,
        Expires: 60*1 // the Expires is capped for 1 minute
    });
    
    return s3PreSignedUrl;

}

exports.getAPLURL = getAPLURL;