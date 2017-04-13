
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

		this.INIT_WAIT_INTERVAL = Math.floor(1000 / 60 * 10);
		this.MAIN_THREAD_NUM = 0;

		this.AUTO_PLAY_INTERVAL = 1000;
		this.AUTO_PLAY_THREAD_NUM = 0;
		this.isPlay = false;

		this.MOVE_COMPLEMENT_INTERVAL = 30;
		this.MOVE_COMPLEMENT_THREAD_NUM = 0;
		this.COMPLAMENT_FRAME = 0;
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
			
			self.MAIN_THREAD_NUM = setInterval(self.Main, self.INIT_WAIT_INTERVAL, self);
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
		var time = this.JSON_DATA_TIMELINE[frame].t;
		this.SetTimeValue(time);

		var x = 0, y = 0;

		for(var i = 0 ; i < this.MATCHDETAIL_DATA.team.length ; ++i)
		{
			for(var j = 0 ; j < this.MATCHDETAIL_DATA.team[i].player.length ; ++j)
			{
				for(var k in this.JSON_DATA_TIMELINE[frame].playerStats)
				{
					if( this.MATCHDETAIL_DATA.team[i].player[j].participantId == this.JSON_DATA_TIMELINE[frame].playerStats[k].participantId )
					{
						x = this.JSON_DATA_TIMELINE[frame].playerStats[k].x;
						y = this.JSON_DATA_TIMELINE[frame].playerStats[k].y;
						this.MINIMAP.TranslateChampion(k-1, x, y);
						break;
					}
				}
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	CreateFrameSlideBar()
	{
		var max = this.JSON_DATA_TIMELINE.length-1;
		var min = this.JSON_DATA_TIMELINE[0].t;
		var self = this;

		$('#FrameSlideBar')[0].outerHTML = "<input type='range' id='FrameSlideBar' min='0' max='" + max + "' step='1' value='0'> <span id='time'>" + min + "</span> <input type='button' id='Play' value='Play'><br>";
		$('#FrameSlideBar')[0].onchange = function() { self.ChangeFrameSlideBar() };
		$('#Play')[0].onclick = function() { self.Play() };
		
		this.ChangeFrameSlideBar();
	}

	ChangeFrameSlideBar()
	{
		var frame = $('#FrameSlideBar')[0].value;
		this.UpdateFrame(frame);
	}

	SetTimeValue(time)
	{
		var min = Math.floor(time/60000);
		var sec = Math.floor((time%60000)/1000);

		$('#time')[0].innerHTML = ('00'+ min).slice(-2) +":" + ('00'+ sec).slice(-2);
	}

	////////////////////////////////////////////////////////////////////////////////////

	Play()
	{
		if(!this.isPlay)
		{
			this.AUTO_PLAY_THREAD_NUM = setInterval(this.AutoPlay, this.AUTO_PLAY_INTERVAL, this);
			$('#Play')[0].value = "Stop";
			this.isPlay = true;
		}
		else
		{
			clearInterval(this.AUTO_PLAY_THREAD_NUM);
			clearInterval(this.MOVE_COMPLEMENT_THREAD_NUM);
			$('#Play')[0].value = "Play";
			this.isPlay = false;
		}
	}

	AutoPlay(self)
	{
		var next_frame = $('#FrameSlideBar')[0].value;
		var max = $('#FrameSlideBar')[0].max;

		next_frame++;

		clearInterval(self.MOVE_COMPLEMENT_THREAD_NUM);

		if(next_frame < max)
		{
			$('#FrameSlideBar')[0].value = next_frame;
			$('#FrameSlideBar').trigger('change');

			if(next_frame+1 < max)
			{
				self.COMPLAMENT_FRAME = 0;
				self.MOVE_COMPLEMENT_THREAD_NUM = setInterval(self.MoveComplement, self.AUTO_PLAY_INTERVAL/self.MOVE_COMPLEMENT_INTERVAL, self, next_frame, next_frame+1);
			}
		}
		else
		{
			$('#Play').trigger('click');
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	MoveComplement(self, frame, frameNext)
	{
		var x = [0, 0], y = [0, 0];
		var diff_x = 0, diff_y = 0;

		for(var i = 0 ; i < self.MATCHDETAIL_DATA.team.length ; ++i)
		{
			for(var j = 0 ; j < self.MATCHDETAIL_DATA.team[i].player.length ; ++j)
			{
				for(var k in self.JSON_DATA_TIMELINE[frame].playerStats)
				{
					if( self.MATCHDETAIL_DATA.team[i].player[j].participantId == self.JSON_DATA_TIMELINE[frame].playerStats[k].participantId )
					{
						x[0] = self.JSON_DATA_TIMELINE[frame].playerStats[k].x;
						y[0] = self.JSON_DATA_TIMELINE[frame].playerStats[k].y;
						x[1] = self.JSON_DATA_TIMELINE[frameNext].playerStats[k].x;
						y[1] = self.JSON_DATA_TIMELINE[frameNext].playerStats[k].y;
						
						diff_x = (x[1] - x[0])/self.MOVE_COMPLEMENT_INTERVAL;
						diff_y = (y[1] - y[0])/self.MOVE_COMPLEMENT_INTERVAL;

						diff_x = diff_x * self.COMPLAMENT_FRAME;
						diff_y = diff_y * self.COMPLAMENT_FRAME;

						self.MINIMAP.TranslateChampion(k-1, x[0]+diff_x, y[0]+diff_y);
/*						
						if(k==1)
						{
							console.log("MoveComplement : "+frame+", " +frameNext);
							console.log("x : "+x[0]);
							console.log("y : "+y[0]);
						}
*/
						break;
					}
				}
			}
		}

		self.COMPLAMENT_FRAME++;
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