# node-task

## Future improvements

- [ ] Use MongoDB instead of JsonDB *(branch `move-to-mongo`)*

## Development

### Installation and running

**1.** Create `.env` file based on `.env.example`

Important:  `JWT_SECRET` *- required, used to secure JWT token*

The rest are optional and have defaults:

```sh
PORT = 3000  #port on which API will be exposed
API_BASE = /api #API endpoints prefix
JWT_TTL = 300 #JWT expressed in seconds a time span (5 min)
```

**2.** Set Node.js version

```sh
nvm use
```

**3.** Install packages

```sh
yarn install
```

or

```sh
npm install
```

**4.** Start app

```sh
yarn dev
```

or

```sh
npm run dev
```

If you prefer to work with HMR run below commands each on separated terminal instance

```sh
yarn webpack

yarn start
```

or

```sh
npm run webpack

npm run start
```

## API

Server is running on: `http://localhost:3000`

### Authorization

Header
  : Authorization: Bearer \<token>

#### Credentials for mock users

|       | email          | password  |
| :---: | -------------- | --------- |
|   1   | admin@mail.com | admin1234 |
|   2   | user@mail.com  | user1234  |

### Endpoints

#### Not authorized endpoints

#### `POST /api/sign-in`

*Request:*

>```json
>{
>  "email": "string",
>  "password": "string"
>}

*Response:*

>```json
>  {
>    "authToken": "eyJhbGciOiJ...."
>  }
>  ```

&nbsp;

#### Authorized endpoints

#### `POST /api/generate-key-pair`

Header:
> Authorization: Bearer \<token>

*Response:*

>```json
>{
>   "privateKey": "-----BEGIN PRIVATE KEY-----MIIEvQIBA....",
>   "publicKey": "-----BEGIN PUBLIC KEY-----MIIBCgKa..."
>}
>  ```

Notice: *For security reason only public key is stored in database.*

&nbsp;

#### `POST /api/encrypt`

Header:
> Authorization: Bearer \<token>

*Response:*

>```json
>  {
>    "data": "MwOSshOLrk...:8Z2BLr5OfzTCp9...
>  }
>  ```

Notice: The `data` property is concatenated from two parts separated by colon `:`. The first one is encrypted AES password with RSA public key. The second one is file content encrypted with the AES password.

To get original content follow these steps:

  1. Split the data string for two parts. The divider is colon char `:`
  2. Decrypt the first part **AES password** using **RSA private key**
  3. Decrypt the second part using decrypted **AES password** in the previous step.
  4. Decrypted result is the original content.

Important: Used AES algorithm is *AES-256-ECB* without initialization vector (IV)
&nbsp;

## Requirements

* node.js >14.15.14
* yarn or npm
* nvm
