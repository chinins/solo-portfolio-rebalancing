// const _ = require('lodash');
const axios = require('axios');
const Users = require('../db');
const names = require('../ticker-to-names');

const baseUrl = 'https://api.iextrading.com/1.0';

// const integerRound = (num) => {
//   return Math.round
// }

const rebalance = async (user) => {
  const { _id, username, investment, ...filtered } = user;

  const prices = await Object.keys(filtered).reduce(async (acc, key) => {
    const price = await axios(`${baseUrl}/stock/${key}/price`);
    const prev = await acc;
    return {
      ...prev,
      [key]: price.data,
    };
  }, {});

  const totalSum = Object.keys(filtered).reduce((sum, n) => sum + filtered[n].units * prices[n], 0);
  const newSum = totalSum + user.investment;

  const filter = Object
    .keys(filtered)
    .reduce((acc, key) => ({
      ...acc,
      [key]: {
        ...filtered[key],
        currentAlloc: Math.round(prices[key] * filtered[key].units / totalSum * 1000),
        ticker: key,
        price: prices[key],
        name: names[key],
        value: Math.round(prices[key] * filtered[key].units),
        valueToRebalance: Math.round((filtered[key].target - filtered[key].units * prices[key]
          / newSum) * newSum),
        unitsToRebalance: Math.round(((filtered[key].target - filtered[key].units * prices[key]
          / newSum) * newSum) / prices[key]),
      },
    }),
    {});
  return Object.assign(user, await filter);
};

module.exports.createUser = async (ctx) => {
  const userData = ctx.request.body;

  let user = await Users.findOne({ username: userData.username });

  if (user) {
    ctx.status = 400;
    ctx.body = {
      error: 'Username already exists',
    };
  } else {
    user = {
      username: userData.username,
      investment: 0,
    };
    ctx.body = await Users.insert(user);
    ctx.status = 200;
  }
};

module.exports.getPortfolio = async (ctx, next) => {
  const username = ctx.headers['x-user'];
  if (!username) return next();

  let user = await Users.findOne({ username });
  user = await rebalance(user);

  if (!user) {
    ctx.body = {
      Error: 'No user with this username',
    };
    ctx.status = 401;
  } else {
    ctx.body = user;
    ctx.status = 200;
  }
};

module.exports.addIndexFund = async (ctx, next) => {
  const username = ctx.headers['x-user'];
  if (!username) return next();

  const indexFund = ctx.request.body;

  const tickerKey = Object.keys(indexFund)[0];
  ctx.body = await Users.findOneAndUpdate({ username }, {
    $set: {
      [`${tickerKey}`]: indexFund[tickerKey],
    },
  });
  ctx.status = 200;
};

module.exports.rebalancePortfolio = async (ctx, next) => {
  const username = ctx.headers['x-user'];
  if (!username) return next();

  const user = await Users.findOne({ username });

  if (!user) {
    ctx.body = {
      Error: 'No user with this username',
    };
    ctx.status = 401;
  } else {
    ctx.body = await rebalance(user);
    ctx.status = 200;
  }
};

module.exports.addExtra = async (ctx, next) => {
  const username = ctx.headers['x-user'];
  if (!username) return next();

  const extra = ctx.request.body;
  console.log(extra);

  ctx.body = await Users.findOneAndUpdate({ username }, {
    $set: {
      investment: extra.investment,
    },
  });
  ctx.status = 200;
};

module.exports.confirmRebalance = async (ctx, next) => {
  const username = ctx.headers['x-user'];
  if (!username) return next();

  const user = await Users.findOne({ username });

  if (!user) {
    ctx.body = {
      Error: 'No user with this username',
    };
    ctx.status = 401;
  } else {
    // ctx.body = await rebalance(user);
    ctx.status = 200;
  }
};
