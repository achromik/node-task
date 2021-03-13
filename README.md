# node-task

## Development

**1.** Create `.env` file based on `.env.example`
: Required is only `JWT_SECRET`
The rest have defaults:

    ```sh
    PORT = 3000  #port on which API will be exposed
    API_BASE = /api #API endpoints prefix
    JWT_TTL = 300 #JWT expressed in seconds a time span (5 min)
    ```

**2.** Set Node.js version

    nvm use

**3.** Install packages

    yarn install

or

    npm install

**4.** Start app

    yarn dev

or

    npm run dev

If you prefer to work with HMR run below commands each on separated terminal instance

    yarn webpack

    yarn start

or

    npm run webpack

    npm run start

### API

Server is running on: `http://localhost:3000`

#### Authorization

Header
  : Authorization: Bearer \<token>

##### Credentials for mock users

|       | email          | password  |
| :---: | -------------- | --------- |
|   1   | admin@mail.com | admin1234 |
|   2   | user@mail.com  | user1234  |

#### Endpoints

Not authorized endpoints
  : `POST /api/sign-in`


Authorized endpoints
  : `POST /api/generate-key-pair`
    `POST /api/encrypt`




## Requirements

* node.js >14.15.14
* yarn or npm
* nvm
