import express, { NextFunction, Request, Response } from 'express';
import { updatePrimaryContactToSecondary, makeSecondaryContactIfEmailIsNew, makeSecondaryContactIfPhoneNumberIsNew, makePrimaryContact,
        checkIfFirstContactIsOlder, findPrimaryContactByEmail, findPrimaryContactByPhoneNumber, getResponseObjForIdentifyContact } from '../helper/index';

async function identifyContact(req: Request, res: Response, next: NextFunction) {
    if (!req.body.email && !req.body.phoneNumber) return res.send({ errorMessage: "Please provide either a valid email or a valid phone number" });
    try {
        const { email, phoneNumber }: { email: string, phoneNumber: string } = req.body;
        let primaryContactWithGivenEmail: any[] = [], primaryContactWithGivenPhoneNumber: any[] = [], primaryContactId, primaryContactEmail, primaryContactPhoneNumber;
        if (email) {
            primaryContactWithGivenEmail = await findPrimaryContactByEmail(email);
        }
        if (phoneNumber) {
            primaryContactWithGivenPhoneNumber = await findPrimaryContactByPhoneNumber(phoneNumber);
        }
        if (!primaryContactWithGivenEmail.length && !primaryContactWithGivenPhoneNumber.length) {
            primaryContactId = await makePrimaryContact(email, phoneNumber);
            primaryContactEmail = email;
            primaryContactPhoneNumber = phoneNumber;
            const responseObj = await getResponseObjForIdentifyContact(primaryContactId, primaryContactEmail, primaryContactPhoneNumber);
            return res.send(responseObj);
        }
        if (primaryContactWithGivenEmail.length === 0) {
            const { id } = primaryContactWithGivenPhoneNumber[0];

            primaryContactId = id;
            primaryContactEmail = primaryContactWithGivenPhoneNumber[0].email;
            primaryContactPhoneNumber = primaryContactWithGivenPhoneNumber[0].phonenumber;

            await makeSecondaryContactIfEmailIsNew(email, phoneNumber, id);

            const responseObj = await getResponseObjForIdentifyContact(primaryContactId, primaryContactEmail, primaryContactPhoneNumber);
            return res.send(responseObj);
        }
        if (primaryContactWithGivenPhoneNumber.length === 0) {
            const { id } = primaryContactWithGivenEmail[0];

            primaryContactId = id;
            primaryContactEmail = primaryContactWithGivenEmail[0].email;
            primaryContactPhoneNumber = primaryContactWithGivenEmail[0].phonenumber;

            await makeSecondaryContactIfPhoneNumberIsNew(email, phoneNumber, id);
            const responseObj = await getResponseObjForIdentifyContact(primaryContactId, primaryContactEmail, primaryContactPhoneNumber);
            return res.send(responseObj);
        }
        const { id: firstContactId, createdat: firstContactCreatedAt, updatedat: firstContactUpdatedAt, email: firstContactEmail, phonenumber: firstContactPhoneNumber } = primaryContactWithGivenEmail[0];
        const { id: secondContactId, createdat: secondContactCreatedAt, updatedat: secondContactUpdatedAt, email: secondContactEmail, phonenumber: secondContactPhoneNumber } = primaryContactWithGivenPhoneNumber[0];
        if (firstContactId === secondContactId) {
            primaryContactId = firstContactId;
            primaryContactEmail = firstContactEmail;
            primaryContactPhoneNumber = firstContactPhoneNumber;

            const responseObj = await getResponseObjForIdentifyContact(primaryContactId, primaryContactEmail, primaryContactPhoneNumber);
            return res.send(responseObj);
        }
        if(checkIfFirstContactIsOlder({ createdat: firstContactId, updatedat: firstContactUpdatedAt }, { createdat: secondContactCreatedAt, updatedat: secondContactUpdatedAt})){
            primaryContactId = firstContactId;
            primaryContactEmail = firstContactEmail;
            primaryContactPhoneNumber = firstContactPhoneNumber;

            await updatePrimaryContactToSecondary(secondContactId, firstContactId);
            const responseObj = await getResponseObjForIdentifyContact(primaryContactId, primaryContactEmail, primaryContactPhoneNumber);
            return res.send(responseObj);
        }

        primaryContactId = secondContactId;
        primaryContactEmail = secondContactEmail;
        primaryContactPhoneNumber = secondContactPhoneNumber;

        await updatePrimaryContactToSecondary(firstContactId, secondContactId);
        const responseObj = await getResponseObjForIdentifyContact(primaryContactId, primaryContactEmail, primaryContactPhoneNumber);
        return res.send(responseObj);
    } catch (error) {
        return next(error);
    }
};

export {
    identifyContact
}