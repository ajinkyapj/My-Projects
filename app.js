const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser =require('body-parser');
const fileUpload= require('express-fileupload');
const fs= require('fs');
const ipfsAPI = require('ipfs-api');
const fs1 = require('fs')
var fileN,fileH;
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shreya",
  database: "ipfsFile"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
    });



const ipfs= new ipfsClient({host:'localhost',port:'5001',protocol:'http'});
const app=express();
const ipfs12 = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})


app.set('view engine','ejs');






app.use(express.static(__dirname+'/public'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

app.get('/',(req,res)=>{
    res.render('home');
});

app.post(
        '/upload',(req,res)=>{
        const file= req.files.file;
        const fileName = req.body.fileName;
        const filePath='files/'+fileName;
    
    
        file.mv(filePath,async (err)=>{
        if(err){        
        console.log('Error: failed to download the file');
        return res.status(500).send(err);
        }
        const fileHash= await addFile(fileName,filePath);
            console.log(fileHash);
            fileN=fileName;
            fileH=fileHash;
            
        const newData = {
                            FileName: fileN,
                            FileHash: fileHash.toString(),
                            
                        }
        
        
        let obj = {
                    table: []
                };
                obj.table.push({
                                FileName: fileN,
                                FileHash: fileHash.toString()
                });
           
            var sql = "INSERT INTO fileInfo (filename, filehash) VALUES ('"+fileN+"', '"+fileH+"')";
        con.query(sql, function (err, result) {
        if (err) throw err;
            console.log("1 record inserted");
        });
        let jsonString = JSON.stringify(obj,null,2)
        fs1.exists('./IPFSFilesData.json',function exists(){
            if (exists) {
                            console.log("yes file exists");
                            fs.writeFileSync('./IPFSFilesData.json', jsonString, err => {
                            if (err) {
                                        console.log('Error writing file', err)
                                        } else {
                                                    console.log('Successfully wrote file')
                                                }
                        })
            }
        })
        

        fs.unlink(filePath,(err)=>{
        if (err) console.log(err); 
        });
        res.render('upload',{fileName,fileHash});
            
            
            
        

        const databasename =  displayContenstFromDatabase();
           
        
        });
        });




const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    let results = [];
    for await (const result of ipfs.add({path: fileName, content: file})) {
        results.push(result);
    }
    return results[0].cid;
};


const displayContenstFromDatabase =()=>{
    let results =[];
   con.query("SELECT * FROM fileInfo", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
      return result;
       console.log(result[0].filename);
  });
};


 app.listen(3000,()=>{
    console.log('Server is listening port 3000'); 
 });














