const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/git';


exports.get =  function (req, res) {

    var conversionMongotoCSV = function(db, callback) {
        
        const collection = db.collection('git');
        collection.Repository.findAll({
            limit:50,
            order: [
                [Models.sort, 'sort', 'ASC']
            ]
        }).done(function(err, repos) {
          
          
          console.log({ data: repos});
         
          callback(repos);
        });
    }
}