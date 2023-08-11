import express, { NextFunction, Request, Response } from 'express';
import { connectToDatabase } from './db';
import { createContactModel } from './models/contact_model';
import { identifyContact } from './controller';

const app = express();

const PORT = process.env.PORT || 3689;

// connecting to the database
connectToDatabase()

// Creating Contact Model in the database
createContactModel()
app.use(express.json());

app.post('/identify', identifyContact);

app.use(customErrorHandler);
function customErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(`customErrorHandler: ${err.stack}`);
    return res.status(500).send({ errorMessage: 'Internal Server Error. Please try again later.'});
}

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
