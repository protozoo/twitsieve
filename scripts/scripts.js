var timerId, running = false, 
	urls 		= [], 		urls_obj = {}, 
	hashtags 	= [], 	hashtags_obj = {}, 
	mentions 	= [], 	mentions_obj = {}, 
	twits 		= [];
	

var keyTerm = encodeURIComponent( 'data visualization' );
var twitter_url = 'https://search.twitter.com/search.json';
var refresh_url = '?include_entities=1&q=' + keyTerm;
var params = "&rpp=100&callback=?"


function resetData()
{
	urls = [];			urls_obj = {};
	hashtags = [];		hashtags_obj = {};
	mentions = [];		mentions_obj = {};
	twits = [];
	$("#twitsContainer").html( "" );
	$("#urlsContainer").html( "<b>URLS</b> <hr/>");
	$("#hashtagsContainer").html( "<b>HASHTAGS</b> <hr/>" );
	$("#mentionsContainer").html( "<b>MENTIONS</b> <hr/>" );
}

function filterSubmitClicked()
{
	if( running == true )
	{
		console.log( "- Twitter tracker stopped");
		running = false;
		clearInterval(timerId);
		$("#filterSubmit_btn").prop('value', 'START');
	}
	else
	{
		console.log( "+ Twitter tracker started" );
		running = true;
		refresh_url = '?include_entities=1&q=' + encodeURIComponent( $("textarea#keywords_txt").val() );
		$("#filterSubmit_btn").prop('value', 'STOP');
		getTwits();
		timerId = setInterval( getTwits, 5000 )
	}
}

function parseEntities( list, attribute, dictionary, targetArray )
{
	if( list.length > 0 )
	{
		for( var i=0; i<list.length; i++ )
		{
			var itemValue = list[i][attribute];
			var obj = {};
			if( dictionary[itemValue] == null )
			{
				obj[attribute] = itemValue;
				obj.counter = 0;
				dictionary[itemValue] = obj;
				targetArray.push( obj );
			}
			else
			{
				obj = dictionary[itemValue];
			}
			obj.counter++;
		}
	}
}

function getTwits(  )
{
	$.getJSON( twitter_url+refresh_url+params, function (data)
	{
		console.log( "twits RECEIVED: " + data.results.length + ") " );
		refresh_url = data.refresh_url;
		var block = "";
		$.each( data.results, function(i, twit)
		{
			var date_array = twit.created_at.split(" ");
			var out = "<b>" + twit.from_user + "</b> <font size='-2' color='#666666'>(" + date_array[1] + " " + date_array[2] + " " + date_array[3] + " " + date_array[4] + ")</font><br/> ";
			if( twit.metadata.recent_retweets != null ){
				out += "<font color='#00CC44'>R</font> ";
			}
			out += replaceURLWithHTMLLinks( twit.text ) + "<hr/>";
			block += out;

		//	console.log( "URLS: " + twit.entities.urls.length)
			if( twit.entities != null )
			{
				parseEntities( twit.entities.urls, "expanded_url", urls_obj, urls );
				parseEntities( twit.entities.hashtags, "text", hashtags_obj, hashtags );
				parseEntities( twit.entities.user_mentions, "screen_name", mentions_obj, mentions );
			}
		});
		$("#twitsContainer").prepend( block );

		printEntities( urls, "expanded_url", "#urlsContainer", "", "URLS" );
		printEntities( hashtags, "text", "#hashtagsContainer", null, "HASHTAGS" );
		printEntities( mentions, "screen_name", "#mentionsContainer", "http://twitter.com/", "MENTIONS" );


	} )
	.error(function(msg) { console.log( "Error: " + msg); });
}

function printEntities( list, attribute, container, link, title )
{
	var sorted = list.sortOn( "counter" );		
	var html_out = "";
	for( var i=0; i<Math.min(50,sorted.length); i++ )
	{
		if( sorted[i].counter > 0)
		{
			html_out += "" + sorted[i].counter;
			if( link != null ){
				html_out += " " + '<a href="' + link + sorted[i][attribute] + '" target="_blank">' + sorted[i][attribute] + "</a> <br/>";
			}else{
				html_out += " " + sorted[i][attribute] + "<br/>";
			}
		}
	}
	$( container ).html( "<b>" + title + "</b> <hr/>" + html_out + "<br/>");

}


$(document).ready(function()
{
	console.log( "1. READY" );
	resetData();
});

