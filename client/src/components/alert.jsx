import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function AlertTitle() {
  return (
    <div className="title">
      <h1>Alerts</h1>
    </div>
  );
}

function Alert() {
  const alertAPI = 'http://localhost:4000/api/1.0/alert';
  const SERVER_URL = 'http://localhost:4000';
  const [alertStatus, setAlertStatus] = useState({});

  useEffect(() => {
    axios.get(alertAPI)
      .then((response) => {
        const alertObj = response.data;
        setAlertStatus(alertObj);
      })
      .catch((error) => console.error(error));

    const socket = io(SERVER_URL);
    socket.on('connect', () => console.log('connected to socket.io server'));
    socket.on('dataUpdate', () => {
      axios.get(alertAPI)
        .then((response) => {
          const alertObj = response.data;
          setAlertStatus(alertObj);
        })
        .catch((error) => console.error(error));
    });
  }, []);

  // eslint-disable-next-line block-spacing, no-lone-blocks, no-unused-expressions
  return (
    <div className='alerts'>
      {alertStatus.groups && alertStatus.groups.map((group) => {
        let firingClass = '';
        let backGroundClass = '';
        if (group.startTime === 'NA') {
          firingClass = 'NORMAL';
          backGroundClass = 'GREEN';
        } else if (!group.startTime) {
          firingClass = 'NOT_DETECTED';
          backGroundClass = 'GREY';
        } else {
          firingClass = (group.isFiring === 'true') ? 'FIRING' : 'PENDING';
          backGroundClass = (group.isFiring === 'true') ? 'RED' : 'YELLOW';
        }
        const startTimeLocale = (group.startTime !== 'NA') ? new Date(group.startTime).toLocaleString() : 'NA';
        return (
            <div className='alert' key={group.name}>
              <div className={`groupName ${backGroundClass}`}>
                <h2>{group.name}</h2>
              </div>
              <div className='rule'>
                <pre id='alertText'>
                  alert: {group.rules[0].alert} <br />
                  expr: {group.rules[0].expr} <br />
                  for: {group.rules[0].for} <br />
                  annotations: <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;summary: {group.rules[0].annotations.summary} <br />
                </pre>
              </div>
              <table>
                <thead>
                  <tr>
                    <th className='state'>State</th>
                    <th className='startTime'>Active Since</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className={`state ${firingClass}`}>{firingClass}</span></td>
                    <td><span className='startTime'>{startTimeLocale}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
        );
      })}
    </div>
  );
}

export function AlertPanel() {
  return (
    <main>
      <AlertTitle />
      <Alert />
    </main>
  );
}

export default AlertPanel;
