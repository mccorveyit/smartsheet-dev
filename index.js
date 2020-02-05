const aws = require('aws-sdk');
require('dotenv').config();
aws.config.update({
    region: "us-east-1"
});
const ss = require('./config/ss');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });


const index = async () => {

    // const productionLogSheet = await ss.sheets.getSheet({ id: 8894448227641220});
    // const typeColumn = productionLogSheet.columns.find(column => column.title === "Type");
    // const types = productionLogSheet.rows.map(row => row.cells.find(cell => cell.columnId === typeColumn.id).value);
    const types = ['MECH','PLMB','HNGR', 'CUST', 'SLV'];

    const sheets = (await Promise.all(
        (await s3.listObjectsV2({ Bucket: process.env.BUCKET_SHEETS, Prefix: 'Production_Log' }).promise()).Contents
            .filter(object => object.Key.includes('Production_Log'))
            .map(({ Key }) => s3.getObject({ Bucket: process.env.BUCKET_SHEETS, Key }).promise().then(row => JSON.parse(row.Body.toString())))
    ))
    for (const sheet of sheets) {
        const columnType = sheet.columns.find(column => column.title === "Type").options;
        if (JSON.stringify(columnType) !== JSON.stringify(types)) {
            await ss.sheets.updateColumn({
                sheetId: sheet.id,
                columnId: sheet.columns.find(column => column.title === "Type").id,
                body: {
                    "type": "PICKLIST",
                    "options": types
                }
            })
        }
    }
}

module.exports = index;

index();