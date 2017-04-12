
////////////////////////////////////////////////////////////////////////////////////
// TimeLine Class
////////////////////////////////////////////////////////////////////////////////////

class TimeLine {

	constructor()
	{
		this.VERSION = "";
		this.CDN_URL = "";

		this.JSON_DATA_CHAMP_IMG = new Array();
		this.JSON_DATA_TIMELINE = {};

		this.MATCHDETAIL_DATA = {};

		this.MINIMAP = new Minimap();

		this.INTERVAL = Math.floor(1000 / 60 * 10);
		this.MAIN_THREAD_NUM = 0;
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
			var versionJson = json[1];
			var matchDetailJson = json[2];
			var timelineJson = json[3];

			////////////////////////////////////////////////////////////////////////////////////////

			self.CDN_URL = realmJson.cdn;
			self.GetMatchDetailData(matchDetailJson);
			self.VERSION = self.GetVersion(self.MATCHDETAIL_DATA.game.gameVer, versionJson);
			self.JSON_DATA_TIMELINE = json[3];

			////////////////////////////////////////////////////////////////////////////////////////

			self.InitStaticData();
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

	InitStaticData()
	{
		var self = this;

		var request = [
			{ url: './php/main.php', data: { func:"GetChampionImage", ver:this.VERSION },  },
			{ url: './php/main.php', data: { func:"GetItem", ver:this.VERSION },  },
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
			console.log("Success : InitStaticData");

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

			////////////////////////////////////////////////////////////////////////////////////////

			var champImgJson = json[0];

			for(var key in champImgJson.data)
				self.JSON_DATA_CHAMP_IMG.push(champImgJson.data[key]);
			
			self.JSON_DATA_CHAMP_IMG.sort(function(a, b)
			{
					if(a.key < b.key) return -1;
					if(a.key > b.key) return 1;
					if(a.key == b.key) return 0;
			});

			////////////////////////////////////////////////////////////////////////////////////////

			var champ_id = [];
			for(var i = 0 ; i < self.MATCHDETAIL_DATA.team.length ; ++i)
			{
				for(var j = 0 ; j < self.MATCHDETAIL_DATA.team[i].player.length ; ++j)
					champ_id.push(self.MATCHDETAIL_DATA.team[i].player[j].championId);
			}

			var data = {};

			data.champId = champ_id;
			data.version = self.CDN_URL;
			data.champImgJson = self.JSON_DATA_CHAMP_IMG;
			
			var img_url = [];

			for(var i = 0 ; i < champ_id.length ; ++i)
				img_url.push( self.CDN_URL + "/" + self.VERSION + "/img/champion/" + self.GetChampionImgName(champ_id[i]) );
			
			self.MINIMAP.Init(img_url);
			
			self.MAIN_THREAD_NUM = setInterval(self.Main, self.INTERVAL, self);
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
		this.MATCHDETAIL_DATA.game.gameVer = json.gameVersion;

		////////////////////////////////////////////////////////////////////////////////////////

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
		this.MINIMAP.TranslateChampion(0, 50, 50);
	}

	////////////////////////////////////////////////////////////////////////////////////

	CreateFrameSlideBar()
	{
		var max = this.JSON_DATA_TIMELINE[this.JSON_DATA_TIMELINE.length-1].t;
		var self = this;

		$('#FrameSlideBar')[0].outerHTML = "<input type='range' id='FrameSlideBar' name='num' min='0' max='" + max + "' step='1' value='0'><span id='val'> 0</span><br>";
		$('#FrameSlideBar')[0].onchange = function() { self.ChangeFrameSlideBar(self) };
	}

	ChangeFrameSlideBar(self)
	{
		console.log($('#val'));
		$('#val')[0].innerHTML = $('#FrameSlideBar')[0].value;

		self.MINIMAP.TranslateChampion(0, 10 , 0);
	}

	////////////////////////////////////////////////////////////////////////////////////

	Main(self)
	{
		if( self.MINIMAP.IsInit() == false )
		{
			clearInterval(self.MAIN_THREAD_NUM);
			self.CreateFrameSlideBar();
		}
	}
}

var time = new TimeLine();
time.Init(location.href);