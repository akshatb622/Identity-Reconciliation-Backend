import { pool } from '../db/index';
import moment from 'moment';

function checkIfFirstContactIsOlder(contactA: { createdat: Date, updatedat: Date }, contactB: { createdat: Date, updatedat: Date }){
    const { createdat: firstCreatedAt, updatedat: firstUpdatedAt } = contactA;
    const { createdat: secondCreatedAt, updatedat: secondUpdatedAt } = contactB;
    if(moment(firstCreatedAt).isBefore(moment(secondCreatedAt))){
        return true;
    }   
    if(moment(secondCreatedAt).isBefore(moment(firstCreatedAt))){
        return false;
    }
    if(moment(firstUpdatedAt).isBefore(moment(secondUpdatedAt))){
        return true;
    }
    return false;
}

function removeDuplicates(array: string[]) {
    const uniqueArray = [];
    const seen = new Set(); // Set to keep track of seen elements

    for (const item of array) {
        if (!seen.has(item)) {
            seen.add(item);
            uniqueArray.push(item);
        }
    }

    return uniqueArray;
}

async function updatePrimaryContactToSecondary(id: number, linkedId: number){
    const valuesArr = [linkedId, id, moment()];
    await pool.query(`UPDATE Contact SET linkedId=$1, linkPrecedence='secondary', updatedAt=$3 WHERE id=$2;`, valuesArr);
};

async function makeSecondaryContactIfEmailIsNew(email: string, phoneNumber: string, linkedId: number){

    const valuesArr = [email, phoneNumber, linkedId, 'secondary', moment(), moment()];
    const isEmailPresent = (await pool.query(`SELECT * FROM Contact WHERE email=$1`, [email])).rowCount;
    if(!isEmailPresent && email) 
        await pool.query(`INSERT INTO Contact(email, phoneNumber, linkedId, linkPrecedence, createdAt, updatedAt) VALUES($1, $2, $3, $4, $5, $6);`, valuesArr);
}

async function makeSecondaryContactIfPhoneNumberIsNew(email: string, phoneNumber: string, linkedId: number){

    const valuesArr = [email, phoneNumber, linkedId, 'secondary', moment(), moment()];
    const isPhoneNumberPresent = (await pool.query(`SELECT * FROM Contact WHERE phoneNumber=$1`, [phoneNumber])).rowCount;
    if(!isPhoneNumberPresent && phoneNumber) 
        await pool.query(`INSERT INTO Contact(email, phoneNumber, linkedId, linkPrecedence, createdAt, updatedAt) VALUES($1, $2, $3, $4, $5, $6);`, valuesArr);
}

async function makePrimaryContact(email: string, phoneNumber: string){

    const valuesArr = [email, phoneNumber, 'primary', moment(), moment()];
    const results = await pool.query(`INSERT INTO Contact(email, phoneNumber, linkPrecedence, createdAt, updatedAt) VALUES($1, $2, $3, $4, $5) RETURNING id`, valuesArr);
    return results.rows[0].id;
} 

async function findPrimaryContactByEmail(email: string){
    const results = await pool.query(`SELECT * FROM Contact WHERE (email = $1 and linkedId IS NULL) OR id=(SELECT DISTINCT linkedId FROM Contact WHERE email=$1 AND linkPrecedence='secondary');`, [email]);
    return results.rows;
}

async function findPrimaryContactByPhoneNumber(phoneNumber: string){
    const results = await pool.query(`SELECT * FROM Contact WHERE (phoneNumber = $1 and linkedId IS NULL) OR id=(SELECT DISTINCT linkedId FROM Contact WHERE phoneNumber=$1 AND linkPrecedence='secondary');`, [phoneNumber]);
    return results.rows;
}

async function getResponseObjForIdentifyContact(primaryContactId: number, primaryContactEmail: string, primaryContactPhoneNumber: string){

    const results = await pool.query('SELECT * from Contact WHERE linkedId=$1;', [primaryContactId]);
    const resEmails = [], resphoneNumbers = [], resSecondaryContactIds = [];

    if(primaryContactEmail) resEmails.push(primaryContactEmail);
    if(primaryContactPhoneNumber) resphoneNumbers.push(primaryContactPhoneNumber);

    for (let secondaryContact of results.rows) {
        if(secondaryContact.email) resEmails.push(secondaryContact.email);
        if(secondaryContact.phonenumber) resphoneNumbers.push(secondaryContact.phonenumber);
        resSecondaryContactIds.push(secondaryContact.id);
    }
    const responseObj = {
        contact: {
            primaryContactId: primaryContactId,
            emails: removeDuplicates(resEmails),
            phoneNumbers: removeDuplicates(resphoneNumbers),
            secondaryContactIds: resSecondaryContactIds
        }
    }
    return responseObj;
}

export{
    updatePrimaryContactToSecondary,
    makeSecondaryContactIfEmailIsNew,
    makeSecondaryContactIfPhoneNumberIsNew,
    makePrimaryContact,
    checkIfFirstContactIsOlder,
    removeDuplicates,
    findPrimaryContactByPhoneNumber,
    findPrimaryContactByEmail,
    getResponseObjForIdentifyContact
}
