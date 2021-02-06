import app from './app.js';
const port = process.env.HTTPS_PORT || 3010;

app.listen(port, () => console.log('Server up and running on ' + port));