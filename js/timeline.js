
////////////////////////////////////////////////////////////////////////////////////
// TimeLine Class
////////////////////////////////////////////////////////////////////////////////////

class TimeLine {

	constructor(map)
	{
		this.VERSION = "";
		this.CDN_URL = "";

		this.JSON_DATA_CHAMP_IMG = new Array();
		this.JSON_DATA_TIMELINE = {};

		this.MATCHDETAIL_DATA = {};

		this.MINIMAP = new Minimap();

		console.log(this.MINIMAP);
	}

	GetMatchData(data)
	{
		var set_data = {};

		set_data.gameVer = data.gameVersion;
		
		return set_data;
	}

	Init(href_url)
	{
		var self = this;
/*
		var data = href_url.split("?")[1];
		var text = data.split("=")[1];
		var url = decodeURIComponent(text);

		var index = url.search("#");
		url = url.substr(index);
		index = url.search("/");
		url = url.substr(index+1);
		index = url.search("/");

		var gameRealm = url.substr(0, index);

		url = url.substr(index+1);
		index = url.search('[\?]');

		var gameId = url.substr(0, index);

		url = url.substr(index+1);
		index = url.search('=');
		url = url.substr(index+1);
		index = url.search('&');

		if( index != -1 )
			url = url.substr(0, index);

		var gameHash = url;
*/
		var request = [
//			{ error_id: this.ERROR_ID_MATCH_DETAILS_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchDetails", realm:gameRealm, id:gameId, hash:gameHash },  },
//			{ error_id: this.ERROR_ID_MATCH_TIMELINE_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchTimeline", realm:gameRealm, id:gameId, hash:gameHash },  },
			{ url: './php/main.php', data: { func:"GetRealm" },  },
			{ url: './php/main.php', data: { func:"GetVersion" },  },
			{ url: './php/main.php', data: { func:"GetChampionImage", ver:this.VERSION },  },
			{ url: './data/json/wcs.json', data: {},  },
			{ url: './data/json/TRLT3-70046.json', data: {},  },
		];

		var jqXHRList = [];

		for( var i = 0, max = request.length ; i < max ; ++i )
		{
			jqXHRList.push($.ajax(
			{
				url: request[i].url,
				type: 'GET',
				dataType: 'json',
				data: request[i].data,
			}));
		}

		$.when.apply(null, jqXHRList).done(function ()
		{
			console.log("Success : Main");

			var json = [];
			var statuses = [];
			var jqXHRResultList = [];
			
			for( var i = 0, max = arguments.length ; i < max ; ++i )
			{
				var result = arguments[i];
				json.push(result[0]);
				statuses.push(result[1]);
				jqXHRResultList.push(result[3]);
			}

			console.log(json);

			var realmJson = json[0];
			var matchDetailJson = json[3];

			////////////////////////////////////////////////////////////////////////////////////////

			self.CDN_URL = realJson.realmJson.cdn;

			////////////////////////////////////////////////////////////////////////////////////////

//			self.VERSION = self.GetVersion(matchDetailData.game.gameVer, versionJson);
			self.GetMatchDetailData(matchDetailJson);

			////////////////////////////////////////////////////////////////////////////////////////

			var champ_id = [];
			for(var i = 0 ; i < self.MATCHDETAIL_DATA.team.length ; ++i)
			{
				for(var j = 0 ; j < self.MATCHDETAIL_DATA.team[i].player.length ; ++j)
				{
					champ_id.push(self.MATCHDETAIL_DATA.team[i].player[j].championId);
				}
			}

			var data = {};

			data.champ_id = champ_id;
			data.version = self.CDN_URL;
			data.version;
			
			self.MINIMAP.Init(data);
		});

		$.when.apply(null, jqXHRList).fail(function ()
		{
			console.log("Fail : Main");
			console.log(jqXHRList);

			for( var i = 0 ; i < jqXHRList.length ; ++i )
			{
				if( jqXHRList[i].statusText === "error" )
				{
					console.log(i);
				}
			}
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	
	GetVersion(ver, json)
	{
		var num = json.length;

		while(--num)
		{
			if(ver.indexOf(json[num]) !== -1)
			{
				return json[num];
			}
		}

		num = json.length;
		var str_num = ver.length;

		while(str_num)
		{
			while(--num)
			{
				if(json[num].match(ver))
					return json[num];
			}
			num = json.length;
			str_num--;
			ver = ver.substr(0, str_num);
		}
	}

	GetChampionImgName(id)
	{
		for( var i = 0 ; i < this.JSON_DATA_CHAMP_IMG.length ; ++i )
		{
			if ( id == this.JSON_DATA_CHAMP_IMG[i].id )
				return this.JSON_DATA_CHAMP_IMG[i].image.full;
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	GetMatchDetailData(json)
	{
		console.log(json);

		this.MATCHDETAIL_DATA.game = {};

		this.MATCHDETAIL_DATA.team = [];

		for(var i = 0 ; i < json.teams.length ; ++i)
		{
			this.MATCHDETAIL_DATA.team[i] = {};
			this.MATCHDETAIL_DATA.team[i].teamId = json.teams[i].teamId;
		}

		this.GetMatchDetailPlayerData(json);
	}

	GetMatchDetailPlayerData(json)
	{

		for(var i = 0 ; i < this.MATCHDETAIL_DATA.team.length ; ++i)
		{
			this.MATCHDETAIL_DATA.team[i].player = [];
			for(var j = 0 ; j < json.participants.length ; ++j)
			{
				if(json.participants[j].teamId == this.MATCHDETAIL_DATA.team[i].teamId)
				{
					this.MATCHDETAIL_DATA.team[i].player.push(json.participants[j]);
				}
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	UpdateFrame(frame)
	{
		console.log("UpdateFrame");
	}
}

var time = new TimeLine();
time.Init(location.href);