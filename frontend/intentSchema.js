{
  "intents":[
    {
      	"intent" : "getMeaning",
    	"slots":[
          {
      		"name":"word",
      		"type":"words"
    	  }
        ]
    },{
      	"intent" : "continueToRun",
    	"slots":[
          {
      		"name":"criticalWord",
      		"type":"agreeWords"
    	  }
        ]
    },{
      	"intent" : "exitApp"
    },{
    
      "intent":"getSpelling",
      "slots":[
      	{
      	"name":"word",
      	"type":"words"
      	}
  	   ]
  	},
    {
      "intent": "AMAZON.HelpIntent"
    },
    {
      "intent": "AMAZON.StopIntent"
    },
    {
      "intent": "AMAZON.CancelIntent"
    },
    {
      "intent": "noSuchWord"
    }
   ]
}