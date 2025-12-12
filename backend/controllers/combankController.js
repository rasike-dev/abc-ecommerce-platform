import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import axios from 'axios';
import {
  testCombankUrl,
  combankApiUserName,
  combankPassword,
  combankMerchant,
} from '../config/constants.js';

const sendCombankOrder = asyncHandler(async (req, res, next) => {
  console.log('request hit');

  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  //console.log(order);
  console.log(order.user);

  let description = order.user.name + order.user.email;

  let combankRequest = 'apiOperation=CREATE_CHECKOUT_SESSION&';
  combankRequest += `apiUsername=${combankApiUserName}`;
  combankRequest += `apiPassword=${combankPassword}`;
  combankRequest += `merchant=${combankMerchant}`;
  combankRequest += `order.id=${order._id}&`;
  combankRequest += `order.amount=${order.totalPrice}&`;
  combankRequest += 'order.currency=LKR&';
  combankRequest += `order.description=${description}&`;
  combankRequest += 'interaction.operation=PURCHASE&';
  combankRequest += `interaction.returnUrl=http://localhost:3000/order/${order._id}/&`;
  combankRequest += 'interaction.merchant.name=IMESCHOOL.lk';

  try {
    console.log(combankRequest);
    const response = await axios.post(testCombankUrl, combankRequest);
    console.log(response.data);

    if (response.status && response.status == 200) {
      let responseObj = {};
      responseObj.orderId = order._id;
      let data = response.data;
      let values = data.split('&');

      for (let value of values) {
        let resp = value.split('=');
        if (resp[0] == 'result') {
          responseObj.result = resp[1];
        } else if (resp[0] == 'session.id') {
          responseObj.sessionId = resp[1];
        } else if (resp[0] == 'session.version') {
          responseObj.sessionVersion = resp[1];
        } else if (resp[0] == 'session.updateStatus') {
          responseObj.sessionUpdateStatus = resp[1];
        } else if (resp[0] == 'successIndicator') {
          responseObj.successIndicator = resp[1];
        } else if (resp[0] == 'merchant') {
          responseObj.merchant = resp[1];
        }
      }

      order.paymentResult.successIndicator = responseObj.successIndicator;
      order.paymentResult.sessionId = responseObj.sessionId;
      order.paymentResult.sessionVersion = responseObj.sessionVersion;

      const updatedOrder = await order.save();

      console.log(updatedOrder);

      if (responseObj.result) {
        if (responseObj.result == 'SUCCESS') {
          res.status(200).json({
            message: 'Session created successfully',
            data: responseObj,
          });
        } else if (responseObj.result == 'ERROR') {
          responseObj.error = response.data;
          console.log(responseObj);
          res.status(200).json({
            message: 'error: Session creation failed, try again in few minutes',
            error: responseObj,
            data: null,
          });
        }
      }
    } else {
      res.status(response.status).json({
        message: 'Session creation failed, try again in few minutes',
        data: null,
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      console.log(err);
    }
    res.status(response.status).json({
      message: 'Session creation failed, try again in few minutes',
      data: null,
    });
  }
});

export { sendCombankOrder };
