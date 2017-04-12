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

		this.isInit = true;
	}


	////////////////////////////////////////////////////////////////////////////////////

	Init(data)
	{
		console.log("Init : Minimap");
		console.log(data);

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
//			ctx.drawImage(this, 0, 0);
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
					}

					////////////////////////////////////////////////////////////////////////////////////
					self.isInit = false;
					////////////////////////////////////////////////////////////////////////////////////
				}
				loadedCount++;
			}, false);
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

		ctx.translate(x, y);
		ctx.drawImage(this.CANVAS_CHAMPION[index].img, 0, 0, img_width, img_height, 0, 0 , width, height);
	}

	////////////////////////////////////////////////////////////////////////////////////

	IsInit() { return this.isInit; }
}
