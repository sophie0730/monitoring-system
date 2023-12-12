// /* eslint-disable no-param-reassign */
// import axios from 'axios';
// import { fetchData } from './fetch.js';
// import { publishUpdateMessage } from '../utils/redis-util.js';
// import * as influxUtils from '../utils/influxdb-util.js';

// function parseTime(durationStr) {
//   const match = durationStr.match(/^(\d+)(m|s|h|d)$/);
//   const value = match[1];
//   const unit = match[2];
//   let parsedTime; // 先換成秒級

//   switch (unit) {
//     case 's':
//       parsedTime = value;
//       break;
//     case 'm':
//       parsedTime = value * 60;
//       break;
//     case 'h':
//       parsedTime = value * 60 * 60;
//       break;
//     case 'd':
//       parsedTime = value * 24 * 60 * 60;
//       break;
//     default:
//       break;
//   }

//   const msTime = parsedTime * 1000;
//   return msTime;
// }

// function dateInterval(startTimeStr, endTimeStr) {
//   const startTime = new Date(startTimeStr);
//   const endTime = new Date(endTimeStr);

//   return endTime - startTime;
// }

// async function storeAlert(groupName, alert) {
//   let influxQuery;
//   const timestamp = Date.now() * 1e6;
//   if (alert == null) {
//     influxQuery = `${influxUtils.ALERT_MEASUREMENT},item=${groupName} startTime="NA",isFiring="false" ${timestamp}`;
//   } else {
//     influxQuery = `${influxUtils.ALERT_MEASUREMENT},item=${groupName} startTime="${alert.startTime}",isFiring="${alert.isFiring}" ${timestamp}`;
//   }

//   await axios.post(influxUtils.WRITE_API_URL, influxQuery, {
//     headers: { Authorization: `Token ${influxUtils.TOKEN}` },
//   })
//     .catch((error) => console.error(error));
// }

// async function checkSingleAlert(group, alertStates, timeRange) {
//   try {
//     const duration = parseTime(group.rules[0].for);
//     const fluxQuery = `from(bucket: "${influxUtils.BUCKET}")
//     |> range(start: -${timeRange})
//     |> filter(${group.rules[0].expr})`;
//     const data = await fetchData(fluxQuery);

//     if (data.length === 0) {
//       alertStates[group.name] = null;
//       await storeAlert(group.name, alertStates[group.name]);
//       await publishUpdateMessage();
//       return;
//     }

//     if (!alertStates[group.name]) {
//       alertStates[group.name] = { startTime: data[0]._time, isFiring: 'pending' };
//       await storeAlert(group.name, alertStates[group.name]);
//       await publishUpdateMessage();
//     } else if (alertStates[group.name].isFiring !== 'true' && dateInterval(alertStates[group.name].startTime, data[data.length - 1]._time) >= duration) {
//       alertStates[group.name].isFiring = 'true';
//       await storeAlert(group.name, alertStates[group.name]);
//       await publishUpdateMessage();
//       // sendEmail(group.name, group.rules[0].expr);
//       // sendLineMessage(group.name, group.rules[0].expr);
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// process.on('message', async (message) => {
//   try {
//     const { group, alertStates, timeRange } = message;
//     console.log(message);
//     await checkSingleAlert(group, alertStates, timeRange);
//     process.send({ done: true });
//   } catch (error) {
//     console.error(error);
//     process.send({ done: true, error: error.message });
//   }
// });