var https = require('https');
var http = require('http');
var parseString = require('xml2js').parseString;

/*var options = {
	host:'http://www.dictionaryapi.com',
	path:'/api/v1/references/collegiate/xml/hypocrite?key=a116f840-c6c8-488d-8d75-141cc3a7188c',
	method:'GET',
	headers:{
		'Content-Type':'application/xml'
	}
}*/

var getMeaningObject = function(word,onSuccess){
	getMeaning(word,function(xmlFromApi){
		var meaningObject = parseStringForMeaning(xmlFromApi);
		onSuccess(meaningObject);
	},function(error){
		onFailure(error)
	})
}

function getMeaning(word,onSuccess,onFailure){

	http.get('http://services.aonaware.com/DictService/DictService.asmx/DefineInDict?dictId=wn&word='+word,function(res){
		var body = '';
		res.on('data',function(chunk){
			body+=chunk;
		})
		res.on('end',function(){
			onSuccess(body)
		})
		res.on('error',function(){
			onFailure('network-error')
		})
		
	})
}

function parseStringForMeaning(xmlFromApi){
	var y;
	var pString = '';
	parseString(xmlFromApi,function(error,result){
		if(result.WordDefinition.Definitions.length == 1 && result.WordDefinition.Definitions[0] == '')return;
		var x = result.WordDefinition.Definitions[0].Definition[0].WordDefinition[0]
		y = result.WordDefinition.Definitions[0].Definition[0].WordDefinition[0]
		var n = 0;
		var firstLetterFlag = false;
		var defEndFlag = false;
		
		var regex = /[a-zA-Z]/;

	
		for(i = 0; i < y.length; i++){
			if(y[i]=='\n'){
				n++;
				firstLetterFlag = false; 
				if(n>1 && defEndFlag == false)pString+=' ';
				continue;
			}
			if(n>=1 && !defEndFlag){
				
				if(regex.test(y[i])){
					firstLetterFlag = true;
				}
				if(y[i] == ';' || y[i] == '['){
					defEndFlag = true;
				}
				if(firstLetterFlag && !defEndFlag){
					pString += y[i]
				}
			}
		}
		
	})
	return breakStringIntoTwo(pString);
	
}

function breakStringIntoTwo(string){
	var noColonFlag = true;
	var meaning = {
		partOfSpeech:'',
		definition:''
	}
	if(!string.length)return meaning;
	for(i=0;i<string.length;i++){
		if(string[i] == ':'){
			noColonFlag=false;
			continue;
		}
		if(noColonFlag)meaning.partOfSpeech+=string[i];
		if(!noColonFlag)meaning.definition+=string[i];
	}
	meaning.definition = meaning.definition.substr(1,meaning.definition.length-1)
	meaning.partOfSpeech = meaning.partOfSpeech.substr(0,meaning.partOfSpeech.length-1)
	return meaning;
}

module.exports = getMeaningObject;