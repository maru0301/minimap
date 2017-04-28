////////////////////////////////////////////////////////////////////////////////////
// TimeLine Class
////////////////////////////////////////////////////////////////////////////////////

class Minimap {

	constructor()
	{
		this.CANVAS_CHAMPION = [];

		this.MAP_MAX_WIDTH = 512;
		this.MAP_MAX_HEIGHT = 512;

		this.CHAMP_IMG_SCALE = 0.2;

// 		var sn_min = [-120,-120]; // x, y
		var sn_min = [600,-500]; // x, y
		var sn_max = [14870,14980];

		this.MINIMAP_SCALE_POS_X = d3.scale.linear().domain([sn_min[0], sn_max[0]])		// 元のサイズ
													.range([0, this.MAP_MAX_WIDTH]);	// 実際の出力サイズ
		this.MINIMAP_SCALE_POS_Y = d3.scale.linear().domain([sn_max[1], sn_min[1]])
													.range([0, this.MAP_MAX_HEIGHT]);
		this.isInit = true;

		this.MONSTER_IMG_WIDTH = 48;
		this.MONSTER_IMG_HEIGHT = 48;
		this.MONSTER_IMG = {};
		this.MONSTER_IMG_SCALE = 0.5;

		this.OBJECT_IMG_WIDTH = 32;
		this.OBJECT_IMG_HEIGHT = 32;
		this.OBJECT_IMG = {};
		this.OBJECT_IMG_SCALE = 0.8;
		
	}


	////////////////////////////////////////////////////////////////////////////////////

	Init(data)
	{
		console.log("Init : Minimap");

		this.InitMinimapCanvas();
		this.InitChampionCanvas(data);
		this.InitMonsterCanvas();
		this.InitObjectCanvas();
	}

	////////////////////////////////////////////////////////////////////////////////////

	InitMinimapCanvas()
	{
		var targetTag = $('minimap canvas')[0];

		var ctx = $('minimap canvas')[0].getContext('2d');

		var img = new Image();
		img.src = "./data/img/minimap.png";

		img.addEventListener('load', function()
		{
			$('minimap canvas')[0].width = this.width;
			$('minimap canvas')[0].height = this.height;
			ctx.drawImage(this, 0, 0);
		}, false);
	}
	
	InitChampionCanvas(url_data)
	{
		var self = this;
		var target = $('minimap_champion')[0];
		var newTag;
    	var loadedCount = 1;

		for(var i = 0 ; i < url_data.length ; ++i)
		{
			self.CANVAS_CHAMPION[i] = {};

			newTag = document.createElement("canvas");
			target.appendChild(newTag);

			newTag.width = self.MAP_MAX_WIDTH;
			newTag.height = self.MAP_MAX_HEIGHT;
			self.CANVAS_CHAMPION[i].canvas = newTag;

			self.CANVAS_CHAMPION[i].img = new Image();
			self.CANVAS_CHAMPION[i].img.crossOrigin  = 'anonymous';
			self.CANVAS_CHAMPION[i].img.src = url_data[i];

			self.CANVAS_CHAMPION[i].img.addEventListener('load', function()
			{
				if(loadedCount == url_data.length)
				{
					var width;
					var height;
					var img_width, img_height;
					var ctx;

					for(var i = 0 ; i < url_data.length ; ++i)
					{
						img_width = self.CANVAS_CHAMPION[i].img.width;
						img_height = self.CANVAS_CHAMPION[i].img.height
						width = img_width * self.CHAMP_IMG_SCALE;
						height = img_height * self.CHAMP_IMG_SCALE;

						ctx = self.CANVAS_CHAMPION[i].canvas.getContext('2d');
						ctx.drawImage(self.CANVAS_CHAMPION[i].img, 0, 0, img_width, img_height, 0, 0 , width, height);

						self.CANVAS_CHAMPION[i].imgd = ctx.getImageData(0, 0, width, height);
						var pix = self.CANVAS_CHAMPION[i].imgd.data;

						for (var j = 0, n = pix.length; j < n; j += 4)
						{
							var grayscale = pix[j] * .3 + pix[j+1] * .59 + pix[j+2] * .11;
							pix[j] = grayscale; // 赤
							pix[j+1] = grayscale; // 緑
							pix[j+2] = grayscale; // 青
							// アルファ
						}

				    	ctx.clearRect(0, 0, self.CANVAS_CHAMPION[i].canvas.width, self.CANVAS_CHAMPION[i].canvas.height);
//						ctx.putImageData(self.CANVAS_CHAMPION[i].imgd, 0, 0);
//						self.CANVAS_CHAMPION[i].imgd.data = pix;
//						self.CANVAS_CHAMPION[i].img_dead = self.CANVAS_CHAMPION[i].img;
//						ctx.drawImage(self.CANVAS_CHAMPION[i].img, 0, 0, img_width, img_height, 0, 0 , width, height);
					}

					////////////////////////////////////////////////////////////////////////////////////
					self.isInit = false;
					////////////////////////////////////////////////////////////////////////////////////
				}
				loadedCount++;
			}, false);
			
			self.CANVAS_CHAMPION[i].isDead = false;
		}
	}
	
	InitMonsterCanvas()
	{
		var targetTag = $('minimap_monster canvas')[0];
		targetTag.width = this.MAP_MAX_WIDTH;
		targetTag.height = this.MAP_MAX_HEIGHT;

		var ctx = $('minimap_monster canvas')[0].getContext('2d');

		this.MONSTER_IMG = new Image();
		this.MONSTER_IMG.src = "./data/img/monster.png";
	}
	
	InitObjectCanvas()
	{
		var targetTag = $('minimap_object canvas')[0];
		targetTag.width = this.MAP_MAX_WIDTH;
		targetTag.height = this.MAP_MAX_HEIGHT;

		var ctx = $('minimap_object canvas')[0].getContext('2d');

		this.OBJECT_IMG = new Image();
		this.OBJECT_IMG.src = "./data/img/object.png";
	}

	////////////////////////////////////////////////////////////////////////////////////

	TranslateChampion(index, x, y)
	{
		var ctx = this.CANVAS_CHAMPION[index].canvas.getContext('2d');
		var img_width = this.CANVAS_CHAMPION[index].img.width;
		var img_height = this.CANVAS_CHAMPION[index].img.height;
		var width = img_width * this.CHAMP_IMG_SCALE;
		var height = img_height * this.CHAMP_IMG_SCALE;
		var canvas_width = this.CANVAS_CHAMPION[index].canvas.width;
		var canvas_height = this.CANVAS_CHAMPION[index].canvas.height;
		var pos_x = this.MINIMAP_SCALE_POS_X(x);
		var pos_y = this.MINIMAP_SCALE_POS_Y(y);
		
		//console.log("index : "+index);
		//console.log("x : " + x + " scale_x : "+ pos_x);
		//console.log("y : " + y + " scale_y : "+ pos_y);

    	ctx.clearRect(0, 0, this.CANVAS_CHAMPION[index].canvas.width, this.CANVAS_CHAMPION[index].canvas.height);

		if(!this.CANVAS_CHAMPION[index].isDead)
		{
			ctx.translate(pos_x, pos_y);
			ctx.drawImage(this.CANVAS_CHAMPION[index].img, 0, 0, img_width, img_height, 0, 0 , width, height);
			ctx.translate(-pos_x, -pos_y);
		}
		else
		{
			ctx.putImageData(this.CANVAS_CHAMPION[index].imgd, pos_x, pos_y);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	ShowDragon(isDragon,isElder, x ,y)
	{
		x = this.MINIMAP_SCALE_POS_X(x);
		y = this.MINIMAP_SCALE_POS_Y(y);
		var width = this.MONSTER_IMG_WIDTH * this.MONSTER_IMG_SCALE;
		var height = this.MONSTER_IMG_HEIGHT * this.MONSTER_IMG_SCALE;
		var diff = 0;
		
		var ctx = $('minimap_monster canvas')[0].getContext('2d');
    	ctx.clearRect(x, y, width, height);

		if(isDragon || isElder)
		{

			if(isElder)
				diff = this.MONSTER_IMG_WIDTH * 1;

			ctx.drawImage(this.MONSTER_IMG, 0+diff, 0, this.MONSTER_IMG_WIDTH, this.MONSTER_IMG_HEIGHT, x, y, width, height);
		}
	}

	ShowBaron(isRift, isBaron, x ,y)
	{
		x = this.MINIMAP_SCALE_POS_X(x);
		y = this.MINIMAP_SCALE_POS_Y(y);
		var width = this.MONSTER_IMG_WIDTH * this.MONSTER_IMG_SCALE;
		var height = this.MONSTER_IMG_HEIGHT * this.MONSTER_IMG_SCALE;
		var diff = this.MONSTER_IMG_WIDTH * 2;

		var ctx = $('minimap_monster canvas')[0].getContext('2d');
    	ctx.clearRect(x, y, width, height);

		if(isRift || isBaron)
		{
			if(isBaron)
				diff = this.MONSTER_IMG_WIDTH * 3;
			
			ctx.drawImage(this.MONSTER_IMG, 0+diff, 0, this.MONSTER_IMG_WIDTH, this.MONSTER_IMG_HEIGHT, x, y, width, height);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	ShowTower(isVisible, pos)
	{
		var width = this.OBJECT_IMG_WIDTH * this.OBJECT_IMG_SCALE;
		var height = this.OBJECT_IMG_HEIGHT * this.OBJECT_IMG_SCALE;
		var diff = this.OBJECT_IMG_WIDTH * 0;

		var ctx = $('minimap_object canvas')[0].getContext('2d');
		
		var pos_x = 0;
		var pos_y = 0;

		//for(var i = 0; i < isVisible.length ; ++i)
		for(var i = 0 ; i < 2 ; ++i)
		{
			for(var j = 0 ; j < 3 ; ++j)
			{
				for(var k = 0 ; k < pos[i][j].length ; ++k)
				{
					pos_x = this.MINIMAP_SCALE_POS_X(pos[i][j][k][0]);
					pos_y = this.MINIMAP_SCALE_POS_Y(pos[i][j][k][1]);

					ctx.clearRect(pos_x, pos_y, width, height);
					ctx.drawImage(this.OBJECT_IMG, 0+diff, 0, this.OBJECT_IMG_WIDTH, this.OBJECT_IMG_HEIGHT, pos_x, pos_y, width, height);//, pos_x, pos_y, width, height);
				}
			}
		}
	}

	ShowInhibitor(isVisible, pos)
	{
		var width = this.OBJECT_IMG_WIDTH * this.OBJECT_IMG_SCALE;
		var height = this.OBJECT_IMG_HEIGHT * this.OBJECT_IMG_SCALE;
		var diff = this.OBJECT_IMG_WIDTH * 1;

		var ctx = $('minimap_object canvas')[0].getContext('2d');
		
		var pos_x = 0;
		var pos_y = 0;

		for(var i = 0 ; i < 2 ; ++i)
		{
			for(var j = 0 ; j < 3 ; ++j)
			{
				pos_x = this.MINIMAP_SCALE_POS_X(pos[i][j][0]);
				pos_y = this.MINIMAP_SCALE_POS_Y(pos[i][j][1]);

				ctx.clearRect(pos_x, pos_y, width, height);
				ctx.drawImage(this.OBJECT_IMG, 0+diff, 0, this.OBJECT_IMG_WIDTH, this.OBJECT_IMG_HEIGHT, pos_x, pos_y, width, height);//, pos_x, pos_y, width, height);
			}
		}
	}

	ShowNexus(isVisible, pos)
	{
		var width = this.OBJECT_IMG_WIDTH * this.OBJECT_IMG_SCALE;
		var height = this.OBJECT_IMG_HEIGHT * this.OBJECT_IMG_SCALE;
		var diff = this.OBJECT_IMG_WIDTH * 2;

		var ctx = $('minimap_object canvas')[0].getContext('2d');
		
		var pos_x = 0;
		var pos_y = 0;

		for(var i = 0 ; i < 2 ; ++i)
		{
			pos_x = this.MINIMAP_SCALE_POS_X(pos[i][0]);
			pos_y = this.MINIMAP_SCALE_POS_Y(pos[i][1]);

			ctx.clearRect(pos_x, pos_y, width, height);
			ctx.drawImage(this.OBJECT_IMG, 0+diff, 0, this.OBJECT_IMG_WIDTH, this.OBJECT_IMG_HEIGHT, pos_x, pos_y, width, height);//, pos_x, pos_y, width, height);
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////

	SetDead(index, flag) { this.CANVAS_CHAMPION[index].isDead = flag; }

	////////////////////////////////////////////////////////////////////////////////////

	IsInit() { return this.isInit; }
}
