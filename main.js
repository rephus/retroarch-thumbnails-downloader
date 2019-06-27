var fs = require('fs');
var request = require('superagent');
var http = require('http');
var path = require('path'); 

//USage: 
// node main.js "/home/rephus/.config/retroarch/playlists/SNK - Neo Geo.lpl" "/home/rephus/thumbnails/SNK - Neo Geo/Named_Snaps"

console.log(" ARGS: " , process.argv);

var fileToRead = process.argv[2]; 
var folderToWrite = process.argv[3] + "/";
var imageType = "screenshot"; 
var platform = fileToRead.split('/').slice(-1)[0].split('.')[0] //eg: SNK - Neo Geo

var saveImage = function(imgUrl, path, callback){

    console.log("Saving image from "+imgUrl+ " in "+path);
    imgUrl = imgUrl.replace("https", "http");

    var imgSplit = imgUrl.split(".");
    var ext = imgSplit[imgSplit.length-1];
    ext = ext.split("?")[0];
    if (ext.length> 3) ext = "jpg"; //wrong ext 
    
    //request.head(imgUrl, function(err, res, body){    
        request(imgUrl).pipe(fs.createWriteStream(path+"." +ext)).on('close', function(){

           
            // convert jpg image to png 
            /*if (ext != "png") {
                Gm(path).resize(304, 224, "!").write(path+".png", function (err) {
                    if (err) console.error("Unable to convert to png "+path, err);
                    else fs.unlinkSync(path+"." +ext);
                });
            }*/
        });
    //});
  }

var secureImageSearch = function(q, hash, callback){

  var extraArgs = "&l=wt-wt&o=json&vqd="+hash+"&f=";
  var url = "https://duckduckgo.com/i.js?&q=" + q+ extraArgs;

  //console.log("Searching "+url);

   request
     .get( url )
     .buffer(true)
     .end(function(err, res ){
        if (err || !res) {
          console.error("Error response from DDG "+ err);
         callback(err);
        } else {
          try{
            //log.info("DDG image response" + JSON.stringify(res) ) ;
            var json = JSON.parse(res.text);
            if (json.results){
              callback(undefined, json.results[0].image);
            } else {
              callback("Unable to get images from DDG: no results");
            }
        } catch (e){
          var msg = "Unable to get images from DDG: "+e;
          console.error(msg, e);
          callback(msg);
        }
      }
  });
};


var downloadImage = function(name, callback) {

    //https://ajax.googleapis.com/ajax/services/search/images?safe=off&v=1.0&rsz=8&q=
    var startTime = Date.now();
    //var url = "https://duckduckgo.com/i.js?o=json&q=" + encodeURI(name);
    var url = "https://duckduckgo.com/?q="+encodeURI(name)+"&t=vivaldi&iax=1&ia=images"; 
    //console.log("Searching " + url);

    request
        .get(url)
        .end(function(err, res ){
          var body = res.text;
          //We need to filter the key on the code `vqd='327358238202064368347621428791274365820';`
          var hash = body.substr(body.indexOf('vqd=')+5).split("'")[0];
           //console.log("VQD SEARCH " , body.indexOf('vqd=')+5 , hash); 
            if (body.indexOf('vqd=') < 1 ) {
                console.error("Unable to get vdq hash from DDG ", body.indexOf('vqd=')); 
            } else {
                secureImageSearch(name, hash, callback);

            }
      });

};



var thumbnailName = function(gameName) {
    var gameNameWithoutSlash = gameName.replace(/\//g, '_').replace(/:/g, '_');
    return folderToWrite+ gameNameWithoutSlash; 

}
var downloadGame = function(gameName) {
    downloadImage(gameName+ " " +platform + " "+ imageType, function(err, imgUrl){
        if (err || !imgUrl) console.error("Unable to get img for " + gameName, err, imgUrl);
        else saveImage(imgUrl, thumbnailName(gameName), function(err, result){
            //console.log(err, result); 
        });
    });
}

// File format is JSON
fs.readFile(fileToRead, (err, data) => {  
    if (err) throw err;
    try {
        let playlist = JSON.parse(data);
        console.log("Reading JSON, with "+ playlist.items.length +  " games")
        
        playlist.items.forEach((game) => {
            const gameName = game.label
            try{
                if (fs.existsSync( thumbnailName(gameName) + ".png" ) ) {
                        console.log("Thumbnail already exists: " + gameName);
                } else {
                    downloadGame(gameName);
                }
            } catch(e){
                console.error("Unable to download screenshot for " + gameName , e);        
            }
        })
    } catch (e) {
        console.error("Unable to read JSON file ", e) 
       readOldFormat()
    }
});


function readOldFormat() {
    console.warn("Reading old format")
     // File format is old
     var lineReader = require('readline').createInterface({ input: fs.createReadStream(fileToRead)  });
     // Only load old file format if JSON fails
     var lineN = 0; 
     lineReader.on('line', function (line) {
     lineN ++; 
     if (lineN % 6 == 2) {
         console.log(lineN +': '+ line);
         try{
             if (fs.existsSync( thumbnailName(line) + ".png" ) 
                 //fs.existsSync( thumbnailName(line) + ".jpg" ) || 
                 //fs.existsSync( thumbnailName(line) + ".gif" )
                 ) {
                     console.log("Thumbnail already exists: " + line);
             } else {
                 downloadGame(line);
             }
                 
         } catch(e){
             console.error("Unable to download screenshot for " + line , e);        
         }
     }
     });
}
