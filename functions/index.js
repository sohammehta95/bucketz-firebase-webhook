const functions = require('firebase-functions');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const {WebhookClient} = require('dialogflow-fulfillment');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.bucketz_app = functions.https.onRequest((request, response) => {

    const agent = new WebhookClient({ request, response });
    //getAPI(response);
    var intent = agent.intent;

    //map intent names to nums
    let intentMap = new Map();
    intentMap.set('What is in my balance?', 0);
    intentMap.set('Can I afford to buy X?', 1);
    intentMap.set('how much do I have to spend in my X account?', 2);
    intentMap.set('Could you move X$ from Y bucket to Z bucket?', 3);
    intentMap.set('most expensive', 4);
    intentMap.set('Save total', 5);
    intentMap.set('How much did I spend on X this week?', 6);
    intentMap.set('How much did I spend Today?', 7);
    intentMap.set('What were my last X transactions?', 8);
    intentMap.set('How do I save X this week?', 9);
    intentMap.set('How do I save X this week? - First',10);
    intentMap.set('How do I save X this week? - second',11);
    intentMap.set('How do I save X this week? - second - bucket', 12);
    intentMap.set('How do I save X this week? - First - buckets', 13);
    intentMap.set('Show me my buckets', 14);
    intentMap.set('how much did i save on X last/this Y?', 15);
    intentMap.set('How do I save X this week? - second - bucket - yes', 16);
    intentMap.set('How do I save X this week? - First - buckets - yes', 17);
    intentMap.set('Set up user account', 18);
    intentMap.set('Link User Bank Account',19);
    intentMap.set('How much did I earn', 20);
    intentMap.set('set up my buckets',21);

    determineIntent(response, intentMap.get(intent), agent);
    
 });

 //determine which function should be called
 function determineIntent(response, id, agent) {   
    switch(id) {
        case 0:
            checkBankAcount(response, agent);
            break;
        case 1:
            canIAfford(response, agent);
            break;
        case 2: 
            leftInBucket(response, agent);
            break;
        case 3: 
            moveMoney(response,agent);
            break;
        case 4:
            mostExpensive(response, agent);
            break;
        case 5:
            getSaveTotal(response, agent);
            break;
        case 6:
            spendThisWeek(response, agent);
            break;
        case 7:
            spendTodayTotal(response, agent);
            break;
        case 8:
            lastTransactions(response, agent);
            break;
        case 9:
            saveMoney(response, agent);
            break;
        case 10:
            saveMoneyFirst(response, agent);
            break;
        case 11:
            saveMoneySecond(response, agent);
            break;
        case 12:
            cutOneBucketAsk(response, agent);
            break;
        case 13:
            cutMultipleBucketsAsk(response, agent);
            break;
        case 14:
            showMyBuckets(response, agent);
            break;
        case 15:
            howMuchSaved(response, agent);
            break;
        case 16:
            cutOneBucket(response, agent);
            break;
        case 17:
            cutMultipleBuckets(response,agent);
            break;
        case 18:
            setUpAccount(response,agent);
            break;
        case 19:
            linkUserBanKAccount(response, agent);
            break;
        case 20:
            howMuchEarned(response, agent);
            break;
        case 21:
            setUpMyBuckets(response, agent);
            break;
        default:
    }
 }
 

 //sends user to link bank account
 function linkUserBanKAccount(response, agent) {
     var fbid = agent.originalRequest['payload']['data']['sender']['id'];
     var toSend = {"fulfillmentMessages": [
                            {
                              "card": {
                                "title": "Go To Verification Page",
                                "buttons": [
                                  {
                                    "text": "lets go!",
                                    "postback": "https://www.bucketzapp.com/plaid?senderId=" + fbid
                                  }
                                ]
                              },
                              "platform": "FACEBOOK"
                            },
                            {
                              "text": {
                                "text": [
                                  ""
                                ]
                              }
                            }
                          ]}
                          response.send(toSend);
 }

 //check if user is already registered
 function setUpAccount(response, agent) {
         var XHR = new XMLHttpRequest();
  
         XHR.onreadystatechange = function() {
            if(XHR.readyState === 4) {
                if(XHR.status === 200) {
                    reply = XHR.responseText;
                    if (reply === "[]") {
                        var fbid = agent.originalRequest['payload']['data']['sender']['id'];
                        var toSend = {"fulfillmentMessages": [
                            {
                              "card": {
                                "title": "Go To Verification Page",
                                "buttons": [
                                  {
                                    "text": "lets go!",
                                    "postback": "https://www.bucketzapp.com/signup?senderId=" + fbid
                                  }
                                ]
                              },
                              "platform": "FACEBOOK"
                            },
                            {
                              "text": {
                                "text": [
                                  ""
                                ]
                              }
                            }
                          ]}
                          response.send(toSend)
                    } else {
                        var data = {'fulfillmentText':'You are already registered!'};
                        response.send(JSON.stringify(data));
                    }
                } else {
                    console.log('error')
                }
            }
        };
        
        var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
        XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
        XHR.send();

 }

 //post user to database
 function postUserToDatabase(response, agent) {
    var user_fb = agent.originalRequest['payload']['data']['sender']['id'];
    var user_name = agent.parameters['name'];
    var cash = agent.parameters['cash'];
    var amount_per = Math.floor(cash/13)

    var XHR = new XMLHttpRequest();
    
    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 201) {
                console.log('success')
                var data = {'fulfillmentText':'Ok ' + user_name + " I set up your account!"};
                response.send(JSON.stringify(data));
            } else {
                console.log('error');
                console.log(XHR.status);
            }
        }
    };
            
    var buckets = ['travel','transfer','tax','shops','service','recreation','payment','interest','healthcare', 'foodAndDrink','community', 'cashAdvance','bankFees'];
    var sendText = "name=" + user_name + "&senderId=" + user_fb;
    console.log(sendText);

    for (var i = 0; i < buckets.length; i++) {
        sendText += "&buckets." + buckets[i] + "=" + amount_per
        console.log(i + " " +sendText);
    }
    console.log(sendText);
    XHR.open("POST", "https://www.bucketzapp.com/api/users");
    XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    XHR.send(sendText);
 }

 //handle setting up account
  function askUserToCreateAccount(response, agent) {
    var data = {"fulfillmentMessages": [
        {
          "quickReplies": {
            "title": "You need to set up an account to do that!",
            "quickReplies": [
              "Set it up!"
            ]
          },
          "platform": "FACEBOOK"
        },
        {
          "text": {
            "text": [
                "You need to set up an account to do that!"
            ]
          }
        }
      ]};
    response.send(JSON.stringify(data));
  }
  
  //handle linking account
  function askUserToLinkBank(response, agent) {
    var data = {"fulfillmentMessages": [
        {
          "quickReplies": {
            "title": "You need to link your bank account to fo that!",
            "quickReplies": [
              "Link account!"
            ]
          },
          "platform": "FACEBOOK"
        },
        {
          "text": {
            "text": [
                "You need to link your bank account to fo that!"
            ]
          }
        }
      ]};
    response.send(JSON.stringify(data));
  }

 //handle cutRequest for multiple buckets
 function cutMoneyRequestMultiple(bucketCutMap, buckets, response, agent) {
    var data = {};
    data = {'fulfillmentText':'Ok, done!'};

    var XHR = new XMLHttpRequest();
    
    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
                console.log('success')
            } else {
                console.log('error')
            }
        }
    };
    
    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("PUT", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var toSend = ""
        
    for (var i = 0; i < buckets.length; i++) {
        toSend += "buckets." + buckets[i] + "=" + (Number(bucketCutMap[buckets[i]]["before"]) - Number(bucketCutMap[buckets[i]]["subtract"])).toFixed(2);
        if (i < buckets.length - 1) {
            toSend += "&";
        }
    }
    console.log("updated: " + toSend);
    XHR.send(toSend);
    response.send(JSON.stringify(data));    
 }

 //handle cutting multiple buckets
 function cutMultipleBuckets(response, agent) {
    var buckets = agent.contexts[0]['parameters']['buckets'];
    var amount = agent.contexts[0]['parameters']['unit-currency']['amount'];

    var XHR = new XMLHttpRequest();
 

 
    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                var total = 0;
                for (var i = 0; i < buckets.length; i++) {
                   total += JSON.parse(XHR.responseText)[0]['buckets'][buckets[i]];
                }

                var bucketCutMap = new Map()

                for (i = 0; i < buckets.length; i++) {
                    bucketCutMap[buckets[i]] = {"subtract":((JSON.parse(XHR.responseText)[0]['buckets'][buckets[i]]/total)*amount).toFixed(2),
                    "before":JSON.parse(XHR.responseText)[0]['buckets'][buckets[i]].toFixed(2)};

                    console.log(buckets[i] + ": " + bucketCutMap[buckets[i]]);
                }

                cutMoneyRequestMultiple(bucketCutMap, buckets, response, agent)
            } else {
                console.log('error')
            }
        }
    };
    
    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.send();
 }

 //handle cutting one bucket
 function cutOneBucket(response, agent) {
     var bucket = agent.contexts[0]['parameters']['buckets'];
     var amount = agent.contexts[0]['parameters']['unit-currency']['amount'];

     var XHR = new XMLHttpRequest();
  
 
  
    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
                if (reply === "[]") {
                    askUserToCreateAccount(response, agent);
                } else {
                    bucketCash = JSON.parse(XHR.responseText)[0]['buckets'][bucket];
                    cutMoneyRequest(bucket, amount, bucketCash, response, agent);
                }
            } else {
                console.log('error')
            }
        }
    };
    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.send();
       
 }

 //cut the bucket
 function cutMoneyRequest(bucket, amount, bucketCash, response, agent) {
    var data = {};

    if (amount > bucketCash) {
        data = {'fulfillmentText':'Sorry your ' + `${bucket}` + " bucket only has $" + `${bucketCash.toFixed(2)}` + " in it."}
    } else {
        data = {'fulfillmentText':'Ok, I just cut $' + `${amount.toFixed(2)}` + " from your " + `${bucket}` + " bucket"};

        var XHR = new XMLHttpRequest();
    
        XHR.onreadystatechange = function() {
            if(XHR.readyState === 4) {
                if(XHR.status === 200) {
                    console.log('success')
                } else {
                    console.log('error')
                }
            }
        };
            
        var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
        XHR.open("PUT", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
        XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        XHR.send("buckets." + bucket +"="+ (Number(bucketCash) - Number(amount)).toFixed(2));
    }
    response.send(JSON.stringify(data));
 }

 //handle how much saved
 function howMuchSaved(response, agent) {
    var bucket = agent.parameters['buckets'];
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];

    //TODO: get actual amount saved in bucket
    var saved = 1000;

    var data = {'fulfillmentText':'You have saved $' + `${saved}` + ' on ' + `${bucket}`+' from ' + `${start_date}` + ' to ' + `${end_date}` +'. It is X% better than (PREVIOUS DAY/WEE/MONTH).'};
    response.send(JSON.stringify(data));
    
     
 }

 //handle show me my buckets
 function showMyBuckets(response, agent) {
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }

            console.log(reply === "[]");
            console.log(reply);
            if (reply === "[]") {
                console.log("yes!");
                askUserToCreateAccount(response, agent);
            } else {
                console.log("NO");
                var buckets = JSON.parse(reply)[0]['buckets'];
                var data = {}
                data['fulfillmentMessages'] = {}
                var text = []
                for (var i = 0; i < Object.keys(buckets).length; i++) {
                    text[i] = {
                        "text": {
                        "text": [
                            `${Object.keys(buckets)[i]}`+ ": $" + `${buckets[Object.keys(buckets)[i]].toFixed(2)}` 
                        ]
                        }
                    }
                } 
                data['fulfillmentMessages'] = text;
                console.log(data)
                response.send(JSON.stringify(data)); 
            }      
        }
    }
    
    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.send();
 }

 //handle cutting multiple buckets
 function cutMultipleBucketsAsk(response, agent) {
     var buckets = agent.parameters['buckets'];
     var amount = agent.contexts[0]['parameters']['unit-currency']['amount'];

     var XHR = new XMLHttpRequest();
  
 
  
     XHR.onreadystatechange = function() {
         if(XHR.readyState === 4) {
             if(XHR.status === 200) {
                reply = XHR.responseText;
                if (reply === "[]") {
                    askUserToCreateAccount(response, agent);
                } else {
                    var total = 0;
                    for (var i = 0; i < buckets.length; i++) {
                        total += JSON.parse(XHR.responseText)[0]['buckets'][buckets[i]];
                    }

                    var bucketCutMap = new Map()

                    if (amount > total) {
                        data = {'fulfillmentText':'Sorry you only have a total of $' + `${total.toFixed(2)}` + " in these buckets combined!"};
                        response.send(JSON.stringify(data));
                    } else {
                        for (i = 0; i < buckets.length; i++) {
                            bucketCutMap[buckets[i]] = ((JSON.parse(XHR.responseText)[0]['buckets'][buckets[i]]/total)*amount).toFixed(2);
                            //console.log(buckets[i] + ": " + bucketCutMap[buckets[i]]);
                        }
                    }

                    var text = "Ok, I can cut ";
                    for (i = 0; i < buckets.length -1; i++) {
                        text += "$"+ (bucketCutMap[buckets[i]]) + " from " + `${buckets[i]}` + ", ";
                    }
                    
                    text += " and $" + (bucketCutMap[buckets[i]]) + " from " + `${buckets[i]}` + ". Is that okay?";
                
                    var data = {"fulfillmentMessages": [
                    {
                        "quickReplies": {
                        "title": text,
                        "quickReplies": [
                            "Yes",
                            "No"
                        ]
                        },
                        "platform": "FACEBOOK"
                    },
                    {
                        "text": {
                        "text": [
                            text
                        ]
                        }
                    }
                    ]};
                    response.send(JSON.stringify(data));
                }
             } else {
                 console.log('error')
             }
         }
     };
     var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
     XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
     XHR.send();
 }

 //handle cutting one bucket
 function cutOneBucketAsk(response, agent) {
     var bucket = agent.parameters['buckets'];
     //TODO: check if user has enough money in bucket to cut
     console.log(agent.contexts[0]['parameters']['unit-currency']['amount']);
     var amount = agent.contexts[0]['parameters']['unit-currency']['amount'];
     var data = {"fulfillmentMessages": [
        {
          "quickReplies": {
            "title": "Ok, I can cut $" + `${amount.toFixed(2)}` + " from your " + `${bucket}` + " bucket. Is that okay?",
            "quickReplies": [
              "Yes",
              "No"
            ]
          },
          "platform": "FACEBOOK"
        },
        {
          "text": {
            "text": [
                "Ok, I can cut $" + `${amount}` + " from your " + `${bucket}` + " bucket. Is that okay?"
            ]
          }
        }
      ]};
     response.send(JSON.stringify(data));
 }

 //handle save money second option
 function saveMoneySecond(response, agent) {
    var data = {'fulfillmentText':'Ok, which bucket do you want me to cut?'};
    response.send(JSON.stringify(data));
 }

 //handle save money first option
 function saveMoneyFirst(response, agent) {
    var data = {'fulfillmentText':'Ok, which buckets do you want me to cut?'};
    response.send(JSON.stringify(data));
 }

 //handle saving money for user
 function saveMoney(response, agent) {
    var amount = agent.parameters['unit-currency']['amount'];
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];

    
    var data = { "fulfillmentMessages": [
        {
          "quickReplies": {
            "title": "There are few options. One is to cut the budget on some of your buckets and the other one is to cut budget on one of your buckets. Do you want the first option or second?",
            "quickReplies": [
              "First",
              "Second",
              "Nevermind"
            ]
          },
          "platform": "FACEBOOK"
        },
        {
          "text": {
            "text": [
              "There are few options. One is to cut the budget on some of your buckets and the other one is to cut budget on one of your buckets. Do you want the first option or second?"
            ]
          }
        }
      ]};

      response.send(JSON.stringify(data));
}

//set up bucket sizes
function setUpMyBuckets(response, agent) {
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        var categoryMap = new Map();
        categoryMap.set('Travel',0);
        categoryMap.set('Tax',0);
        categoryMap.set('Transfer',0);
        categoryMap.set('Travel',0);
        categoryMap.set('Shops',0);
        categoryMap.set('Service',0);
        categoryMap.set('Recreation',0);
        categoryMap.set('Payment',0);
        categoryMap.set('HealthCare',0);
        categoryMap.set("Food and Drink",0);
        categoryMap.set('Community',0);
        categoryMap.set('BankFees',0);
        categoryMap.set('CashAdvance',0);
        categoryMap.set('Interest',0);
        categoryMap.set('Income',0);
        categoryMap.set('Total',0);
        
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                
                var transactions = JSON.parse(reply)[0]['transactions'];
                
            
                for (var i = 0; i < transactions.length; i ++) {
                        if (transactions[i]['amount'] < 0) {
                            categoryMap.set('Income',categoryMap.get('Income') - transactions[i]['amount']);
                        } else {
                            categoryMap.set(transactions[i]['category'][0],categoryMap.get(transactions[i]['category'][0]) + transactions[i]['amount']);
                            categoryMap.set('Total',categoryMap.get('Total') + transactions[i]['amount']);
                        }
                }
                
                updateBuckets(response,agent, categoryMap);
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
}

//update the buckets
function updateBuckets(response, agent, categoryMap) {
        var toSend ="";
        console.log("test4");
        console.log(Array.from(categoryMap.keys()));
        
        var keys = Array.from(categoryMap.keys());

        for (var i = 0; i < categoryMap.size; i++) {
            if (keys[i]==='Income' || keys[i]==='Total'){
                //do nothing
            } else {
                var percent = categoryMap.get(keys[i])/categoryMap.get('Total');
                var bucket = keys[i].toLowerCase();
                
                console.log(bucket);
                if (bucket==="food and drink") {
                    bucket = "foodAndDrink";
                } else if (bucket==="cashadvance") {
                    bucket = "cashAdvance";
                } else if (bucket==="bankfees") {
                    bucket = "bankFees";
                }
                toSend += "buckets." + bucket +"=" + (percent*categoryMap.get('Income')/3).toFixed(2) + "&";
            }
        }
        toSend = toSend.substring(0,toSend.length-1);
        console.log(toSend);

        var XHR = new XMLHttpRequest();
    
        XHR.onreadystatechange = function() {
            if(XHR.readyState === 4) {
                if(XHR.status === 200) {
                    console.log('success')
                } else {
                    console.log('error')
                }
            }
        };
            
        var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
        XHR.open("PUT", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
        XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        XHR.send(toSend);
        
         var data = {'fulfillmentText':"Ok your buckets have been set up! Income per month $" + (categoryMap.get('Income')/3).toFixed(2)}; 
         response.send(JSON.stringify(data));
    }

//handle last transactions query
function lastTransactions(response, agent) {
    var num_trans = agent.parameters['number'];

    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                
                var transactions = JSON.parse(reply)[0]['transactions'];
                
                if (num_trans > transactions.length) {
                    num_trans = transactions.length;
                }
                
                var toSend = "Your last " + `${num_trans}` + " transactions are shown below";
            
                for (var i = 0; i < num_trans; i ++) {
                    toSend +="\n\nBucket: " + transactions[i]['category'][0] + "\n Name: " + transactions[i]['name'] 
                                + "\nAmount: $" + transactions[i]['amount'].toFixed(2) 
                                + "\nDate: " + transactions[i]['date'];
                }
                
                var data = {'fulfillmentText':toSend}; 
                
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
}

//calculate earnings
function howMuchEarned(response, agent) {
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];
    start_date= start_date.substring(0,start_date.indexOf('T'));
    end_date = end_date.substring(0,end_date.indexOf('T'));
    
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                
                var transactions = JSON.parse(reply)[0]['transactions'];
                
                //add up the purchases
                var total = 0;
            
                for (var i = 0; i < transactions.length; i ++) {
                    if (transactions[i]['date'] >= start_date && transactions[i]['date'] <= end_date && transactions[i]['amount'] < 0) {
                        total -= transactions[i]['amount'];   
                    }
                }
                
                
                var data = {'fulfillmentText': "From " + start_date + " to " + end_date + ", you have earned $" + total.toFixed(2) + "."};   
        
                
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
}


//total spending today
function spendTodayTotal(response, agent) {
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];
    start_date= start_date.substring(0,start_date.indexOf('T'));
    end_date = end_date.substring(0,end_date.indexOf('T'));
    
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                
                var transactions = JSON.parse(reply)[0]['transactions'];
                
                //add up the purchases
                var total = 0;
            
                for (var i = 0; i < transactions.length; i ++) {
                    if (transactions[i]['date'] >= start_date && transactions[i]['date'] <= end_date && transactions[i]['amount'] > 0) {
                        total += transactions[i]['amount'];   
                    }
                }
                
                
                var data = {'fulfillmentText': "From " + start_date + " to " + end_date + ", you have spent $" + total.toFixed(2) + "."};   
        
                
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
} 

//handle how much did I spend this week querey
function spendThisWeek(response, agent) {
    var bucket = agent.parameters['buckets'];
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];
    start_date= start_date.substring(0,start_date.indexOf('T'));
    end_date = end_date.substring(0,end_date.indexOf('T'));

    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                
                var transactions = JSON.parse(reply)[0]['transactions'];
                
                //add up the purchases
                var total = 0;
                if (bucket ==="foodAndDrink") {
                    bucket = "food and drink";
                }
                for (var i = 0; i < transactions.length; i ++) {
                    if (transactions[i]['date'] >= start_date && transactions[i]['date'] <= end_date && 
                    transactions[i]['amount'] > 0 && transactions[i]['category'][0].toLowerCase() === bucket) {
                        total += transactions[i]['amount'];
                    } 
                }
                
                
                var data = {'fulfillmentText':"From " + start_date + " to " + end_date +", you have spent $" + total.toFixed(2) + " on your " + bucket + " bucket."};   
        
                
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
}

//handle save total request
function getSaveTotal(response, agent) {
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];
    //TODO: get save data from buckets
    var saved = 600;

    var data = {'fulfillmentText':"From " + `${start_date}` + " to " + `${end_date}` + ", you saved a total of $" + `${saved.toFixed(2)}` + "."}; 
    response.send(JSON.stringify(data));
}

//handle most expensive request
function mostExpensive(response, agent) {
    var start_date = agent.parameters['date-period']['startDate'];
    var end_date = agent.parameters['date-period']['endDate'];
    start_date= start_date.substring(0,start_date.indexOf('T'));
    end_date = end_date.substring(0,end_date.indexOf('T'));
    
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                
                console.log(JSON.parse(reply)[0]['transactions']);
                var transactions = JSON.parse(reply)[0]['transactions'];
                
                //find the most expensive purchase
                var cost = 0;
                var id = 0;
                for (var i = 0; i < transactions.length; i ++) {
                    if (transactions[i]['date'] >= start_date && transactions[i]['date'] <= end_date &&
                        parseFloat(transactions[i]['amount']) > cost) {
                        id = i;
                        cost = parseFloat(transactions[i]['amount']);
                    } 
                }
                
                //default case if no money was spent
                var data = {'fulfillmentText': "From " + `${start_date}` + " to " + `${end_date}` + ", you have not made a purchase"};   
                
                if (cost > 0) {
                    data = {'fulfillmentText': "From " + `${start_date}` + " to " + `${end_date}` + ", your most expensive purchase was for $" + cost.toFixed(2) + " on " 
                    + transactions[id]['name']};   
                }
                
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
}

//handle move money between buckets
function moveMoney(response, agent) {
    //get param values
    var fromBucket = agent.parameters['buckets'];
    var toBucket = agent.parameters['buckets1'];
    var amount = agent.parameters['unit-currency']['amount'];
    var currency = agent.parameters['unit-currency']['currency']  

    //TODO: check if there is enough money in bucket to transfer for now all buckets have $1000
    var toBucketCash;
    var fromBucketCash;

    var XHR = new XMLHttpRequest();
  
 
  
    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
                if (reply === "[]") {
                    askUserToCreateAccount(response, agent);
                } else {
                    fromBucketCash = JSON.parse(XHR.responseText)[0]['buckets'][fromBucket];
                    toBucketCash = JSON.parse(XHR.responseText)[0]['buckets'][toBucket];
                    transferMoney(fromBucket, fromBucketCash, toBucket, toBucketCash, amount, response, agent);
                }
            } else {
                console.log('error')
            }
        }
    };
    
    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.send();
}

//handle transfering money
function transferMoney(fromBucket, fromBucketCash, toBucket, toBucketCash, amount, response, agent) {
    if (fromBucketCash < amount) {
        var data = {'fulfillmentText': "You don't have enough money in your " + `${fromBucket}` + " bucket. It only has $" + `${fromBucketCash.toFixed(2)}` + " in it."}; 
    } else {
        //TODO: handle transfer amount bucket API task
        data = {'fulfillmentText':"OK! I have just  moved $" + `${amount.toFixed(2)}` + " from your " + `${fromBucket}` + " to your " + `${toBucket}` + " here are your new bucket contents...\n"+
        `${fromBucket}` + ": $" + `${(Number(fromBucketCash) - Number(amount)).toFixed(2)}` + "\n"+
        `${toBucket}` + ": $" + `${(Number(toBucketCash) + Number(amount)).toFixed(2)}`}; 

        var XHR = new XMLHttpRequest();
  
        XHR.onreadystatechange = function() {
            if(XHR.readyState === 4) {
                if(XHR.status === 200) {
                    console.log('success')
                } else {
                    console.log('error')
                }
            }
        };
        var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
        XHR.open("PUT", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
        XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        XHR.send("buckets." + fromBucket+"="+ (Number(fromBucketCash) - Number(amount)).toFixed(2) + "&buckets." + toBucket + "=" + (Number(toBucketCash) + Number(amount)).toFixed(2));
    }
    response.send(JSON.stringify(data));
}

 //handle how much is left in bucket request
 function leftInBucket(response, agent) {
    //get bucket name
    var bucket = agent.parameters['buckets'];
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToCreateAccount(response, agent);
            } else {
                var cash = JSON.parse(reply)[0]['buckets'][bucket.replace(/ /g,'_')]; 
                var data = {'fulfillmentText': "You have $" + `${cash.toFixed(2)}` + " left in your " + `${bucket}` + " bucket!" }; 
                response.send(JSON.stringify(data));
            }       
        }
    }
    
    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.send();
}


 //handle can I afford intent
 function canIAfford(response, agent) {
    //get values from the request
    var bucket = agent.parameters['buckets'];
    var cost = agent.parameters['unit-currency']['amount'];
    var currency = agent.parameters['unit-currency']['currency'];
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToCreateAccount(response, agent);
            } else {
                var cash = JSON.parse(reply)[0]["buckets"][bucket.replace(/ /g,'_')]; 
                var enoughCash = (cash - cost > 0);

                if (enoughCash) {
                    var data = {'fulfillmentText': "Sure you have $" + `${cash.toFixed(2)}` + " in your " + `${bucket}` + 
                    " bucket! after this purchase  of $" + `${cost.toFixed(2)}` + " you will still have $" + `${(cash - cost).toFixed(2)}` + "!"}; 
                } else {
                    data = {'fulfillmentText': "No sorry, you have $" + `${cash.toFixed(2)}` + " in your " + `${bucket}` + 
                    " bucket. You need $" + `${(cost - cash).toFixed(2)}` + " more " + `${currency}` + " to make this purchase."};
                }
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/api/users/fbid/" + fb_id);
    XHR.send();
}

//handle check balance
 function checkBankAcount(response, agent) {
     //TODO: actually get data
     console.log('sender_2: ' + agent.originalRequest['payload']['data']['sender']['id'])
     console.log('recipient_2: ' + agent.originalRequest['payload']['data']['recipient']['id'])
     console.log('message_2: ' + agent.originalRequest['payload']['data']['message']['text'])
    
    var XHR = new XMLHttpRequest();
    XHR.responseType = 'text';
    var reply ="";

    XHR.onreadystatechange = function() {
        if(XHR.readyState === 4) {
            if(XHR.status === 200) {
                reply = XHR.responseText;
            } else {
                reply = "there was an error";
            }
            if (reply === "[]") {
                askUserToLinkBank(response, agent);
            } else {
                console.log("new3");
                console.log(JSON.parse(reply)[0]);
                var amount = JSON.parse(reply)[0]['accounts'][0]['balances']['available'];
                var data = {'fulfillmentText': 'You have $' + amount.toFixed(2) + ' in your account!'}; 
                response.send(JSON.stringify(data));
            }  
        }
    }

    var fb_id = agent.originalRequest['payload']['data']['sender']['id'];
    XHR.open("GET", "https://www.bucketzapp.com/plaid/sender/" + fb_id);
    XHR.send();
    
 }

