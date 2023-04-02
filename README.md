## Installation

### Prerequisites:

- [node.js](https://nodejs.org/en)
- [Angular CLI](https://github.com/angular/angular-cli)
- typescript
- nodemon

##### \*\*also provided locally in devDependencies

#### globally installing:

```
npm install -g @angular/cli
npm install -g typescript
npm install -g nodemon
```

```bash
 git clone https://github.com/Shalom-David/vstore-project.git
```

1. setting up the server

   - change to the server directory

     ```
     cd vstore-project/server
     ```

   - setting up the server

     ##### for global installtion "npx" is not required

     ```
     npm install
     npx nodemon src/app
     ```

   - populating the database

     ```
     npm run populateDB
     ```

2. setting up the client

   - change to the client directory

     ```
     cd vstore-project/angular-client
     ```

   - running the client

     the client runs on https://localhost:4200

     ```
     npx ng serve
     ```

     or to automatically open the web page

     ```
     npx ng serve --open
     ```
TEST