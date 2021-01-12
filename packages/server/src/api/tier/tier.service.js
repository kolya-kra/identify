import paypal from '@paypal/checkout-server-sdk';
import DbConnection from '@lib/database-adapter';
import moment from 'moment';
import { v4 as uuid } from 'uuid';

export const bookTier = (businessId, orderId, tierId, periods) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const environment = new paypal.core.SandboxEnvironment(
    clientId,
    clientSecret
  );
  const client = new paypal.core.PayPalHttpClient(environment);
  const request = new paypal.orders.OrdersGetRequest(orderId);

  console.log(businessId);

  return new Promise(async (resolve, reject) => {
    let orderDetails;
    try {
      orderDetails = await client.execute(request);
      const order = orderDetails.result;
      console.log(order);

      if (order.status === 'COMPLETED') {
        //Transaction is verified
        const db = await DbConnection.Get();
        const tier = await db.collection('tiers').findOne({ id: tierId });

        const business = await db
          .collection('businesses')
          .findOne({ id: businessId });

        let expiryDate;

        /**
         * check if current tier exists
         * AND current tier is equals the booked tier
         * AND the expiry date of the current tier is in the future
         */

        if (
          business?.currentTier?.expiry &&
          business.currentTier.id === tierId &&
          moment(business.currentTier.expiry).diff(moment(), 'h') >= 1
        ) {
          expiryDate = moment(business.currentTier.expiry)
            .add(periods, 'w')
            .toISOString();
        } else {
          expiryDate = moment(order.create_time)
            .add(periods, 'w')
            .toISOString();
        }

        console.log(expiryDate);

        await db.collection('orders').insertOne({
          id: uuid(),
          paypalOrderId: order.id,
          tierId,
          amount: order.purchase_units[0].amount,
          date: order.create_time,
          businessId,
        });
        try {
          const business = await db.collection('businesses').findOneAndUpdate(
            { id: businessId },
            {
              $set: {
                currentTier: {
                  id: tierId,
                  expiry: expiryDate,
                },
              },
            }
          );
          return resolve(business);
        } catch (error) {
          return reject(error);
        }
      } else {
        return reject('Order uncompleted');
      }
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });
};

export const getCurrentTier = (businessId) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const businesses = await db
      .collection('businesses')
      .aggregate([
        { $match: { id: businessId } },
        {
          $lookup: {
            from: 'tiers',
            localField: 'currentTier.id',
            foreignField: 'id',
            as: 'tier',
          },
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'id',
            foreignField: 'businessId',
            as: 'location',
          },
        },
        { $unwind: '$tier' },
        {
          $project: {
            id: 1,
            name: 1,
            customLimits: 1,
            order: 1,
            usage: {
              capacity: { $sum: '$location.capacity' },
              locations: { $size: '$location' },
            },
            tier: {
              id: '$tier.id',
              title: '$tier.title',
              limits: '$tier.limits',
              expiry: '$currentTier.expiry',
            },
          },
        },
      ])
      .toArray();
    if (businesses && businesses.length >= 1) {
      const business = businesses[0];
      if (business.tier) return resolve(business);
      else return reject({ status: 402, message: 'No Tier found' });
    } else {
      return reject({ status: 402, message: 'No Tier found' });
    }
  });
};
