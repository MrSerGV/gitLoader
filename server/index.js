const Sequelize = require('sequelize');
const express = require('express');
const cors  = require('cors');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const fetch = require("node-fetch");

var sequelize = new Sequelize('git', 'root', '',
    {
        host: 'localhost',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        logging: false
    }
);

var User = sequelize.define('user', {
    login: Sequelize.STRING,
    gitUserId:  Sequelize.INTEGER
})

var Repository = sequelize.define('repository',{
    gitReposId: Sequelize.INTEGER,
    name: Sequelize.STRING,
    owner: Sequelize.STRING,
    favorite: Sequelize.BOOLEAN
})

User.hasMany(Repository)
Repository.belongsTo(User)

async function fillDB(){
    await sequelize.sync()
    var user1 = await User.create( 
                        {
                                login: 'First',
                            gitUserId: 26666666661
                        })
    var user2 = await User.create(
                        {
                                login: 'Second',
                            gitUserId: 15464848444
                        })
    
    var repository1 = await Repository.create(
                        {
                                name: 'First repo',
                               owner: 'First',
                          gitReposId: 646488,
                        })
    var repository2 = await Repository.create(
                        {
                                name: 'Second repo',
                               owner: 'Second',
                          gitReposId: 646489,
                        })
    var repository3 = await Repository.create(
                        {
                                name: 'Third repo',
                               owner: 'First',
                          gitReposId: 646487
                        })
   
    user1.addRepository(repository1)
    user2.addRepository(repository2)
    user1.addRepository(repository3)
   
};
//fillDB()


// GraphQL schema
//
var schema = buildSchema(`

    type Query {
        user(login: String!): User
        repository(id: String!, userId: Int!): Snippet
        getAllUsers: [User]
        getAllRepos: [Repository]
        getAllFavRepos: [Repository]
    }

    type User {
        id: Int
        login: String
        gitUserId: Int
    }

    type Repository {
        id: Int
        name: String
        owner: String
        timestamp: Int
        favorite: Boolean
        reposId: Int
    }

    type Mutation {
        createUser(login: String!, gitUserId: Int!): User
        updateRepository(id:Int!, name: String!, owner: String!,favorite: Boolean!
    }

`);

async function createtUser(login){
    var user = await User.findOne(login)
    var loginURL = "https://api.github.com/users/" + login ;
    var reposURL = loginURL + "/repos";
    if(!user){
        await fetch(loginURL).then(res  =>res.json()).then(json => 
            user = JSON.stringify(json));
        User.create({login, gitUserId: user.id})

        await fetch(reposURL).then(res  =>res.json()).then(json => 
            repository = JSON.stringify(json));
        return  Repository.create({name: repository.name,
                                   owner: repository.owner,login,
                                   timestamp: repository.created_at,
                                   favorite: repository.favorite,
                                   reposId: repository.id})
    }
    await fetch(reposURL).then(res  =>res.json()).then(json => 
        newRepository = JSON.stringify(json));
    var repository = await Repository.findAll({
                                                where: {
                                                    owner: login
                                                }
                                              })
    if(repository=!newRepository){
        Repository.create({name: newRepository.name,
                           owner: newRepository.owner,login,
                           timestamp: newRepository.created_at.getTime()/1000,
                           reposId: newRepository.id})
    }
    return Repository.findAll({
                                where: {
                                    owner: login
                                }
                              })
}

// Root resolver
var root = {
    user: createUser,
    getAllUsers,
    getAllRepos,
    updateRepository,
}; 

// Create an express server and a GraphQL endpoint
var app = express();
app.use(cors())

app.use('/graphql', express_graphql({
        schema: schema,
        rootValue: root,
        graphiql: true,
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));

var last50Repos= require('./lastRepos.js');
app.get('/lastRepos', last50Repos.get);

run()


