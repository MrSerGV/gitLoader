import React, { Component } from 'react';
import './App.css';
import {Router, Route, Link, Switch, Redirect} from "react-router-dom";
import createHistory from "history/createBrowserHistory";
import {createStore, combineReducers} from 'redux';
import {Provider, connect}   from 'react-redux';
import { GraphQLClient } from 'graphql-request'
import moment from 'moment';



const gql = new GraphQLClient("http://localhost:4000/graphql", { headers: {} })


function userReducer(state, action){
    if (state === undefined){
        return {data: {}, status: 'EMPTY'}
    }
    if (action.type === 'USER_ADD'){
       
        if (action.data.user ){
            return {data: action.data.user, status: 'USER_DATA'}    
        }
    }
    return state;
}

function repositoryReducer(state, action){
    if (state === undefined){
        return {data: {}, status: 'EMPTY'};
    }
    if (action.type === 'REPO_COME'){
        return {data: action.data.repository, status: 'DATA_REPOSITORY'}     
    }
    if (action.type === 'ADD_FAVORITE'){
        return [...state, action.data.repository]
    }
    if (action.type === 'DEL_FAVORITE'){
        return state.filter(repository=>repository !== action.data.repository)
    }
    return state
}

  
const reducers = combineReducers({
    user:  userReducer,
    repository:  repositoryReducer,
})
var store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const mapStateToProps = function(store) {
    return {
        user: store.user,
        repository: store.user,
    };
}





 
class Repository extends Component {
    constructor(props){
      super(props)
      this.addFavRepos = this.addFavRepos.bind(this)
  }
    addFavRepos(){
        `mutation ($id: Int!, $name: String!,$owner: String!, $favorite: Boolean!) {
            updateRepository(_id: $id,name: $name, owner: $owner, favorite: $favorite) {
              id
              name
              owner
              favorite                          
            }
          }`,
        {id: this.props.repository.id,
         name: this.props.repository.name,
         owner: this.props.repository.owner,
         favorite: !this.props.repository.favorite}
         .then(data =>store.dispatch({type: 'ADD_FAVORITE', data}))
    }
    render(){  
        return (
            <div  className='Repository'>
               <tr>
                   <td>{this.props.repository.id}</td>
                   <td>{this.props.repository.name}</td>
                   <td>{this.props.repository.owner}</td>
               </tr>
               <button className='Button' onClick={this.addFavRepos}>Add repository to Favorite</button>
            </div> 
        );
    }
}
Repository = connect(mapStateToProps)(Repository)

class RepositoryList extends Component {    
    render(){
        gql.request(
            `query getAllRepos`)
            .then(data => store.dispatch({type: 'REPOS_COME', data}))
        return (
            <div className='ReposList'> 
                 <div  className='List'>
                    <h3>Repository list</h3>
                </div>
                <div  className='Repository'>
                {this.props.repository.data.repository.map( repository => <Repository key={repository.id}
                                                                               repository={repository}
                                                                               onClick={this.addFavRepos}/>)}
                </div>
            </div>
        );
    }
}


RepositoryList = connect(mapStateToProps)(RepositoryList)

class UserAdd extends Component{
    resetValue(){
        this.user.value='';
      }
    addUser(){
        gql.request(
            `query createUser($login: String!) {
                       user(login: $login) {
                                id
                                login
                                gitUserId                    
                      }
            }`,
         {login: this.userName.value})
         .then(data => store.dispatch({type: 'USER_ADD', data})) 
         this.resetValue() 
    }
    handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            this.addUser();
        }
    }
    render(){
        return (
            <div className='AddUser'>
                <input 
                    type='text'
                    className='Input'
                    placeholder='Enter Username from Git'
                    onKeyPress={this.handleKeyPress}
                    ref={c => this.userName = c} />
                <button 
                    className='ButtonAdd'
                    onClick={this.addUser.bind(this)} >
                    Add repository from Git
                </button>
            </div>
        );
    } 
}

UserAdd = connect(mapStateToProps)(UserAdd)

class FavRepository extends Component {    
    render(){
        gql.request(
        `query getAllFavRepos`)
        .then(data => store.dispatch({type: 'FAV_REPOS_COME', data}))
        return (
            <div className='ReposList'> 
                 <div  className='List'>
                    <h3>Favotite Repository list</h3>
                </div>
                <div  className='Repository'>
                {this.props.repository.data.repository.map( repository => <Repository key={repository.id}
                                                                               repository={repository}
                                                                               onClick={this.addFavRepos}/>)}
                </div>
            </div>
        );
    }
}




class MainPage extends Component {
    render (){
        return (
            <div className='MainPage'>
                <UserAdd/>
                <RepositoryList/>
            </div>
        )
    }
}




class App extends Component {
    render() {
      return (
          <Provider store={store}>
              <Router history={createHistory()} >
                  <Switch>
                      <Route path='/' component={MainPage} exact />                      
                      <Route path='/FavRepository' component={FavRepository} exact/>
                  </Switch>
              </Router>
          </Provider>
      );
    }
}
export default App;   