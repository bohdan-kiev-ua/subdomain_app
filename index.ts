const express = require('express')
import {S3Client, PutObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3'
const bodyParser = require("body-parser");
import { v1 as uuidv1 } from 'uuid';
const subdomain = require('express-subdomain');

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


const port = 3000

const bucketName = 'bla-bla-bla12'

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        //TODO: get from security credentials in AWS S3 buket account
        accessKeyId: '',
        secretAccessKey: '',
    },
});


// const route53Client = new Route53Client(config);

const addDomainRoute53 = (domainName: string) => {
    console.log("added subdomain", domainName)
    // const input = {
//     HostedZoneId: "Z2ABCD1234EFGH",
//     ChangeBatch: {
//         Comment: "test comment",
//         Changes: [
//             {
//                 Action: "CREATE"
//                 ResourceRecordSet: {
//                     Name: "${domainName}.davemakesshirts.com",
//                     Type: "A",
//                     TTL: 600,
//                     ResourceRecords: [
//                         {
//                             Value: "host ip e.g: 192.168.0.1",
//                         },
//                     ],
//                 },
//             },
//         ],
//     },
// };
// const command = new ChangeResourceRecordSetsCommand(input);
// return await route53Client.send(command);
}


function getObject (Bucket: any, Key: any) {
    const streamToString = (stream: any) =>
        new Promise((resolve, reject) => {
            const chunks: any = [];
            stream.on("data", (chunk: any) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });

    const getObjectCommand = new GetObjectCommand({ Bucket, Key })
    return s3Client.send(getObjectCommand).then((data) => {
      return streamToString(data.Body)
    })
}


app.post('/', (req: any, res: any) => {
    // create buket folder
    try {
        const name = `name-${uuidv1()}`

        const command = new PutObjectCommand({ Bucket: bucketName, Key: `${name}/` });
        s3Client.send(command).then((buketData) => {
            // TODO: ADD request for AWS route-53 examples:
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/route-53/command/CreateHostedZoneCommand/
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/route-53/command/ChangeResourceRecordSetsCommand/

            // example:
            addDomainRoute53(name)
            res.json({
                buketData,
                userName: name
            })
        })
    } catch (e) {
        res.send(e)
    }
})



app.post('/upload-file', (req: any, res: any) => {
    console.dir(req.subdomains)
    const buf = Buffer.from(req.body.fileBase64.replace(/^data:image\/\w+;base64,/, ""),'base64')
    const data = {
        Key: `${req.body.userName}/${req.body.fileName}`,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'application/octet-stream'
    };
    try {
        const command = new PutObjectCommand({ Bucket: bucketName, ...data });
        s3Client.send(command).then((buketData) => {
            res.json({
                buketData,
                userName: req.body.userName
            })
        })
    } catch (e) {
        res.send(e)
    }
})
const router = express.Router()

router.get('/*', async (req: any, res: any) => {
    console.log(req.subdomains[0])
    await getObject(bucketName, `${req.subdomains[0]}/${Object.values(req.params).join('/')}`).then((data) => {
        res.send(data)
    })
})


app.use(subdomain('*', router));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})





