import storage from '@lib/firebase';
import { getAllImageUrls } from '@api/location/location.service';

const cleanUp = async () => {
  global.XMLHttpRequest = require('xhr2');
  console.log('Start to clean up FireStore');
  const storageRef = storage.ref('business-logos');

  const locationsMap = new Map();

  const locations = (await getAllImageUrls()).filter(
    (location) => location.imageUrl
  );

  locations.forEach((location) => {
    const urlParts = decodeURIComponent(location.imageUrl).split('/');
    const parts = urlParts.length;
    const filePath = `${urlParts[parts - 2]}/${
      urlParts[parts - 1].split('?')[0]
    }`;
    locationsMap.set(filePath, location._id);
  });

  let imageRefsToRemove = [];

  try {
    const result = await storageRef.listAll();

    result.items.forEach((imageRef) => {
      const imagePath = imageRef.fullPath;

      if (!locationsMap.has(imagePath)) {
        console.log('Delete from FireStore: ' + imagePath);
        imageRefsToRemove.push(imageRef.delete());
      }
    });

    await Promise.all(imageRefsToRemove);
    console.log('Finished clean up FireStore successfully');
  } catch (error) {
    console.log(error);
  }
};

module.exports = cleanUp;
