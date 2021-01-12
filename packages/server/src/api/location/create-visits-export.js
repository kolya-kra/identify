import { getExportVisitsByLocationId } from '@api/location/location.service';
import { createObjectCsvWriter as CsvWriter } from 'csv-writer';
import storage from '@lib/firebase';
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { sendMail } from '@lib/mailing';

export const createVisitsExportForLocation = async (locationId, email) => {
  global.XMLHttpRequest = require('xhr2');
  const fileFolder = path.join(process.cwd(), 'temp');
  const fileName = `${locationId}-${moment().valueOf()}.csv`;
  const filePath = path.join(fileFolder, fileName);

  if (!fs.existsSync(fileFolder)) {
    fs.mkdirSync(fileFolder, { recursive: true });
  }

  const csvWriter = CsvWriter({
    path: filePath,
    fieldDelimiter: ';',
    header: [
      { id: 'name', title: 'Name' },
      { id: 'firstname', title: 'First Name' },
      { id: 'phone', title: 'Phone' },
      { id: 'email', title: 'E-Mail' },
      { id: 'checkIn', title: 'Check-In' },
      { id: 'checkOut', title: 'Check-Out' },
    ],
  });

  return new Promise(async (resolve, reject) => {
    try {
      const visits = await getExportVisitsByLocationId(locationId);

      if (visits?.length > 0) {
        const records = visits
          .sort((a, b) => a.checkIn - b.checkIn)
          .map((visit) => {
            return {
              name: visit.visitor.name,
              firstname: visit.visitor.firstname,
              phone: visit.visitor.phone,
              email: visit.visitor.email,
              checkIn: moment(visit.checkIn).format('dddd, D. MMM YYYY, HH:mm'),
              checkOut: moment(visit.checkOut).format(
                'dddd, D. MMM YYYY, HH:mm'
              ),
            };
          });

        await csvWriter.writeRecords(records);

        const csvFile = fs.readFileSync(filePath);

        const uploadTask = storage
          .ref(`exports/${fileName}`)
          .put(csvFile, { contentType: 'text/csv' });
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            console.log('Visits-Export Upload Progress: ' + progress);
          },
          (error) => {
            console.log('Visit-Export Upload failed');
            console.log(error);
          },
          () => {
            console.log('Visit-Export Upload successfully');
          }
        );

        const htmlPath = path.join(
          process.cwd(),
          'src',
          'lib',
          'templates',
          'location-export-visits.html'
        );

        const location = visits[0].location;

        const htmlReplacements = {
          locationName: location.name,
          ...location.address,
        };

        const attachments = [
          {
            ContentType: 'text/csv',
            Filename: 'locations-export.csv',
            Base64Content: csvFile.toString('base64'),
          },
        ];

        const request = await sendMail(
          email,
          'Location visits export',
          'Location Export',
          { htmlPath, htmlReplacements },
          attachments
        );

        console.log('Send Mail successfully');
        fs.unlinkSync(filePath);

        return resolve('Mail sent');
      } else {
        return reject('No visits for this location');
      }
    } catch (error) {
      console.log(error);
      return reject(error);
    }
  });
};
