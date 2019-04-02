var http = require('http');
var url = require('url');
const request = require('request');

const express = require('express')
var mysql = require('mysql');
const app = express()

/**
 * connection to database
 */
var con = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "password",
  database: "database"
});

//function to fetch all rows rom database
async function fetcher()
{
	con.query("SELECT * FROM cache_krypto where service_cache LIKE '%pricemultifull%' ",async  function (err, result, fields)
	{
		if (err) throw err;
		for(x=0;x<result.length;x++)
		{
			if(x>0 && x%50 == 0)
			{
				await resolveAfter1Second();
				console.log('50 rows processed');
			}

			//calling function to fetch data from API
			fetch_data(result[x].service_cache,result[x].id_cache);
		}
	});	

	await resolveAfter1Second();
	fetcher();

}

/**
 * 
 * @param {*} url -> api url to be called
 * @param {*} r_id ->row id from table
 * 
 * update the row in table if data returned
 */
function fetch_data(url,r_id)
{
	var url = url;
	var row_id = r_id;

	request(url, (err, res, body) => 
	{
	  	if (err) 
	  	{ 
	  		console.log(err);
	  	}

	  	if(res)
	  	{		  		
	  		var time = Math.floor(new Date() / 1000)+10;
	  		var content = res.body;
	  		if(content != '{"Response":"Error","Message":"Rate limit excedeed!","Type":99,"Aggregated":false,"Data":[]}')
	  		{
	  			con.query("UPDATE cache_krypto SET value_cache = '"+content+"',last_update_cache="+time+" where id_cache = '"+row_id+"' ", function (err, result, fields){
						if (err) { 
							console.log(err);
						}
					})
	  		}
	  	}
	});
}


var resolveAfter10Seconds = function() 
{
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(20);
    }, 10000);
  });
};

var resolveAfter1Second = function() 
{
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(20);
    }, 1000);
  });
};

fetcher();

app.listen(8080);


