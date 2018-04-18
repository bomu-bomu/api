import express from 'express';
import bodyParser from 'body-parser';

import * as rp from './rp';
import * as idp from './idp';
import * as as from './as';
import * as utils from './utils';
import { role } from '../config';

/*
  data = { requestId }
*/
export async function getRequest(data) {
  return await utils.queryChain('GetRequest', data);
}

// Listen for callbacks (events) from Node Logic
const app = express();
const SMART_CONTRACT_CALLBACK_PORT = process.env.SMART_CONTRACT_CALLBACK_PORT || 3001;
const SMART_CONTRACT_CALLBACK_PATH =
  process.env.SMART_CONTRACT_CALLBACK_PATH || '/callback';

app.use(bodyParser.json({ limit: '2mb' }));

app.post(SMART_CONTRACT_CALLBACK_PATH, (req, res) => {
  const { requestId } = req.body;

  let handleNodeLogicCallback;
  if (role === 'rp') {
    handleNodeLogicCallback = rp.handleNodeLogicCallback;
  } else if (role === 'idp') {
    handleNodeLogicCallback = idp.handleNodeLogicCallback;
  } else if (role === 'as') {
    handleNodeLogicCallback = as.handleNodeLogicCallback;
  }

  if (handleNodeLogicCallback) {
    handleNodeLogicCallback(requestId);
  }

  res.status(200).end();
});

app.listen(SMART_CONTRACT_CALLBACK_PORT, () =>
  console.log(
    `Listening to Node Logic callbacks on port ${SMART_CONTRACT_CALLBACK_PORT}`
  )
);