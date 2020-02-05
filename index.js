const aws = require('aws-sdk');
require('dotenv').config();
aws.config.update({
    region: "us-east-1"
});
const ss = require('./config/ss');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });


const index = async () => {

    const employeesSheet = await ss.sheets.getSheet({ id: 7831794801239940 });
    const employeeColumn = employeesSheet.columns.find(column => column.title === "Name");
    const employees = employeesSheet.rows.map(row => row.cells.find(cell => cell.columnId === employeeColumn.id).value);


    const projectsSheet = await ss.sheets.getSheet({ id: 4101959302047620 });
    const projectColumn = projectsSheet.columns.find(column => column.title === "Project Name");
    const projects = projectsSheet.rows.map(row => row.cells.find(cell => cell.columnId === projectColumn.id).value);


    const sheets = (await Promise.all(
        (await s3.listObjectsV2({ Bucket: process.env.BUCKET_SHEETS, Prefix: 'Timesheet' }).promise()).Contents
            .filter(object => object.Key.includes('Timesheet'))
            .map(({ Key }) => s3.getObject({ Bucket: process.env.BUCKET_SHEETS, Key }).promise().then(row => JSON.parse(row.Body.toString())))
    ))
    for (const sheet of sheets) {
        // const sheet = await ss.sheets.getSheet({id: 8605558929418116});
        debugger;
        const columnEmployees = sheet.columns.find(column => column.title === "Employee").options;
        if (JSON.stringify(columnEmployees) !== JSON.stringify(employees)) {
            await ss.sheets.updateColumn({
                sheetId: sheet.id,
                columnId: sheet.columns.find(column => column.title === "Employee").id,
                body: {
                    // "index": 0,
                    // "title": "First Column",
                    "type": "PICKLIST",
                    "options": employees
                }
            })
        }

        const columnProjects = sheet.columns.find(column => column.title === "Project").options;
        if (JSON.stringify(columnProjects) !== JSON.stringify(projects)) {
            await ss.sheets.updateColumn({
                sheetId: sheet.id,
                columnId: sheet.columns.find(column => column.title === "Project").id,
                body: {
                    // "index": 0,
                    // "title": "First Column",
                    "type": "PICKLIST",
                    "options": projects
                }
            })
        }
    }
}

module.exports = index;

index();