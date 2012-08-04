var timerId, running = false, 
	urls = [], 		urls_obj = {}, 
	hashtags = [], 	hashtags_obj = {}, 
	mentions = [], 	mentions_obj = {}, 
	twits = [];
	

var keyTerm = encodeURIComponent( 'data visualization' );
var twitter_url = 'https://search.twitter.com/search.json';
var refresh_url = '?include_entities=1&q=' + keyTerm;
var params = "&rpp=100&callback=?"

function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}


Array.prototype.sortOn = function(){
  var dup = this.slice();
  if(!arguments.length) return dup.sort();
  var args = Array.prototype.slice.call(arguments);
  return dup.sort(function(a,b){
    var props = args.slice();
    var prop = props.shift();
    while(a[prop] == b[prop] && props.length) prop = props.shift();
    return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? -1 : 1;
  });
};

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
		console.log( ">>> STOP <<<");
		running = false;
		clearInterval(timerId);
		$("#filterSubmit_btn").prop('value', 'START');
	}
	else
	{
		console.log( ">>> START <<<" );
		running = true;
		refresh_url = '?include_entities=1&q=' + encodeURIComponent( $("textarea#keywords_txt").val() );
		$("#filterSubmit_btn").prop('value', 'STOP');
		createElements();
		timerId = setInterval( createElements, 5000 )
	}
}

function createElements(  )
{
	$.getJSON( twitter_url+refresh_url+params, function (data)
	{
		console.log( "3. createElements RECEIVED: " + data.results.length + ") " + data.refresh_url);
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
				if( twit.entities.urls.length > 0 )
				{
					for( var i=0; i<twit.entities.urls.length; i++ )
					{
						var real_url = twit.entities.urls[i].expanded_url;
						var obj;
						if( urls_obj[real_url] == null )
						{
							obj = { url:real_url, counter:0 };
							urls_obj[real_url] = obj;
							urls.push( obj );
						}
						else
						{
							obj = urls_obj[real_url];
						}
						obj.counter++;
					}
				}
				if( twit.entities.hashtags.length > 0 )
				{
					for( var i=0; i<twit.entities.hashtags.length; i++ )
					{
						var real_hash = twit.entities.hashtags[i].text;
						var obj;
						if( hashtags_obj[real_hash] == null )
						{
							obj = { hashtag:real_hash, counter:0 };
							hashtags_obj[real_hash] = obj;
							hashtags.push( obj );
						}
						else
						{
							obj = hashtags_obj[real_hash];
						}
						obj.counter++;

					}
				}
				if( twit.entities.user_mentions.length > 0 )
				{
					for( var i=0; i<twit.entities.user_mentions.length; i++ )
					{
						var real_mention = twit.entities.user_mentions[i].screen_name;
						var obj;
						if( mentions_obj[real_mention] == null )
						{
							obj = { username:real_mention, counter:0 };
							mentions_obj[real_mention] = obj;
							mentions.push( obj );
						}
						else
						{
							obj = mentions_obj[real_mention];
						}
						obj.counter++;

					}
				}
			}
		});
		$("#twitsContainer").prepend( block );

		var sorted = urls.sortOn( "counter" );		
		var urls_out = "";
		for( var i=0; i<Math.min(50,sorted.length); i++ )
		{
			if( sorted[i].counter > 1)
				urls_out += "" + sorted[i].counter + " " + '<a href="' + sorted[i].url + '" target="_blank">' + sorted[i].url + "</a> <br/>";
		}
		$("#urlsContainer").html( "<b>URLS</b> <hr/>" + urls_out + "<br/>");


		var sorted = hashtags.sortOn( "counter" );
		var hashtags_out = "";
		for( var i=0; i<Math.min(50,sorted.length); i++ )
		{
			if( sorted[i].counter > 1)
				hashtags_out += "" + sorted[i].counter + " " + '<a href="' + sorted[i].hashtag + '" target="_blank">' + sorted[i].hashtag + "</a><br/>";
		}
		$("#hashtagsContainer").html( "<b>HASHTAGS</b> <hr/>" + hashtags_out );

		var sorted = mentions.sortOn( "counter" );
		var mentions_out = "";
		for( var i=0; i<Math.min(50,sorted.length); i++ )
		{
			if( sorted[i].counter > 1)
				mentions_out += "" + sorted[i].counter + " " + '<a href="http://twitter.com/' + sorted[i].username + '" target="_blank">' + sorted[i].username + "</a> <br/>";
		}

		$("#mentionsContainer").html( "<b>MENTIONS</b> <hr/>" + mentions_out );

	} )
	.error(function(msg) { console.log( "Error: " + msg); });

}


$(document).ready(function()
{
	console.log( "1. READY" );
	resetData();
  	//createElements(  );

});