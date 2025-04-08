// const {client} = require('./db/client');

function loadActions(input){
    const actions = JSON.parse(input);
    for (const action of actions){
        console.log(action.action)
    }
}



module.exports = {loadActions};