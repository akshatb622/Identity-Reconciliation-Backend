# Backend Code For Bitespeed Backend Task: Identity Reconciliation

Link to the task: 

https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199

# Tech Stack Used: 

1. Framework and Language: Node.js, Express.js, Typescript
2. Database(SQL Database): PostgreSQL

# Link to the live deployed API: 

https://identity-reconciliation-backend.onrender.com/

# API Documentation: 

1. endpoint: /identify
2. method: POST
3. body(JSON payload): <br> 
```json
{
    "email":"mcfly@hillvalley.edu",
    "phoneNumber":"123456"
}
```

4. reponse: <br>

```json
{
	"id": 1,                  
    "phoneNumber": "123456",
    "email": "mcfly@hillvalley.edu",
    "linkedId": null,
    "linkPrecedence": "primary",
    "createdAt": "2023-04-01 00:00:00.374+00",              
    "updatedAt": "2023-04-01 00:00:00.374+00",              
    "deletedAt": null
}
```

# Steps to Setup on local: 

## Note: You should have the following installed on your system before proceeding: 

1. node and npm
2. postgresql

## Steps: 
1. Clone the repository on local.
2. Run command: cd backend/ 
3. Make a file with name .env and add the following lines to the file: <br>
    +    PORT=<'port of the backend server'>
    +    DATABASE_USER=<'Name of your postgres user on local'>
    +    HOST=localhost  
    +    DATABASE_NAME=<'Name of the database in postgres'>
    +    PASSWORD=<'Your database password'>
    +    DATABASE_PORT=5432 // default port of postgres server
3. Run command: npm i
4. Run command: npm run start-dev

Congrats! Your server is running.