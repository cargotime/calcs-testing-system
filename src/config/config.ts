require('dotenv').config();

export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    type: 'mysql',
    synchronize: true,
    entities: [],
  },
});
