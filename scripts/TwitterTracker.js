function TwitterTracker()
{
	EventTarget.call(this);

	this.cName = "TwitterTracker";
	this.timerId = null; 
	this.running = false; 
	this.urls = []; 		
	this.urls_obj = {}; 
	this.hashtags 	= []; 		this.hashtags_obj = {};
	this.mentions 	= []; 		this.mentions_obj = {};
	this.twits 		= []; 		this.newTwits = [];
		

	this.keyTerm = encodeURIComponent( '' );
	this.twitter_url = 'https://search.twitter.com/search.json';
	refresh_url = '?include_entities=1&q=' + this.keyTerm;
	this.params = "&rpp=100&callback=?";

	this.resetData = function()
	{
		this.urls = [];			this.urls_obj = {};
		this.hashtags = [];		this.hashtags_obj = {};
		this.mentions = [];		this.mentions_obj = {};
		this.twits = [];
	};

	this.start = function( keywords )
	{
		if( this.running == true )
		{
			console.log( "! Twitter tracker is already running");
		}
		else
		{
			console.log( "+ Twitter tracker started" );
			this.running = true;
			this.refresh_url = '?include_entities=1&q=' + encodeURIComponent( keywords );
			this.getTwits( this );
			this.timerId = setInterval( this.getTwits, 5000 , this)
		}
	};

	this.stop = function()
	{
		if( this.running == false )
		{
			console.log( "! Twitter tracker is already stopped");
		}
		else
		{
			console.log( "- Twitter tracker stopped" );
			this.running = false;
			clearInterval(this.timerId);
		}
	};

	this.parseEntities = function( list, attribute, dictionary, targetArray )
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
	};

	this.getTwits = function( controller )
	{
		//console.log( "################## " + controller.twitter_url+controller.refresh_url+controller.params );
		var getJSON = $.getJSON( controller.twitter_url+controller.refresh_url+controller.params, function (data)
		{
			//console.log( controller.cName + " :: twits RECEIVED: " + data.results.length + ") " );
			controller.newTwits = [];
			controller.refresh_url = data.refresh_url;
			
			$.each( data.results, function(i, twit)
			{
				var date_array = twit.created_at.split(" ");
				var newTwit = {};
				newTwit.from_user = twit.from_user;
				newTwit.text = twit.text;
				newTwit.date = date_array[1] + " " + date_array[2] + " " + date_array[3] + " " + date_array[4];
				controller.newTwits.push( newTwit );

			//	console.log( "URLS: " + twit.entities.urls.length)
				if( twit.entities != null )
				{
					controller.parseEntities( twit.entities.urls, "expanded_url", controller.urls_obj, controller.urls );
					controller.parseEntities( twit.entities.hashtags, "text", controller.hashtags_obj, controller.hashtags );
					controller.parseEntities( twit.entities.user_mentions, "screen_name", controller.mentions_obj, controller.mentions );
				}
			});

			controller.fire( "twits_received")

		} );
		getJSON.error(function(msg) { console.log( "Error: "); console.log (msg); });
	};
}
TwitterTracker.prototype = new EventTarget();
TwitterTracker.prototype.constructor = TwitterTracker;

