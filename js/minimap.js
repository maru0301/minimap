////////////////////////////////////////////////////////////////////////////////////
// TimeLine Class
////////////////////////////////////////////////////////////////////////////////////

class Minimap {

	constructor()
	{
		this.VERSION = "";
		this.CDN_URL = "";

		this.JSON_DATA_CHAMP_IMG = new Array();
		this.CANVAS_CHAMPION_IMG = new Array();
		this.CANVAS_MAP_IMG = "";
	}


	////////////////////////////////////////////////////////////////////////////////////

	Init()
	{
		this.InitMinimapCanvas();
		this.InitPlayerCanvas();
	}

	////////////////////////////////////////////////////////////////////////////////////

	InitMinimapCanvas()
	{
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
	
	InitPlayerCanvas()
	{
		var target = document.getElementsByTagName("minimap_champion")[0];
		var newTag;

		for(var i = 1 ; i <= 10 ; ++i)
		{
			newTag = document.createElement("player"+i);
			newTag.innerHTML = "<canvas></canvas>";
			
			target.appendChild(newTag);
		}
	}
}
