const express = require('express')
const app = express();

app.use(express.static(`${__dirname}/dist`));

app.get('/docs', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.listen(4000, () => {
  console.log('api server for ims service listening on port 4000')
});