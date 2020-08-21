import debug from 'debug';
import assert from 'assert';
import Q from 'q';
import dns from 'dns';
import express from 'express';
import cors from 'cors';
import _ from 'lodash';
import loginLookups from './logins';
import addrs from 'email-addresses';

const app = express();
const log = debug('mx:app');

app.use(cors());

function getEmailDomain(email) {
  const addresses = addrs(email).addresses;
  assert(addresses.length === 1, 'invalid email address');
  return addresses[0].domain;
}

app.get('/', (req, res) => {
  Q.fcall(() => {
    // step 1
    // parameter validation
    assert(req.query.hasOwnProperty('email'), 'email required');
  }).then(() => {
    // step 2
    // look up the mx entries for the domain
    const defer = Q.defer();
    dns.resolveMx(getEmailDomain(req.query.email), defer.makeNodeResolver());
    return defer.promise;
  }).then(mx => {
    // step 3
    // look up the login urls for each mx domain
    return mx
      // trim off the domain and tld
      .map(e => _.takeRight(e.exchange.split('.'), 2).join('.'))
      .map(e => e.toLowerCase())
      // try to lookup the login url from our pre defined list
      .map(exchangeDomain => {
        log('exchange domain %s %s', req.query.email, exchangeDomain);
        return typeof loginLookups[exchangeDomain] === 'function' ?
          loginLookups[exchangeDomain](getEmailDomain(req.query.email)) :
          loginLookups[exchangeDomain];
      });
  }).then(logins => {
    // step 4
    // make sure they all resolve to the same login
    assert(_.uniq(logins).length === 1, 'multiple logins not supported');
    assert(logins[0], 'unknown login');
    return logins[0];
  }).then(
    login => res.status(200).json(login),
    err => res.status(500).json(err.message)
  );
});

export default app;
