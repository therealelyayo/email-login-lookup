import app from './app';
import assert from 'assert';
import debug from 'debug';

const log = debug('mx:server');

assert(process.env.PORT, 'process.env.PORT required');
app.listen(process.env.PORT, () => {
  log(`listening on port ${process.env.PORT}`);
});
