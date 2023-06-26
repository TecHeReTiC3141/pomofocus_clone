const express = require('express');

const app = express();

app.listen(process.env.POST || 3000,
    () => console.log('On http://localhost:3000'));