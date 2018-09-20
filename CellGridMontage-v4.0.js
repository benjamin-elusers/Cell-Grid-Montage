/* Author  : Benjamin Dubreuil
 * Date    : 20 Sept. 2018 
 * Project : YeastRGB - Cell Grid Montage (v4.1)
 */

///---------------------------- USEFUL VARIABLES ----------------------------///
LETTERS     = new Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P");  // to define 384 plate
COLS        = new Array("01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24");
sharp = '#';
star  = '*';
dash  = '-';
equal = '=';
space = ' ';
FILESEP	= "/"; // change to "\" if using windows I guess
 
///---------------------------- FUNCTIONS ----------------------------///
 IJSetup = function(){
	importClass(Packages.ij.IJ);
	importClass(Packages.ij.plugin.frame.RoiManager);
	importClass(Packages.ij.io.OpenDialog);
	importClass(Packages.ij.io.DirectoryChooser);
	importClass(Packages.ij.gui.GenericDialog);
	importClass(Packages.ij.util.Tools);
	importClass(Packages.ij.plugin.Duplicator);
	importClass(Packages.ij.measure.ResultsTable);
	importClass(Packages.ij.ImagePlus);
	importClass(Packages.ij.process.ImageProcessor);
	importClass(Packages.ij.util.ArrayUtil);
	importClass(Packages.ij.gui.Overlay);
	importClass(Packages.ij.plugin.filter.ParticleAnalyzer);
	importClass(Packages.ij.gui.Roi);
	importClass(Packages.ij.plugin.filter.Analyzer);
	importClass(Packages.ij.plugin.RGBStackMerge);
	importClass(Packages.ij.process.ImageConverter);
	importClass(Packages.ij.gui.OvalRoi);
	importClass(Packages.ij.WindowManager);
	importClass(Packages.ij.ImageStack);
	importClass(Packages.ij.gui.ProfilePlot);
	importClass(Packages.ij.gui.Line);
	importClass(Packages.ij.gui.Plot);
	importClass(Packages.ij.measure.CurveFitter);
	importClass(Packages.ij.plugin.frame.Fitter);
	importClass(Packages.ij.gui.PolygonRoi);
	importClass(Packages.ij.process.ImageStatistics);
	importClass(Packages.ij.measure.Measurements);
	importClass(Packages.java.io.File);
	importClass(Packages.java.io.FilenameFilter);
	importClass(Packages.java.io.IOException);
	importPackage(java.awt);
	importClass(Packages.ij.macro.Interpreter);
	MACRO = new Interpreter(); 
	IJ = IJ(); 
	IJ.setPasteMode("Copy");
	RM = RoiManager(true);// initiating the ROI manager in hidden mode.
	if (RM==null){ IJ.error("ROI Manager is not found"); }
	// activate batchmode (= setBatchMode(true) in IJ macro)
	MACRO.batchMode = true;
}

function cell() { 
// Constructor for any type of ROI. 
    this.idx    = null;
    this.type   = null;
    this.ROIobj = null; // ImageJ's Roi type object corresponding to this Roi.
    this.area   = null;
    this.x      = null;
    this.y      = null;

    this.toString = function () {
		IJ.log("idx: " + this.idx +" ROIobj: " + this.ROIobj + " , area: " + this.area + " , xVal: " + this.x + " , yVal: " + this.y +" type: " + this.type); 
    }

	this.getStats = function(imp,ip){
		imp.setRoi(this.ROIobj, false);
		ip.setRoi(this.ROIobj);
		var stats = ip.getStatistics();
	   	return stats;
	}
	
	this.measureROI = function(imp,ip,strStatsFld) {
	// Performs a measurement on an image. Takes as arguments: The roi object, the imageprocessor object, and the imagestatistics string field telling the function what to measure.
	// It returns the value that was measured.
		imp.setRoi(this.ROIobj,false);
		ip.setRoi(this.ROIobj);
		var stats = ip.getStatistics();
		var val = stats[strStatsFld];
	    return val;
	}
}

function sortArr(Arr,asc){
	var sorted = Arr.slice(0);
	if( asc === undefined ){
		// It returns the sorted array in ascending order.
	    sorted.sort(function(a, b){return a-b}); 
	    return sorted;
	}else{
		// It returns the sorted array in descending order.
	    sorted.sort(function(a, b){return b-a}); 
	    return sorted;
	}
}

Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
 
String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) { throw new TypeError('can\'t convert ' + this + ' to object'); }
    var str = '' + this;
    count = +count;
    if(count != count){ count = 0; }
    if(count < 0){ throw new RangeError('repeat count must be non-negative'); }
    if(count == Infinity){ throw new RangeError('repeat count must be less than infinity'); }
    count = Math.floor(count);
    if(str.length == 0 || count == 0){ return ''; }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the main part. 
    // But anyway, most current (August 2014) browsers can't handle strings 1 << 28 chars or longer, so:
    if(str.length * count >= 1 << 28){ throw new RangeError('repeat count must not overflow maximum string size'); }
    var rpt = '';
    for(;;){
      if ((count & 1) == 1) { rpt += str; }
      count >>>= 1;
      if (count == 0){ break; }
      str += str;
    }
    // Could we try:
    // return Array(count + 1).join(this);
    return rpt;
}

Array.prototype.indexOf = function indexOf(member, startFrom) {
    /*
    In non-strict mode, if the `this` variable is null or undefined, then it is set to the window object.
    Otherwise, `this` is automatically converted to an object. 
    In strict mode, if the `this` variable is null or undefined, a `TypeError` is thrown.
    */
	if (this == null) { throw new TypeError("Array.prototype.indexOf() - can't convert `" + this + "` to object"); }

	var
	  index = isFinite(startFrom) ? Math.floor(startFrom) : 0,
	  that = this instanceof Object ? this : new Object(this),
	  length = isFinite(that.length) ? Math.floor(that.length) : 0;

	if (index >= length){ return -1; }

	if (index < 0) { index = Math.max(length + index, 0); }

	if (member === undefined) {
		/* Since `member` is undefined, keys that don't exist will have the same value as `member`, and thus do need to be checked. */
	  do{
	    if (index in that && that[index] === undefined) { return index; }
	  }while (++index < length);
	}else{
	  do{
	  	if (that[index] === member) { return index; }
	  }while (++index < length);
	}
	return -1;
}

function seqD(start,end,delta){
	var Arr = new Array();
	if(delta == 0 ){ return(Arr) }
	if( start > end ){ return(Arr) }
	if(delta < 0 ){ delta = -delta; }
	if( delta > end-start ){ delta = end; }
	for (var i = start; i < end+1; i+=delta){ Arr.push(i); }
	return(Arr)
}
//vec = new Array(2,3,5,6,9,17,21,22,23,25,28,29,30,31,33,37,39,41,42,44,45,46,47,48,50,51,54,56,57,62,63,65,66,69,70,72,73,74,75,76,77,78,79,81,86,88,89,90,91,92,93,94,95,102,105,106,107,108,112,113,114,116,117,120,121,122,123,124,125,126,128,129,132,134,135,137,138,141,142,145,146,149,152,155,156,157,158,161,163,167,169,171,172,173,174,175,176,178,179,182,183,184,185,186,188,190,191,193,194,195,197,198,199);
function seqL(start,end,len){
	var Arr = new Array();
	if( len<1 ){ return(Arr) }
	if( start > end ){ return(Arr) }
	if( end < len ){ len = end; }
	var delta = (end-start) / (len-1) ;
	var nval=0;
	for (var i = start; i <= end-delta && nval < len-1; i+=delta){ Arr.push(Math.floor(i)); nval++; }
	Arr.push(Math.floor(end-1));
	return(Arr)
}
//print(vec.length);
//print( seqL(0,vec.length,32) );
//ivec=seqL(0,vec.length,32);
function subset(Arr,ind){
	var subset = new Array();
	for(var i=0; i<ind.length; i++){ 
		if(i<Arr.length){ subset.push(Arr[ind[i]]); }
		else{ IJ.log("index "+ind[i]+" not in Array! "+Arr); }
	}
	return(subset);
}
//print(subset(vec,ivec));

function dirname(str, sep){ return str.substr(0,str.lastIndexOf(sep)); }
function basename(str, sep){ return str.substr(str.lastIndexOf(sep) + 1); }
function stripext(str) { return str.substr(0,str.lastIndexOf('.')); }
function getext(str) { return str.substr(str.lastIndexOf('.')+1); }
// path = '/media/elusers/users/benjamin/A-PROJECTS/01_PhD/04-image-analysis/JS4Fiji/test-CellGridMontage.input';
// print("DIR is "+dirname(path,'/'));
// print("FILE is "+basename(path,'/'));
// print("FILENAME is "+stripEXT(basename(path,'/')));
// print("EXTENSION is "+getEXT(path));

function initMontageParams(){
	var M={};
	M['makePLATE']    = false;
	M['skipFIRSTPIC'] = false;

	M['BITMODE']      = '8-bit';
	M['BACKGROUND']   = 'black';
	M['PICPERWELL']   = 8;
	/// DONT MODIFY UNLESS YOUR PLATE FORMAT IS DIFFERENT FROM 384
	M['PLATEROWS']    = 16;
	M['PLATECOLS']    = 24;
	/// DONT MODIFY UNLESS YOU TO ALLOW FOR BIGGER CELLS, MORE CELLS PER WELLS
	//-- This will increase the size of the image and greatly slow down imageJ when observing the montage --//
	M['pxBORDER']     = 50;  // TOP & LEFT MARGIN IN PIXELS FOR THE MONTAGE
	M['pxCELL']       = 65;  // SIZE IN PIXEL FOR CROPPING CELLS
	M['CELLPERSIDE']  = 15;  // NUMBER OF CELLS PER SIDE OF A WELL

	M['FILENAME'] = "montage";
	return(M);
}

function updateMontageParams(M){

	M['PLATEFORMAT'] = M['PLATEROWS']*M['PLATECOLS'];
	M['CELLPERWELL'] = M['CELLPERSIDE']*M['CELLPERSIDE']; // MAXIMUM NUMBER OF CELLS PER WELL (225)
	M['CELLPERPIC']  = Math.floor( M['CELLPERWELL'] / (M['PICPERWELL']-M['skipFIRSTPIC']) ) + 1; // MAXIMUM NUMBER OF CELLS PER PICTURE
	
	M['WELLSIDE']    = M['CELLPERSIDE']*M['pxCELL'];
	M['WIDTH']       = M['pxBORDER']+(M['PLATECOLS']*M['WELLSIDE']);
	M['HEIGHT']      = M['pxBORDER']+(M['PLATEROWS']*M['WELLSIDE']);

	return(M);
}

function getMontageAllParams(M){
	var sharp = '#';
	var retSTR = "";
	// PRINTING MONTAGE PARAMETERS
	retSTR+=sharp.repeat(80)+"\n";
	retSTR+="YOUR PLATE MONTAGE WILL BE IN FORMAT : "+M['PLATEFORMAT']+" wells ("+M['PLATEROWS']+"rows x "+M['PLATECOLS']+"cols)\n";
	retSTR+="==> in pixel unit : Width = " + M['WIDTH'] + " px.  Height = "+M['HEIGHT']+" px.\n";
	retSTR+="EACH WELL WILL HAVE AT MOST "+M['CELLPERWELL']+" cells ("+M['CELLPERSIDE']+" images by row & by column)\n";
	retSTR+="AT MOST, "+M['CELLPERPIC']+" CELLS WILL BE TAKEN FROM EACH WELL PICTURE\n";
	retSTR+="EACH CELL WILL BE CONTAINED IN A SQUARE IMAGE OF "+M['pxCELL']+" px.\n";
	retSTR+="In addition, borders of "+M['pxBORDER']+" px. will be drawn on the left and top side of the plate\n";
	retSTR+=sharp.repeat(80)+"\n";
	IJ.log(retSTR);
}
//IJ.log("EXAMPLE getMontageAllParam(MONTAGE)");
//getMontageAllParams(MONTAGE);

function getMontageParam(mon,par){
	var retSTR = "";
	if( par in mon ){
		retSTR+="PARAMETER '"+par+"' VALUE = "+mon[par];
	}else{
		retSTR+=("PARAMETER '"+par+"' NOT FOUND!");
	}
	return(retSTR);
}
//IJ.log("EXAMPLE getMontageParam(MONTAGE,'CELLPERPIC')");
//getMontageParam(MONTAGE,"CELLPERPIC");

function setMontageParam(mon,par,val){
	var retSTR = "";
	if( par in mon ){
		//retSTR+="BEFORE : "+getMontageParam(mon,par);
		retSTR+="SETTING "+getMontageParam(mon,par)+" TO "+val+"\n";
		mon[par] = val;
		//retSTR+="AFTER  : "+getMontageParam(mon,par);
		
	}else{
		retSTR +="PARAMETER '"+par+"' NOT FOUND!\n";
	}
	IJ.log(retSTR);
}
//IJ.log("EXAMPLE setMontageParam(MONTAGE,'CELLPERPIC',15)")
//setMontageParam(MONTAGE,"CELLPERPIC",15);

// FUNCTION
function getWellpos(snum,M){
	
	var iWELL=Math.floor(snum/(M['PICPERWELL']));
	var POS = iWELL / M['PLATECOLS'];

	var NROW=Math.floor(POS);
	var ncol = ((POS-Math.floor(POS)) * M['PLATECOLS']);
	var offsetX = Math.pow(-1, (NROW % 2 != 0)) * ncol;
	var originX = ((NROW % 2 != 0) * (M['PLATECOLS']-1)); 
	var NCOL =  Math.round(originX + offsetX);

	var well = {};
	well['irow'] = NROW;
	well['icol'] = NCOL;
	if( NROW % 2 == 0 ){ // Left-to-right on even rows (0,2,4,6... => A,C,E,G..)
	  well['type'] = +1;
	}else if ( NROW % 2 != 0 ){   // Right-to-Left on odd rows (1,3,5,7... => B,D,F,H...)
	  well['type'] = -1;
    }	 	

    var X = M['pxBORDER'] + NCOL * M['WELLSIDE'];
	//IJ.log('NROW '+NROW+' NCOL '+NCOL+' X '+globalX);

	var WELL=""+LETTERS[NROW]+COLS[NCOL]
	var Y = M['pxBORDER'] + NROW * M['WELLSIDE'];
	well['name'] = WELL;
	well['X'] = X;
	well['Y'] = Y;

	return(well);
}
//IJ.log("EXAMPLE getWellpos(1352,MONTAGE)");
//IJ.log(Dumper(getWellpos(1352,MONTAGE)));


function Well2pos(w,M,debug){
	
	var regexWell = new RegExp('^([A-P])(0[1-9]|1[0-9]|2[0-4])$');
	var arrayWell = regexWell.exec(w);

	if( arrayWell === null){ 
		IJ.log(w+" is not a valid well.") 
		return(null);
	}
 	
 	row=LETTERS.indexOf(arrayWell[1]);
	col=COLS.indexOf(arrayWell[2]);
	if( row === null ){	IJ.log(arrayWell[1] + " not a valid ROW in the "+M['PLATEFORMAT']+" well plate.");	}
	if( col ===  null ){ IJ.log(arrayWell[2] + " not a valid COLUMN in the "+M['PLATEFORMAT']+" well plate.");	} 
	
	var wellpos = {};
	wellpos['name'] = w;
	wellpos['row'] = LETTERS[row];
	wellpos['col'] = COLS[col];
	wellpos['x']   = M['pxBORDER'] + col*M['WELLSIDE'];
	wellpos['y']   = M['pxBORDER'] + row*M['WELLSIDE'];

	if( row !== null  & col !== null & debug !== undefined ){
		IJ.log("WELL  string      : "+wellpos['name']);
		IJ.log("Plate coordinates : row = "+row+" ( "+wellpos['row']+" ) "+" col = "+col+" ( "+wellpos['col']+" )");
		IJ.log("Pixel coordinates : x= "+wellpos['x']+" y="+wellpos['y']);
	}
	
	return(wellpos);
}
//IJ.log("EXAMPLE Well2pos('A01',MONTAGE)");
//IJ.log(Dumper(Well2pos("A01",MONTAGE)));
function getSNUM(wROW,wCOL,M){
	var myNUM = (wROW-1) * M['PLATECOLS'] * M['PICPERWELL'];
	if( wROW % 2 == 0 ){ // Left-to-right on even rows (0,2,4,6... => A,C,E,G..)
	  myNUM += (M['PLATECOLS']-wCOL-1)*M['PICPERWELL'] + 1;
	}else if ( wROW % 2 != 0 ){   // Right-to-Left on odd rows (1,3,5,7... => B,D,F,H...)
	  myNUM += (wCOL-1)*M['PICPERWELL'] + 1;
    }	 	
	return(myNUM);
}

function tabRow (idx,P,W,O,C0,C1) {
  this.index = idx;
  this.plate = String(P);
  this.well = String(W);
  this.orf =  String(O);
  this.c0 = File(C0);
  this.c1 = File(C1);
  this.c2 = File(null);
  this.c3 = File(null);
}

function tabRow (idx,P,W,O,C0,C1,C2) {
  this.index = idx;
  this.plate = String(P);
  this.well = String(W);
  this.orf =  String(O);
  this.c0 = File(C0);
  this.c1 = File(C1);
  this.c2 = File(C2);
  this.c3 = File(null);
}

function tabRow (idx,P,W,O,C0,C1,C2,C3) {
  this.index = idx;
  this.plate = String(P);
  this.well = String(W);
  this.orf =  String(O);
  this.c0 = File(C0);
  this.c1 = File(C1);
  this.c2 = File(C2);
  this.c3 = File(C3);
}

tabRow.prototype.toString = function tabRow2String() {
  var ret = 'row=' + this.index + '\n-> plate=' + this.plate + '\n-> well=' + this.well + '\n-> orf=' + this.orf + '\n-> c0=' + this.c0+ '\n-> c1=' + this.c1+ '\n-> c2=' + this.c2+ '\n-> c3=' + this.c3;
  return ret;
}

function openTable(filepath,sep,header){
	//IJ.log("Opening tabulated file : ");
	//IJ.log(filepath);
	var fileContent = IJ.openAsString(filepath);
	var lines = fileContent.split("\n");
	
	var names = seqD(1,lines[0].split(sep).length,1);
	//IJ.log("Default column names : "+names);
	if(header==true){  names = lines[0].split(sep); }
	var table = new Array();
	IJ.log("Columns of tabulated file are : "+names.join(' '));

	var input = {};
	input['fields'] = names;
	for( var n=0+(header==true); n<lines.length; n++){
		columns = lines[n].split(sep);
		record = new tabRow(n,columns[0],columns[1].toString(),columns[2],columns[3],columns[4],columns[5],columns[6]);
//		for( var c=0; c<names.length; c++ ){
//			hash[names[c]] = columns[c]; 
//		}
		table.push(record);
	}
	IJ.log("Tabulated file contained "+(lines.length-header)+" lines with data (except header)");
	input['data'] = table;
	return(input);
}
	

function initRM(){
	if(RM==null){ RM = RoiManager(); }
	RM.reset();
}

function initCopyStatus(x0,y0){
	var status = {};
	status['channel'] = undefined;
	status['ROWINPUT'] = 1;
	status['FIRSTWELL'] = true;
	status['LASTROW'] = false;
	status['picno'] = 1;
	status['Xpos'] = x0;
	status['Ypos'] = y0;
	status['well'] = undefined;
	status['orf'] = undefined;
	status['NCELLS'] = 0;
	status['KEPT']   = 0;
	status['COPIED'] = 0;
	status['xcellgrid']  = 0;
	status['ycellgrid']  = 0;
	status['MAXINT'] = 0;
	status['COPY']   = true;
	return(status);
}


function NextWell(lastVal, currentVal,M,S,O){
	// CHECK IF WELL HAS BEEN VISITED
	
	IJ.log("(0) Check if well changed");
	var nextwell = (lastVal !== currentVal);
	if(lastVal !== undefined ){ S['FIRSTWELL'] = false; }
	if( nextwell ){
		IJ.log(dash.repeat(100));
		IJ.log("== Next well "+nextwell+" == ");
		IJ.log("Previous well #"+lastVal+"#");
		IJ.log("Current well #"+currentVal+"#");
		var W = Well2pos(currentVal,M,true);
		IJ.log(dash.repeat(100));

		S['ROWINPUT']++;
		S['picno'] = 1;
		S['Xpos']  = W['x'];
		S['Ypos']  = W['y'];
		S['well']  = W['name'];
		S['orf']  = O;
		
		S['TOTALCELLS'] = 0;
		S['NCELLS']     = 0;
		S['NKEEP']      = 0;
		S['CELLCOPIED'] = 0; 
		S['NDROP']      = 0;

		S['xcellgrid']  = 0;
		S['ycellgrid']  = 0;
		nextwell=false;
	}
}

function Overlay2Cells(overlays, imp, ip){ 
	var cells = new Array();
	for( var iroi=0; iroi < overlays.size(); iroi++){
		ROI = overlays.get(iroi);
		if( ROI == null ){ IJ.log("THIS OVERLAY (num="+(iroi)+") DOES NOT EXISTS !"); continue; }
		var Cell = new cell();
		Cell.type = "cell";
		Cell.ROIobj = ROI; 
		Cell.idx = iroi;
		Cell.area = Cell.measureROI(imp,ip,"area");
		Cell.x = Cell.measureROI(imp,ip,"xCenterOfMass");
		Cell.y = Cell.measureROI(imp,ip,"yCenterOfMass");
		cells.push(Cell);
	}
 	return(cells);
}

function getImageSegmented(segIMG){
	IJ.log("(1.a) Open segmented image");
	var cellimp = null;
	var msg =  "Path to image with segmented cells : " + segIMG;
	if( !segIMG.exists() ){ 
		IJ.log(msg +" [FILE NOT FOUND]"); 
	}
	var cellimp = IJ.openImage(segIMG);
	return(cellimp);
}

function getCells(imp){
	IJ.log("(1.b) Retrieve overlays in segmented image and convert to cell ROIs");
	var cells = new Array();
	var ip = imp.getProcessor();
	var overlays = imp.getOverlay(); // Get the cell overlays from the image with segmented cells
	imp.show();
  	if( overlays != null ){ cells = Overlay2Cells(overlays,imp,ip); }
	imp.close();
	return(cells);
}

function getCellSelection(selfile,S){
	if(File(selfile).exists()){
		var fileContent = IJ.openAsString(selfile);
		var lines = fileContent.split("\n");
	}else{
		IJ.log("NO PRESELECTION OF CELLS");
	}
}

function makeCellGrid(GRID,IMG,C,M,S){
	IJ.log("(3) Crop and tile cells from current well image to cell grid");
	var wellLABELS = new Overlay();
	var cellLABELS = new Overlay();	

	// START COPYING CELLS IN CURRENT CHANNEL
	if( S['COPY'] && S['CELLCOPIED'] < M['CELLPERWELL'] && S['picno'] <= M['PICPERWELL'] ){
	  	IMP = IJ.openImage(IMG);
	  	IMP.show();
		IJ.run(IMP, "Gaussian Blur...", "sigma=1.00");
		IJ.run(IMP, "Subtract Background...", "rolling=50");
	  	IJ.run(IMP, "Enhance Contrast", "saturated=0.35");
	  	IP = IMP.getProcessor();

  		for( icell=0; icell < C.length && S['COPY'] && S['CELLCOPIED'] < M['CELLPERWELL']; icell++){
		  	//IJ.log("SELECTED CELL INDEX IN PIC "+ipic+" : "+indCellPIC+" (nCells = "+nover+" kept="+nkept+" arrayL = "+CELLS.length+")");
		  	var stats = C[icell].getStats(IMP,IP);
		  	if(stats.max > S['MAXINT']){  S['MAXINT']=stats.max; }

			var localX = S['xcellgrid']*M['pxCELL'];
			var localY = S['ycellgrid']*M['pxCELL'];

			// COPY CELL ROI FROM WELL PICTURE
			IJ.selectWindow(IMP.getTitle());
			IJ.makeRectangle(Math.floor(C[icell].x-M['pxCELL']/2), Math.floor(C[icell].y-M['pxCELL']/2), M['pxCELL'], M['pxCELL']);
			IJ.run(IMP,"Copy","");

			// #### PASTE TO MONTAGE 8-BIT IMAGE (THROUGH TEMPORARY 8-BIT IMAGE)  ####
			// CREATE A TEMPORARY IMAGE OF CELL SIZE
			TMP = IJ.createImage("TMP_CELL",M['BITMODE'],M['pxCELL']+1,M['pxCELL']+1,1);
			TMP.show();
			// PASTE THE CELL IN THE TEMPORARY 8-bits IMAGE
			IJ.selectWindow("TMP_CELL");
			tmpROI = new Roi(1,1,M['pxCELL'],M['pxCELL']);
			TMP.setRoi( tmpROI );
			IJ.run(TMP,"Paste","");
			
			// COPY THE TMP CELL IMAGE FROM 8bits
			IJ.run(TMP,"Copy","");
			TMP.changes = false; // No "save changes" dialog
			TMP.close();

			// PASTE IT TO ROI ON GRID
			IJ.selectWindow(GRID.getTitle());
			cellROI = new Roi(localX, localY, M['pxCELL'], M['pxCELL']);
			if( icell == C.length-1 ){
				cellROI.setStrokeWidth(0.2);
				cellROI.setStrokeColor(Color.blue);
			}else{
				cellROI.setStrokeWidth(0.1);
				cellROI.setStrokeColor(Color.gray);
			}
			cellROI.setName(C[icell].idx);
			RM.addRoi(cellROI);
			//cellLABELS.add(cellROI,C[icell].idx); // CELL LABEL
			//cellLABELS.setLabelColor(Color.white);
			//IJ.run("To ROI Manager", "");
			GRID.setRoi(cellROI);
			IJ.run(GRID,"Paste","");
			S['xcellgrid']++;
			if(S['xcellgrid'] == M['CELLPERSIDE']){
				S['xcellgrid']=0;
				S['ycellgrid']++;	
			}
			S['CELLCOPIED']++;
		}
	    IMP.changes=false;
	    IMP.close();
  	}
  	
  	if( S['picno'] == M['PICPERWELL'] || S['LASTROW']){
		IJ.log("PICNUM="+S['picno'] + " PIC PER WELL " + M['PICPERWELL']+" CH = "+S['channel'] );
		IJ.selectWindow(GRID.getTitle());
		IJ.log("====> ADD WELL LABEL <====");
		IJ.log("WELL "+S['well']+" PLATE COORDINATES X="+S['Xpos']+" Y="+S['Ypos']+" ( PICNUM "+S['picno']+")");
		IJ.log("TOTAL CELLS = "+S['TOTALCELLS']+" (COPIED="+S['CELLCOPIED']+")");
		wellROI = new Roi(0,0,M['WELLSIDE'],M['WELLSIDE']);
		wellROI.setStrokeWidth(2);
		wellROI.setStrokeColor(Color.yellow);
  		wellROI.setName(S['well']+"_"+S['orf']);
  		RM.addRoi(wellROI);
		RM.moveRoisToOverlay(GRID);
		IJ.run("Show Overlay", "");
		IJ.run("Labels...", "font=18 show use bold");
	 	IJ.saveAs(GRID, "Tiff", OUTDIR + '/' + GRID.getTitle());
		GRID.changes=false;
		GRID.close();
	}

}




///---------------------------- MAIN ----------------------------///
IJSetup();
MONTAGE=initMontageParams();

/// USER INPUT
PARAMFILE = "/media/elusers/users/benjamin/A-PROJECTS/01_PhD/04-image-analysis/JS4Fiji/input-for-cell-grid-montage.tsv"; // ARGV[0]
IJ.log('PARAMFILE '+PARAMFILE);
OUTPATH   = "/media/elusers/users/benjamin/A-PROJECTS/01_PhD/04-image-analysis/JS4Fiji/"; // ARGV[1] or dirname(ARGV[0])
IJ.log('OUTPATH '+ OUTPATH);
OUTDIR = dirname(OUTPATH,'/');
IJ.log('OUTDIR '+ OUTDIR);
SCREENNAME = 'test-cellgrid';
IMGTYPE     = "8-bit";
name  = SCREENNAME + "_" + IMGTYPE;
MONTAGEtype  = IMGTYPE + " black";

PICPERWELL  = 8;  ///INPUT/// HERE INDICATE HOW MANY PICTURES WERE TAKEN PER WELL
CELLSIZE    = 65; ///INPUT/// HERE INDICATE HOW MANY PIXELS PER SIDE FOR CROPPING CELLS
CELLSIDE    = 15; ///INPUT/// HERE INDICATE HOW MANY CELLS PER SIDE OF THE CELL GRID

IN=openTable(PARAMFILE,'\t',true);
INPUT = IN['data'];
HEADER = IN['fields'].join(" ");
//var regexChannel = new RegExp('c[0-9]','gi');
var CHANNELS = HEADER.match(/c[0-9]/gi);
//var CHANNELS = regexChannel.exec();
IJ.log("COLUMNS NAMES FOR CHANNELS ARE : " + CHANNELS);

///INPUT/// FINALLY YOU NEED TO DEFINE THE LUT, WHICH CORRESPONDS TO THE COLORSPACE THAT NEEDS TO BE USED TO REPRESENT INTENSITIES (for example RFP is displayed as red pixels)
LUT=new Array("Grays","Green","Red","Cyan");
///INPUT/// HERE IS THE OUPTUT DIRECTORY FOR THE MONTAGE IMAGE
var MontageFolder = File(OUTDIR);
if(!MontageFolder.exists()){ 
	IJ.log("====> Output directory does not exist!");
	IJ.log("Creating directory '"+OUTDIR+"'...");
	MontageFolder.mkdir();
}

setMontageParam(MONTAGE,"PICPERWELL",PICPERWELL);
setMontageParam(MONTAGE,"CELLPERSIDE",CELLSIDE);
setMontageParam(MONTAGE,"pxCELL",CELLSIZE);
setMontageParam(MONTAGE,"FILENAME",name);
setMontageParam(MONTAGE,"BITMODE",IMGTYPE);
setMontageParam(MONTAGE,"BACKGROUND",'black');
MONTAGE = updateMontageParams(MONTAGE);
IJ.log("Name of the Montage     : "+MONTAGE['FILENAME']);
IJ.log("Montage Image type      : "+MONTAGE['BITMODE']);
IJ.log("Montage Width           : "+MONTAGE['WIDTH']);
IJ.log("Montage Height          : "+MONTAGE['HEIGHT']);

///------------------------------------------------END OF USER INPUT------------------------------------------------///
//inCELLAREA = 500;
//maxCELLAREA = 3500;

IJ.run("Close All", "");
initRM();
getMontageAllParams(MONTAGE); // PRINTING MONTAGE PARAMETERS
var STATUS = initCopyStatus(MONTAGE['pxBORDER'],MONTAGE['pxBORDER']);
var t0 = new Date().getTime();

var CELLGRID;
for(var ich=0; ich<CHANNELS.length; ich++){

	var ch = CHANNELS[ich];
	IJ.log('current channel is '+ch);
	STATUS['channel'] = ch;
	
	for(var irow=0; irow<INPUT.length; irow++){

		var t1 = new Date().getTime();
		
		STATUS['LASTROW'] = (irow == INPUT.length-1);
		if(MONTAGE['skipFirstPIC']){ IJ.log("...SKIPPING THE FIRST PICTURE OF THE WELL..."); STATUS['picno']++; continue; }
	
		// CHECK IF WELL HAS BEEN VISITED
		NextWell(STATUS['well'], INPUT[irow]['well'], MONTAGE,STATUS,INPUT[irow]['orf']);
	
		IJ.log("(1) Get detected cells in segmented image from (channel c0)");
		// READ IMAGE FILE WITH SEGMENTED CELLS
		var SEG = getImageSegmented(INPUT[irow]['c0']);
		if( SEG == null ){ STATUS['picno']++; continue; }
		
		// RETRIEVE SEGMENTED CELLS
		var CELLS = getCells(SEG);
		STATUS['NCELLS'] = CELLS.length;
		IJ.log("=> Number of cells detected in segmented image : "+STATUS['NCELLS']);
		if( CELLS.length == 0 ){ STATUS['COPY'] == false;  STATUS['picno']++;  continue; }
		else{ STATUS['COPY'] = true; }
		STATUS['NKEEP'] = STATUS['NCELLS'] - STATUS['NDROP'];
		STATUS['TOTALCELLS'] += STATUS['NKEEP'];
	
		// CREATE A LARGE BLANK IMAGE FOR THE MONTAGE WITH A NAME BASED ON PLATE NUM AND CHANEL CHOOSED
		//var MONTAGEimp=IJ.createImage(MONTAGE['FILENAME'],MONTAGE['BITMODE']+" "+MONTAGE['BACKGROUND'],MONTAGE['WIDTH'],MONTAGE['HEIGHT'],1);	
		//IJ.log("Show Montage window");
		//MONTAGEimp.show();

		var IMG = INPUT[irow][ch];
		if(	!IMG.exists ){ IJ.log("IMAGE FROM CHANNEL "+IMG+" IS MISSING"); ipic++; continue; }
		
		if( STATUS['picno'] == 1 ){
			initRM(RM); // Clear ROI manager
			// Create grid image for current well
			var wellname = INPUT[irow]['orf']+"_"+INPUT[irow]['plate']+"_"+INPUT[irow]['well']+"_"+ch ;
			IJ.log('==> CELL GRID IMAGE = '+wellname);
			CELLGRID = IJ.createImage(wellname,MONTAGE['BITMODE']+" "+MONTAGE['BACKGROUND'],MONTAGE['WELLSIDE'],MONTAGE['WELLSIDE'],1);	
			IJ.run(CELLGRID, LUT[ich], "");
			CELLGRID.show();
		}

		makeCellGrid(CELLGRID, IMG, CELLS, MONTAGE, STATUS);

		
		if( STATUS['picno'] == MONTAGE['PICPERWELL'] ){
			IJ.log(equal.repeat(100));
			var t1 = new Date().getTime();
			IJ.log("PROCESSING WELL " + INPUT[irow]['well'] + " TOOK : " + Math.round((t1-t0)/1000) + "sec");
			IJ.log(equal.repeat(100));
		}
	
		while(CELLS.length > 0 ){ CELLS.pop(); }
		IJ.log("NCELLS="+STATUS['NCELLS']+" KEPT="+STATUS['NKEEP'] + " DROPPED="+STATUS['NDROP']);
		STATUS['picno']++;
		IJ.log(space.repeat(100));
	}


}

IJ.log(star.repeat(100));
var t5=new Date().getTime();
IJ.log("TOTAL TIME TAKEN FROM WELL " + INPUT[0]['well'] + " TO WELL " + INPUT[INPUT.length-1]['well'] + " : " + Math.round((t5-t0)/1000) + " sec " );
IJ.log(space.repeat(100));
