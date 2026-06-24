import app from './src/app.js';
import { Config } from './src/config/config.js';
import { dbConnection } from './src/config/db.js';

dbConnection()
  .then(() => {
    app.listen(Config.PORT, () => {
      console.log(`Server is running on port ${Config.PORT}`);
    });
  })
  .catch((error) => {
    console.log('Failed to connect to database', error);
  });
