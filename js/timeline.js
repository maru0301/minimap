
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
		this.JSON_DATA_TIMELINE_EVENT = {};
		this.JSON_DATA_ITEM = {};

		this.MATCHDETAIL_DATA = {};
		this.TIMELINE_EVENT_DATA = [];

		/////////////////////////////////

		this.MINIMAP = new Minimap();

		/////////////////////////////////

		this.INIT_WAIT_INTERVAL = Math.floor(1000 / 60 * 10);
		this.MAIN_THREAD_NUM = 0;

		this.AUTO_PLAY_INTERVAL = 1000;
		this.AUTO_PLAY_THREAD_NUM = 0;
		this.isPlay = false;

		this.MOVE_COMPLEMENT_INTERVAL = 30;
		this.MOVE_COMPLEMENT_THREAD_NUM = 0;
		this.COMPLAMENT_FRAME = 0;

		/////////////////////////////////

		this.MONSTER_POS = [
			[9900, 4400],	// dragon, elder
			[5050, 10700],	// rift, baron
		];

		this.isDragon = false;
		this.isBaron = false;

		this.MONSTER_START_TIME = [
			(2*60+30), // dragon
			(35*60), // elder
			(10*60), // rift
			(20*60), // baron
		];
		this.MONSTER_RESPAWN_TIME = [
			(6*60), // dragon
			(10*60), // elder
			-1, // rift
			(7*60), // baron
		];
		this.RIFTHERALD_END_TIME = (19*60)+45;

		/////////////////////////////////

		this.OBJECT_TOWER_POS = [
			// blue
			[
				// top
				[
					[981, 10441],
					[0, 0],
					[0, 0],
				],
				// mid
				[
					[5846, 6396], // outer
					[5048, 4812], // inner
					[3651, 3696], // inhibi tower
					[1748, 2270], // nexus tower(top)
					[2177, 1807], // nexus tower(bot)
				],
				// bot
				[
					[10504, 1029],
					[0, 0],
					[0, 0],
				],
			],
			// red
			[
				// top
				[
					[4318, 13875],
					[0, 0],
				],
				// mid
				[
					[8955, 8510],
					[9767, 10113],
					[0, 0],
				],
				// bot
				[
					[13866, 4505],
					[0, 0],
				],
			]
		];

		this.OBJECT_INHIBITOR_POS = [
			// blue
			[
				[0, 0], // top
				[3203, 3208], // mid
				[0, 0], // bot
			],
			// red
			[
				[0, 0], // top
				[0, 0], // mid
				[0, 0], // bot
			]
		];
		
		this.OBJECT_NEXUS_POS = [
			[0, 0], // blue
			[0, 0] // red
		];
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
			{ url: './data/json/wcs_timeline.json', data: {},  },
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
			
			////////////////////////////////////////////////////////////////////////////////////////

			self.JSON_DATA_TIMELINE_EVENT = json[1];

			for(var i = 0 ; i < self.JSON_DATA_TIMELINE_EVENT.frames.length ; ++i)
			{
				self.JSON_DATA_TIMELINE_EVENT.frames[i].events = self.JSON_DATA_TIMELINE_EVENT.frames[i].events.filter(function(data){
					if(data.type == "ELITE_MONSTER_KILL")
						return true;
					if(data.type == "BUILDING_KILL")
						return true;
					
					return false;
				});
			}

			self.GetMonsterTimelineData();

			////////////////////////////////////////////////////////////////////////////////////////
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
					this.MATCHDETAIL_DATA.team[i].player.push(json.participants[j]);
			}
		}
	}

	GetMonsterTimelineData()
	{
		var index = 0;
		var time = 0;
		var sec_time = 0;
		var isDragon = false;
		var isElderDragon = false;
		var isRiftHerald = false;
		var isBaron = false;
		var isKillDragon = false;
		var isKillRiftHerald = false;
		var dragonRespawnTime = 0;
		var baronRespawnTime = 0;

		for(var i = 0 ; i < this.JSON_DATA_TIMELINE.length ; ++i)
		{
			isDragon = false;
			isBaron = false;

			index = Math.floor(i / 60);
			time = this.JSON_DATA_TIMELINE[i].t;
			sec_time = Math.floor(time/1000);
//			console.log(this.JSON_DATA_TIMELINE_EVENT.frames[index].events);

			if(dragonRespawnTime < time)
			{
				if(isKillDragon)
					isElderDragon = true;
				else if(this.MONSTER_START_TIME[0] <= sec_time)
					isDragon = true;
			}

			if(this.MONSTER_START_TIME[3] <= sec_time)
			{
				if(baronRespawnTime < time)
					isBaron = true;
			}
			else if(this.MONSTER_START_TIME[2] <= sec_time && this.RIFTHERALD_END_TIME > sec_time)
			{
				isRiftHerald = true;
			}
			
			if(isKillRiftHerald)
				isRiftHerald = false;

			for(var j = 0 ; j < this.JSON_DATA_TIMELINE_EVENT.frames[index].events.length ; ++j)
			{
				if(this.JSON_DATA_TIMELINE_EVENT.frames[index].events[j].timestamp < time)
				{
					if(this.JSON_DATA_TIMELINE_EVENT.frames[index].events[j].type == "ELITE_MONSTER_KILL")
					{
						switch(this.JSON_DATA_TIMELINE_EVENT.frames[index].events[j].monsterType)
						{
							case "DRAGON" :
								if(dragonRespawnTime <= 0)
								{
									dragonRespawnTime = (this.MONSTER_RESPAWN_TIME[0]*1000)+time;
									if(this.MONSTER_START_TIME[1] <= sec_time)
									{
										dragonRespawnTime = (this.MONSTER_RESPAWN_TIME[1]*1000)+timr;
										isKillDragon = true;
									}
									isDragon = false;
									isElderDragon = false;
								}
							break;
							case "RIFTHERALD" :
								isKillRiftHerald = true;
								isRiftHerald = false;
							break;
							case "BARON_NASHOR" :
								if(baronRespawnTime <= 0)
								{
									baronRespawnTime = (this.MONSTER_RESPAWN_TIME[3]*1000)+time;
									isBaron = false;
								}
							break;
						}
					}
				}
			}
			if(this.TIMELINE_EVENT_DATA[i] == undefined)
				this.TIMELINE_EVENT_DATA[i] = {};
			
			this.TIMELINE_EVENT_DATA[i].MONSTER = {};
			this.TIMELINE_EVENT_DATA[i].MONSTER.isDragon = isDragon;
			this.TIMELINE_EVENT_DATA[i].MONSTER.isElderDragon = isElderDragon;
			this.TIMELINE_EVENT_DATA[i].MONSTER.isRiftHerald = isRiftHerald;
			this.TIMELINE_EVENT_DATA[i].MONSTER.isBaron = isBaron;
			this.TIMELINE_EVENT_DATA[i].MONSTER.t = time;
		}

		console.log(this.TIMELINE_EVENT_DATA);

		for(var i = 0 ; i < this.JSON_DATA_TIMELINE_EVENT.frames.length ; ++i)
		{
			for(var j = 0 ; j < this.JSON_DATA_TIMELINE_EVENT.frames[i].events.length ; ++j)
			{
				if(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].type == "BUILDING_KILL")
				{
//					if(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].killerId < 5)
					{						
						console.log(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j]);
						console.log(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].killerId);
						console.log(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].laneType);
						console.log(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].towerType);
						console.log(this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].position);
						
						var time = this.JSON_DATA_TIMELINE_EVENT.frames[i].events[j].timestamp;
						var min = Math.floor(time/60000);
						var sec = Math.floor((time%60000)/1000);
						console.log(min + ":"+sec);
					}
				}
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	UpdateFrame(frame)
	{
		var time = this.JSON_DATA_TIMELINE[frame].t;
		this.SetTimeValue(time);
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
			this.AutoPlay(this);
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
		var frame = $('#FrameSlideBar')[0].value;
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
				self.MOVE_COMPLEMENT_THREAD_NUM = setInterval(self.UpdateGame, self.AUTO_PLAY_INTERVAL/self.MOVE_COMPLEMENT_INTERVAL, self, next_frame, next_frame+1);
			}
			// Monster
			self.UpdateMonster(frame);
			// Object
			self.UpdateObject(frame);
		}
		else
		{
			$('#Play').trigger('click');
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	UpdateGame(self, frame, frameNext)
	{
		// Champion
		self.UpdateChampion(frame, frameNext);

		self.COMPLAMENT_FRAME++;
	}

	////////////////////////////////////////////////////////////////////////////////////

	UpdateChampion(frame, frameNext)
	{
		// Champion
		var x = [0, 0], y = [0, 0];
		var diff_x = 0, diff_y = 0;
		var hp = 0;

		for(var i = 0 ; i < this.MATCHDETAIL_DATA.team.length ; ++i)
		{
			for(var j = 0 ; j < this.MATCHDETAIL_DATA.team[i].player.length ; ++j)
			{
				for(var k in this.JSON_DATA_TIMELINE[frame].playerStats)
				{
					if( this.MATCHDETAIL_DATA.team[i].player[j].participantId == this.JSON_DATA_TIMELINE[frame].playerStats[k].participantId )
					{
						x[0] = this.JSON_DATA_TIMELINE[frame].playerStats[k].x;
						y[0] = this.JSON_DATA_TIMELINE[frame].playerStats[k].y;
						x[1] = this.JSON_DATA_TIMELINE[frameNext].playerStats[k].x;
						y[1] = this.JSON_DATA_TIMELINE[frameNext].playerStats[k].y;
						
						diff_x = (x[1] - x[0])/this.MOVE_COMPLEMENT_INTERVAL;
						diff_y = (y[1] - y[0])/this.MOVE_COMPLEMENT_INTERVAL;
						
						diff_x = diff_x * this.COMPLAMENT_FRAME;
						diff_y = diff_y * this.COMPLAMENT_FRAME;

						this.MINIMAP.TranslateChampion(k-1, x[0]+diff_x, y[0]+diff_y);

						hp = this.JSON_DATA_TIMELINE[frame].playerStats[k].h;
						this.MINIMAP.SetDead(k-1, hp > 0 ? false : true);
						break;
					}
				}
			}
		}
	}

	UpdateMonster(frame)
	{
		var time = this.TIMELINE_EVENT_DATA[frame].MONSTER.t;
		var min = Math.floor(time/60000);
		var sec = Math.floor((time%60000)/1000);

//		console.log("frame : " + frame +  " " + min + ":"+sec);

		var isDragon = this.TIMELINE_EVENT_DATA[frame].MONSTER.isDragon;
		var isElder = this.TIMELINE_EVENT_DATA[frame].MONSTER.isElderDragon;
		var isRift = this.TIMELINE_EVENT_DATA[frame].MONSTER.isRiftHerald;
		var isBaron = this.TIMELINE_EVENT_DATA[frame].MONSTER.isBaron;
		
		if(isDragon != this.isDragon || isElder != this.isDragon)
		{
			this.MINIMAP.ShowDragon(isDragon, isElder, this.MONSTER_POS[0][0], this.MONSTER_POS[0][1]); // Dragon
			this.isDragon = isDragon | isElder;
		}

		if(isRift != this.isBaron || isBaron != this.isBaron)
		{
			this.MINIMAP.ShowBaron(isRift, isBaron, this.MONSTER_POS[1][0], this.MONSTER_POS[1][1]);
			this.isBaron = isRift | isBaron;
		}
		/*
		var isDragon = this.TIMELINE_EVENT_DATA[frame].MONSTER.isDragon;
		var isElder = this.TIMELINE_EVENT_DATA[frame].MONSTER.isElderDragon;
		var isRift = this.TIMELINE_EVENT_DATA[frame].MONSTER.isRiftHerald;
		var isBaron = this.TIMELINE_EVENT_DATA[frame].MONSTER.isBaron;

		// dragon
		if(this.MONSTER_START_TIME[0] <= frame)
			isDragon = true;

		// rift		
		if(this.MONSTER_START_TIME[2] <= frame)
			isBaron = true;
		
		if(isDragon != this.isDragon)
		{
			if(this.MONSTER_START_TIME[1] > frame)
				this.MINIMAP.ShowDragon(isDragon, false, this.MONSTER_POS[0][0], this.MONSTER_POS[0][1]); // Dragon
			else
				this.MINIMAP.ShowDragon(false, isDragon, this.MONSTER_POS[0][0], this.MONSTER_POS[0][1]); // Elder
			
			this.isDragon = isDragon;
		}
		else
		{
			if(isDragon)
			{
				if(this.MONSTER_START_TIME[1] == frame)
					this.MINIMAP.ShowDragon(false, isDragon, this.MONSTER_POS[0][0], this.MONSTER_POS[0][1]); // Elder
			}
		}

		if(isBaron != this.isBaron)
		{
			if(this.MONSTER_START_TIME[3] > frame)
				this.MINIMAP.ShowBaron(isBaron, false, this.MONSTER_POS[1][0], this.MONSTER_POS[1][1]);
			else
				this.MINIMAP.ShowBaron( false, isBaron, this.MONSTER_POS[1][0], this.MONSTER_POS[1][1]);

			this.isBaron = isBaron;
		}
		else
		{
			if(isBaron)
			{
				if(this.MONSTER_START_TIME[2] == frame)
					this.MINIMAP.ShowBaron( false, isBaron, this.MONSTER_POS[1][0], this.MONSTER_POS[1][1]);
			}
		}
		*/
	}

	UpdateObject(frame)
	{
		this.MINIMAP.ShowTower([true, true, true], this.OBJECT_TOWER_POS);
		this.MINIMAP.ShowInhibitor([true, true, true], this.OBJECT_INHIBITOR_POS);
		this.MINIMAP.ShowNexus([true, true, true], this.OBJECT_NEXUS_POS);
	}

	////////////////////////////////////////////////////////////////////////////////////

	Main(self)
	{
		if( self.MINIMAP.IsInit() == false )
		{
			// Init
			clearInterval(self.MAIN_THREAD_NUM);
			self.CreateFrameSlideBar();
			
			var x = 0, y = 0;
			var frame = 0;

			for(var i = 0 ; i < self.MATCHDETAIL_DATA.team.length ; ++i)
			{
				for(var j = 0 ; j < self.MATCHDETAIL_DATA.team[i].player.length ; ++j)
				{
					for(var k in self.JSON_DATA_TIMELINE[frame].playerStats)
					{
						if( self.MATCHDETAIL_DATA.team[i].player[j].participantId == self.JSON_DATA_TIMELINE[frame].playerStats[k].participantId )
						{
							x = self.JSON_DATA_TIMELINE[frame].playerStats[k].x;
							y = self.JSON_DATA_TIMELINE[frame].playerStats[k].y;
							self.MINIMAP.TranslateChampion(k-1, x, y);
							break;
						}
					}
				}
			}
		}
	}
}

var time = new TimeLine();
time.Init(location.href);