//Chubot
var request = require('request');
var parse = require('parse-link-header');
var git_url = "https://api.github.com/gists";
var gistToken = process.env.GIST_TOKEN;

//Set up environment and get slack tokens
if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify SLACK_TOKEN in environment');
    process.exit(1);
}

//get BotKit to spawn chubot
var Botkit = require('botkit');
var controller = Botkit.slackbot({
 debug: false
});
var bot = controller.spawn({
  token: process.env.SLACK_TOKEN
});

//Imports for PostgreSQL
var pg = require('pg');
pg.defaults.ssl = true;

//Storing username & connection string in a variable
var user_name = "";
var connection_string = process.env.DB_URL;

//Arrays holding supported data types by chubot
var a_type = [ 'github' , 'wordpress' ];
var p_type = ['token','url','username'];

// Start Slack RTM
bot.startRTM(function(err,bot,payload) {

});

//Chubot logic

// Basic Conversation
controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
    var my_username="";
    getPersonName(function(name_callback)
    {
        //Getting user's name from DB 
        my_username = name_callback; 
        user_name = name_callback;
        if(my_username === "noname" || my_username === "namenull") {
            //Start Conversation
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('Hi!');
                    convo.ask('What is your name?', function(response, convo) {
                        convo.ask('Is your name `' + response.text + '` ?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'name'}); 

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            user_name = convo.extractResponse('name').toLowerCase();
                            my_username = convo.extractResponse('name').toLowerCase();
                            //set the new name into database
                            if(my_username === 'undefined' || my_username === 'noname' || my_username === 'null' ){
                                my_username = "";
                                bot.reply(message, 'You have tried to set an invalid name. Please try again!');
                            }  
                            else
                            {
                                for(i in a_type)
                                {
                                   for(j in p_type)
                                    {
                                        chu_initialize(function(callback){}, message,a_type[i],p_type[j],my_username);
                                    }
                                }
                                bot.reply(message, 'Hi ' + my_username.toUpperCase() + ' ! Nice to know you.');
                            } 
                        } else {
                            bot.reply(message, 'Fine.');
                        }
                    });
                }
            });
        }
        else {
            bot.reply(message, 'Hi ' + my_username.toString().toUpperCase() + ' !');
        }        
    }, message);    
 
});

controller.hears(['set name:(.*)', 'set my name as (.*)', 'call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1].toLowerCase();
    var my_name="";
    getPersonName(function(name_callback)
    {
        //Check if theres a name already in database for current user
        my_name = name_callback; 
        //user_name = name_callback;
        if(my_name === "noname") {
            //Insert new name into database
            if(name === 'undefined' || name === 'noname' || name === 'null' ){
                name = "";
                bot.reply(message, 'You have tried to set an invalid name. Please try again!');
            }  
            else
            {
                for(i in a_type)
                {
                   for(j in p_type)
                    {
                        chu_initialize(function(callback){}, message,a_type[i],p_type[j],name);
                    }
                }
                bot.reply(message, 'Great. I will call you ' + name + ' from now!');
            }
        }
        else {
            //Update name in database
            if(name === 'undefined' || name === 'noname' || name === 'null' ){
                name = "";
                bot.reply(message, 'You have tried to set an invalid name. Please try again!');
            } 
            else
            {
                var query_text = "UPDATE chubot_user_data SET person_name = '"+name+"' WHERE username = '"+message.user+"';";  
                var client = new pg.Client(connection_string);
                client.connect(function (err) {
                    if (err) throw err;
                    client.query(query_text.toString(), function (err, result) {
                        if (err) {
                            throw err;
                        } 
                        else {
                            bot.reply(message, 'Done. I will call you ' + name + ' from now!');
                            user_name = name;
                        }
                        client.end(function (err) {
                            if (err) throw err;
                        });
                    });
                }); 
            }
        }        
    }, message);  
});   

controller.hears(['who am i', 'what is my name'], 'direct_message,direct_mention,mention', function(bot, message) {
    var get_my_name="";
    getPersonName(function(name_callback)
    {
        //Getting user's name from DB 
        get_my_name = name_callback; 
        user_name = name_callback;
        if(get_my_name === "noname" || get_my_name === "namenull") {
            get_my_name = "I dont know your name! Please set your name first. \n *Tip:* You can say something like *Call me Chu* [or] *set my name as Chu* [or] *my name is Chu*.";
            bot.reply(message, get_my_name.toString());
        }
        else {
            bot.reply(message, 'You are ' + get_my_name.toString().toUpperCase() + ' !');
        }        
    }, message);
});

controller.hears(['how are you'],['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,"Splendid. Thanks for asking!");
});

controller.hears(['thanks'], 'direct_message,direct_mention,mention', function(bot, message) {
           bot.reply(message, 'Always a pleasure !');
});

// USECASE 1 - TOKENS, URL and USERNAME

//SETTING TOKENS, URL and USERNAME

controller.hears(['set (.*) (.*) as (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var message_id = message.match[1].toLowerCase();
    var message_type = message.match[2].toLowerCase();
    var message_content = message.match[3];

    if (message_id == "wp") {
        message_id = "wordpress";
    }
    if (message_id == "git") {
        message_id = "github";
    }
    set_something(function(reply_text)
        {
            bot.reply(message,reply_text);
        },message, message_id, message_type, message_content);
});

//GETTING TOKENS, URL and USERNAME

controller.hears(['what is my (.*) (.*)', 'give me my (.*) (.*)', 'get me my (.*) (.*)', 'get my (.*) (.*)', 'fetch my (.*) (.*)', 'get (.*) (.*)', 'fetch (.*) (.*)', 'whats my (.*) (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var message_id = message.match[1].toLowerCase();
    var message_type = message.match[2].toLowerCase();

    if (message_type == "token?" || message_type == "url?" || message_type == "username?") {
        message_type = message_type.substring(0, message_type.length - 1);
    }
    if (message_id == "wp") {
        message_id = "wordpress";
    }
    if (message_id == "git") {
        message_id = "github";
    }
    get_something(function(reply_text)
        {
            bot.reply(message,reply_text);
        },message, message_id, message_type);
  });

//Functions called by USECASE 1 and Basic Conversation

function chu_initialize(callback,message,atype,ptype,name)
{
    var query_text = "INSERT INTO chubot_user_data(username, person_name, api_type, parameter_type, parameter_value) VALUES('"+message.user+"', '"+name+"', '"+atype+"', '"+ptype+"', '');";  
    console.log(query_text); 
    var client = new pg.Client(connection_string);
    client.connect(function (err) {
        if (err) throw err;
        client.query(query_text.toString(), function (err, result) {
            if (err) {
                throw err;
            } 
            else {
                callback();
            }
            client.end(function (err) {
                if (err) throw err;
            });
        });
    });
}

function get_something(callback,message,id,type)
{
    var reply_text = "null";
    if(id != "github" && id != "wordpress")
    {
        reply_text = "I dont support " + id + " yet!";
        callback(reply_text);
    }
    else if (type != "username" && type != "token" && type != "url")
    {
        reply_text = "I dont understand what you mean by " + type + "!\n I can only get/retrieve tokens, usernames and urls..";
        callback(reply_text);
    }
    else
    {
    var query_text = "SELECT parameter_value FROM chubot_user_data WHERE username='"+message.user+"' AND api_type='"+id+"' AND parameter_type='"+type+"';";  
    var client = new pg.Client(connection_string);
    client.connect(function (err) {
            if (err) throw err;
                client.query(query_text.toString(), function (err, result) {
                        if (err) {
                            throw err;
                        } 
                        else {

                            if(result.rowCount == 0)
                                {
                                    reply_text = "You have not set a "+id+" API "+type+" yet!";
                                }
                            else
                                {
                                    reply_text = "Your "+id+" API "+type+" is "+result.rows[0].parameter_value.toString();
                                }
                            }
                        client.end(function (err) {
                                if (err) throw err;
                            });
                        if (reply_text == "null")
                            {
                                reply_text = "I didnt get that! What was it again?";
                                callback(reply_text);
                            }
                         else
                            {
                                callback(reply_text);
                            }
                });
        });
    }    
}

function set_something(callback,message,id,type,value,chooser_main)
{
    var chooser;
    var reply_text = "null";
    if(id != "github" && id != "wordpress")
        {
            reply_text = "I dont support " + id + " yet!";
            callback(reply_text);
        }
        else if (type != "username" && type != "token" && type != "url")
        {
            reply_text = "I cannot set " + type + "!\n I can only set tokens, usernames and urls..";
            callback(reply_text);
        }
        else if (value == "null" && value == "")
        {
            reply_text = "null is not a valid "+id+" token";
            callback(reply_text);
        }
        else
        {
            value = value.replace("<","");
            value = value.replace(">","");
            getCount(function(count_callback)
            {
                chooser = count_callback;
                if(chooser > 0) {
                    var query_text = "UPDATE chubot_user_data SET parameter_value = '"+value+"' WHERE username = '"+message.user+"' AND api_type = '"+id+"' AND parameter_type = '"+type+"';";  
                    var client = new pg.Client(connection_string);
                    client.connect(function (err) {
                        if (err) throw err;
                        client.query(query_text.toString(), function (err, result) {
                            if (err) {
                                throw err;
                            } 
                            else {
                                reply_text = "Done! I have saved your "+ id +" API " + type + " as " + value;
                            }
                            client.end(function (err) {
                                if (err) throw err;
                            });
                            if (reply_text == "null")
                              {
                                reply_text = "I didnt get that! What was it again?";
                                callback(reply_text);
                              }
                              else
                              {
                                callback(reply_text);
                              }
                        });
                    });
                }
                else if(chooser == 0){
                    if(user_name === 'undefined' || user_name === 'noname'){
                        user_name = "";
                    }        
                    var query_text = "INSERT INTO chubot_user_data(username, person_name, api_type, parameter_type, parameter_value) VALUES('"+message.user+"', '"+user_name+"', '"+id+"', '"+type+"', '"+value+"');";  
                    var client = new pg.Client(connection_string);
                    client.connect(function (err) {
                        if (err) throw err;
                        client.query(query_text.toString(), function (err, result) {
                            if (err) {
                                throw err;
                            } 
                            else {
                                reply_text = "Done! I have saved your "+ id +" API " + type + " as " + value;
                            }
                            client.end(function (err) {
                                if (err) throw err;
                            });
                            if (reply_text == "null")
                              {
                                reply_text = "I didnt get that! What was it again?";
                                callback(reply_text);
                              }
                              else
                              {
                                callback(reply_text);
                              }
                        });
                    });
                }
            },message, id, type, value);   
        }  
}

function getCount(callback,message,id,type,value)
{
    var row_count;
    var query_text = "SELECT COUNT(*) FROM chubot_user_data WHERE username='"+message.user+"' AND api_type='"+id+"' AND parameter_type='"+type+"';";  
    var client = new pg.Client(connection_string);
    client.connect(function (err) {
            if (err) throw err;
                client.query(query_text.toString(), function (err, result) {
                if (err) {
                    throw err;
                } 
                else {
                    row_count = result.rows[0].count;
                    callback(row_count);
                    }
                client.end(function (err) {
                        if (err) throw err;
                    });
            });
        });
}

function getPersonName(callback,message)
{
    var get_name = "";
    var query_text = "SELECT COUNT(*) FROM chubot_user_data WHERE username='"+message.user+"';";  
    var client = new pg.Client(connection_string);
    client.connect(function (err) {
            if (err) throw err;
        client.query(query_text.toString(), function (err, result) {
            if (err) {
                throw err;
            } 
            else {
                if(result.rows[0].count != 0) {
                var inner_query_text = "SELECT person_name FROM chubot_user_data WHERE username='"+message.user+"' ORDER BY person_name DESC;"; 
                var client2 = new pg.Client(connection_string);
                client2.connect(function (err) {
                        if (err) throw err;
                            client2.query(inner_query_text.toString(), function (err, result) {
                                    if (err) {
                                        throw err;
                                    } 
                                    else {
                                        get_name = result.rows[0].person_name.toString();
                                        if(get_name === "")
                                        {
                                            get_name = "namenull";
                                            callback(get_name);
                                        }
                                        else
                                        {
                                            callback(get_name);
                                        }  
                                    }
                        client2.end(function (err) {
                            if (err) throw err;
                            });
                        });
                    });   
                }
                else {
                    get_name = "noname";
                    callback(get_name);
                }
                        
                }
            client.end(function (err) {
                    if (err) throw err;
            });
         });
    });     
}

// USECASE 2 - RETURNING REST API CODE SNIPPET

controller.hears(['GET (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var command = message.match[1];
    populateUserValues(message.user,function(value){
      retrieveGETSnippet(command, value,function(returnValue){
        bot.reply(message, returnValue)});
    });
});

controller.hears(['POST (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
   var command = message.match[1];
  populateUserValues(message.user,function(value){
    retrievePOSTSnippet(command, value, function(returnValue){
      bot.reply(message, returnValue)});
  });
});
              
function populateUserValues(userId, callback){
    var userData = [];
  var queryString = 'select \"api_type\" as apitype,\"parameter_type\" as paramtype ,\"parameter_value\" as paramvalue from chubot_user_data where \"username\" = \''+ userId + '\'';
  var client = new pg.Client(connection_string);
  client.connect(function(err) {
    if (err) 
      throw err;
    client.query(queryString, function(err, result) {
      if(err){
        console.log(err);
        return onError(err);
      }
      console.log(result);
      if(result.rowCount != 0){
        var i;
        for(i = 0 ; i < result.rowCount; i++){
          userData.push(result.rows[i].apitype+'_'+result.rows[i].paramtype+'='+result.rows[i].paramvalue);
        }
        console.log(userData);
        callback(userData);
      }
      else{
        callback(userData);
      }
      client.end(function (err) {
      if (err) 
        throw err;
      });
    });
  });
  
}

function retrieveGETSnippet(command, userData,callback){
    var outputSnippet;   
    var replyMsg;
    command  = command.split("&amp;").join("&");
    command  = command.split("%20").join(" ");
    var comm;
    var qIndex = command.indexOf('?');
    if( qIndex != -1){
      comm = command.substr(0,qIndex);
    }
    else{
      comm = command;
    }
    console.log(comm);
    var queryString = 'select code_snippet as snippet from chubot_code_snippet where \"request_URL\" = \''+comm+'\' and \"request_type\" =\'GET\'';
    console.log(queryString);
    var client = new pg.Client(connection_string);
    client.connect(function(err) {
      if (err) 
        throw err;
      client.query(queryString, function(err, result) {
        if(err){
          console.log(err);
          return onError(err);
        }
        console.log(result);
        if(result.rowCount != 0){
          outputSnippet = result.rows[0].snippet;
          if( qIndex != -1){
            var args = command.slice(qIndex+1);
            var argsArray = args.split('&');
            var i;
            
            //Below code for replacing the user inputted parameters in the snippet
            for(i = 0 ; i < argsArray.length; i++){
              var arrayElement = argsArray[i].split('=');
              if(outputSnippet.indexOf(arrayElement[0]) != -1 && arrayElement[1].length > 0){
                outputSnippet = outputSnippet.replace(arrayElement[0]+"_value",arrayElement[1])
              }
            }
          }
          
          //Below code for replacing the user's token/URL/name in the snippet
          for(i = 0 ; i < userData.length; i++){
            var arrayElement = userData[i].split('=');
            if(outputSnippet.indexOf(arrayElement[0]) != -1 && arrayElement[1].length > 0){
              outputSnippet = outputSnippet.replace(arrayElement[0]+"_value",arrayElement[1])
            }
          }
          outputSnippet = outputSnippet.split("|").join("\n");
          outputSnippet = outputSnippet.split("`").join("\t");
          createGist(outputSnippet, function(retValue){
            replyMsg = 'Here you go..... \n' + retValue+'\n*Preview*: \n \t' + outputSnippet.substr(0,outputSnippet.split("\n", 4).join("\n").length) + '\n \t\t\t...'; 
            callback(replyMsg);
          });
        }
        else{
          replyMsg ='Sorry I dont understand what you mean by '+comm+ ' !';
          callback(replyMsg);
        }
        client.end(function (err) {
        if (err) 
          throw err;
        });
      });
    });
}

function retrievePOSTSnippet(command,userData, callback){
    var outputSnippet;
    command  = command.split("&amp;").join("&");
    var comm;
    var qIndex = command.indexOf('?');
    if( qIndex != -1){
      comm = command.substr(0,qIndex);
    }
    else{
      comm = command;
    }
    console.log(comm);
    var queryString = 'select code_snippet as snippet from chubot_code_snippet where \"request_URL\" = \''+comm+'\' and \"request_type\" =\'POST\'';
    console.log(queryString);
    var client = new pg.Client(connection_string);
    client.connect(function(err) {
      if (err) 
        throw err;
      client.query(queryString, function(err, result) {
        if(err) 
          return onError(err);
        console.log(result);
        if(result.rowCount != 0){
          outputSnippet = result.rows[0].snippet;
          if( qIndex != -1){
            var args = command.slice(qIndex+1);
            var argsArray = args.split('&');
            var i;
            //Below code for replacing the user inputted parameters in the snippet
            for(i = 0 ; i < argsArray.length; i++){
              var arrayElement = argsArray[i].split('=');
              if(outputSnippet.indexOf(arrayElement[0]) != -1){
                outputSnippet = outputSnippet.replace(arrayElement[0]+"_value",arrayElement[1])
              }
            }       
          }
          
          //Below code for replacing the user's token/URL/name in the snippet
          for(i = 0 ; i < userData.length; i++){
            var arrayElement = userData[i].split('=');
            if(outputSnippet.indexOf(arrayElement[0]) != -1 && arrayElement[1].length > 0){
              outputSnippet = outputSnippet.replace(arrayElement[0]+"_value",arrayElement[1])
            }
          }
          
          outputSnippet = outputSnippet.split("|").join("\n");
          outputSnippet = outputSnippet.split("`").join("\t");
          createGist(outputSnippet, function(retValue){
            replyMsg = 'Here you go..... \n' + retValue+'\n*Preview*: \n \t' + outputSnippet.substr(0,outputSnippet.split("\n", 4).join("\n").length) + '\n \t\t\t...'; 
            callback(replyMsg);
          });
        }
        else{
          replyMsg ='Sorry I dont understand what you mean by '+comm+ ' !';
          callback(replyMsg);
        }
        client.end(function (err) {
        if (err) 
          throw err;
        });
      });
    });
}

// USECASE 3 - DEFINITIONS OF REST API REQUEST: PARAMETERS 

controller.hears(['define (.*)', 'define:(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var parameter = message.match[1];   
    var query_text = "SELECT definition as def FROM chubot_definitions WHERE name='"+parameter+"';"; 
    var client = new pg.Client(connection_string);
    client.connect(function (err) {
        if (err) throw err;
        client.query(query_text.toString(), function (err, result) {
            if (err) {
                throw err;
            } 
            else{
                if(result.rowCount != 0){
                    reply_text = result.rows[0].def;
                    bot.reply(message,reply_text);
                }
                else{
                    bot.reply(message,"Sorry! I dont know the definition of " + parameter + ", at this time !");
                }
            }
            client.end(function (err) {
                if (err) throw err;
            });
        });
    });
  });

function createGist(codeSnippet, callback)
{
  var gistURL;
  var options = {
    url: git_url,
    method: 'POST',
    headers: {
      "content-type": "application/json",
      "User-Agent": "chubot2016",
      "Authorization": gistToken
    },
    json:   {
      "description": "Chugist",
      "public": true,
      "files": {
        "chugist.txt": {
          "content": codeSnippet
        }
      }
    }
  };

  request(options, function (error, response, body) {
    var obj = JSON.parse(JSON.stringify(body));
    console.log(obj.html_url);
    gistURL = obj.html_url;
    callback(gistURL);
  });
}
