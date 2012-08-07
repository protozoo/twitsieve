


var twitterFeed;

function filterSubmitClicked()
{
	if( twitterFeed.running == true )
	{
		twitterFeed.stop();
		$("#filterSubmit_btn").prop('value', 'START');
	}
	else
	{
		twitterFeed.start( $("textarea#keywords_txt").val() );
		$("#filterSubmit_btn").prop('value', 'STOP');
	}
};

function resetData()
{
	twitterFeed.resetData();
	$("#twitsContainer").html( "" );
	$("#urlsContainer").html( "<b>URLS</b> <hr/>");
	$("#hashtagsContainer").html( "<b>HASHTAGS</b> <hr/>" );
	$("#mentionsContainer").html( "<b>MENTIONS</b> <hr/>" );

}

$(document).ready(function()
{
	twitterFeed = new TwitterTracker ();
	twitterFeed.addListener( "twits_received", function()
	{
		console.log( "New twits received:" + twitterFeed.newTwits.length );

		var block = "";
		var twits = twitterFeed.newTwits;
		for( var i=0; i<twits.length; i++ )
		{
			var twit = twits[i];
			var out = "<b>" + twit.from_user + "</b> <font size='-2' color='#666666'>(" + twit.date + ")</font><br/> ";		
			out += replaceURLWithHTMLLinks( twit.text ) + "<hr/>";
			block += out;
		}
		$("#twitsContainer").prepend( block );

		printEntities( twitterFeed.urls, "expanded_url", "#urlsContainer", "", "URLS" );
		printEntities( twitterFeed.hashtags, "text", "#hashtagsContainer", null, "HASHTAGS" );
		printEntities( twitterFeed.mentions, "screen_name", "#mentionsContainer", "http://twitter.com/", "MENTIONS" );
	});
	twitterFeed.resetData();
});


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

