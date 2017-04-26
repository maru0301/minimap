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
	}


	////////////////////////////////////////////////////////////////////////////////////

	Init(data)
	{
		console.log("Init : Minimap");

		this.InitMinimapCanvas();
		this.InitChampionCanvas(data);
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

	SetDead(index, flag) { this.CANVAS_CHAMPION[index].isDead = flag; }

	////////////////////////////////////////////////////////////////////////////////////

	IsInit() { return this.isInit; }
}
