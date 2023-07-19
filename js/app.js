const fileBtn = document.querySelector("#input-field");
const uploadBtn = document.querySelector("#upload");
const saveBtn = document.querySelector("#save-now");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");
var canvas = document.querySelector("#img-box");
var isDark = false;
const cropButtonDOM = document.getElementById("crop-button");
var beforeExpImagedata;
var isExpRangeVisible = false;
var ctx = canvas.getContext("2d");
const changeControl = {
    prevImage: null,
    currentImage: null,
    nextImage: null,
};
var flag=true;
const themeSwitch = document.querySelector('input');

const fileInput = document.querySelector("#input-field");
const widthInput = document.querySelector("#input_width");
const heightInput = document.querySelector("#input_height");
const aspectToggle = document.querySelector("#check_aspect-ratio");
const canvasCtx = canvas.getContext("2d");
themeSwitch.addEventListener('change', () => {
	if (!isDark) {
		document.getElementById("dark").style.display = "none"
		document.getElementById("light").style.display = "block"
	}
	else {
		document.getElementById("dark").style.display = "block"
		document.getElementById("light").style.display = "none"
	}
	isDark = !isDark;
  document.body.classList.toggle('dark-theme');
});


const Root = document.documentElement
const gRoot = getComputedStyle(Root)

var RotateDeg = parseInt(gRoot.getPropertyValue('--turn'))

function rotate() {
    ctx.save();
  
    ctx.translate(canvas.width, 0);                   
    ctx.rotate(Math.PI*0.5);                 
    ctx.globalCompositeOperation = "copy";   
    ctx.drawImage(ctx.canvas,  0, 0, canvas.height, canvas.width); 
    ctx.restore();
   


function unDo(){
    if(changeControl.prevImage){
        if(document.getElementById("img-box").style.display=='none'){
            document.getElementById("img-box").style.display='block';
            document.querySelector("div.uploaded-img-container").style.display = "none";
        }
        undoBtn.classList.add("disabled");
        redoBtn.classList.remove("disabled");
        ctx.putImageData(changeControl.prevImage, 0, 0);
        changeControl.nextImage = changeControl.currentImage;
        changeControl.currentImage = changeControl.prevImage;
        changeControl.prevImage = null;
    }
}


const doCrop = (initialCoords, imageData, event) => {
   ctx.putImageData(imageData, 0, 0);
   const rect = canvas.getBoundingClientRect();
   const coords = {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
   };
   ctx.strokeRect(initialCoords.x, initialCoords.y, coords.x, coords.y);
};


const endCrop = (initialCoords, event) => {
    
    document.body.style.cursor = "default";
   const rect = canvas.getBoundingClientRect();
   const coords = {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
   };

   
   const croppedImage = ctx.getImageData(
      initialCoords.x + 1,
      initialCoords.y + 1,
      Math.abs(initialCoords.x - coords.x),
      Math.abs(initialCoords.y - coords.y)
   );

  
   var old_element = canvas;
   var new_element = old_element.cloneNode(true);
   old_element.parentNode.replaceChild(new_element, old_element);
   canvas = new_element;
   ctx = canvas.getContext("2d");

   
   ctx.putImageData(croppedImage, initialCoords.x, initialCoords.y);
};


const startCrop = (imageData, event) => {
    
    document.body.style.cursor = "crosshair";
    
   const rect = canvas.getBoundingClientRect();
   const initialCoords = {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
   };
   canvas.addEventListener("mousemove", (event) => doCrop(initialCoords, imageData, event));
   canvas.addEventListener("mouseup", (event) => endCrop(initialCoords, event));
};


const cropImage = () => {
   var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   canvas.addEventListener("mousedown", (event) => startCrop(imageData, event));
};



let activeImage, originalWidthToHeightRatio;

fileInput.addEventListener("change", (e) => {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    openImage(reader.result);
  });

  reader.readAsDataURL(e.target.files[0]);
});

widthInput.addEventListener("change", () => {
  if (!activeImage) return;

  const heightValue = aspectToggle.checked
    ? widthInput.value / originalWidthToHeightRatio
    : heightInput.value;

  resize(widthInput.value, heightValue);
});

heightInput.addEventListener("change", () => {
  if (!activeImage) return;

  const widthValue = aspectToggle.checked
    ? heightInput.value * originalWidthToHeightRatio
    : widthInput.value;

  resize(widthValue, heightInput.value);
});

function openImage(imageSrc) {
  activeImage = new Image();

  activeImage.addEventListener("load", () => {
    originalWidthToHeightRatio = activeImage.width / activeImage.height;

    resize(activeImage.width, activeImage.height);
  });

  activeImage.src = imageSrc;
}

function resize(width, height) {
  canvas.width = Math.floor(width);
  canvas.height = Math.floor(height);
  widthInput.value = Math.floor(width);
  heightInput.value = Math.floor(height);

  canvasCtx.drawImage(activeImage, 0, 0, Math.floor(width), Math.floor(height));
  canvasCtx.putImageData(activeImage, 0, 0, Math.floor(width), Math.floor(height));
}

const showExposureRange = () => {
   if (!isExpRangeVisible) {
      document.getElementById("exposure-icon").style.display = "none";
      document.getElementById("exposure-range").style.display = "block";
      beforeExpImagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
      isExpRangeVisible = true;
   }
};


const changeExposure = (event) => {
   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   const val = event.target.value;
   for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = beforeExpImagedata.data[i] + 255 * (val / 100);
      imageData.data[i + 1] = beforeExpImagedata.data[i + 1] + 255 * (val / 100);
      imageData.data[i + 2] = beforeExpImagedata.data[i + 2] + 255 * (val / 100);
   }
   ctx.putImageData(imageData, 0, 0);
};


function reDo(){
    if(changeControl.nextImage){
        redoBtn.classList.add("disabled");
        undoBtn.classList.remove("disabled");
        ctx.putImageData(changeControl.nextImage, 0, 0);
        changeControl.prevImage = changeControl.currentImage;
        changeControl.currentImage = changeControl.nextImage;
        changeControl.nextImage = null;
    }
}


function remove()
{
    flag=true;
document.getElementById("img-box").style.display='none';
ctx.clearRect(0, 0, canvas.width, canvas.height);
document.querySelector("div.uploaded-img-container").style.display = "block";
flag=true;

}


function applyFilter(filter){
    redoBtn.classList.add("disabled");
    undoBtn.classList.remove("disabled");
    changeControl.nextImage = null;
    changeControl.prevImage = changeControl.currentImage;
    switch(filter){
        case "grey":
            doGreyScale();
            break;
        case "sepia":
            doSepia();
            break;
        case "lark":
            doLark();
            break;
        case "amaro":
            doAmaro();
            break;
        case "flip":
            doFlip();
            break;
        case "sunset":
            doSunset();
            break;
        case "rainbow":
            doRainbow();
            break;
        case "prison":
            doPrison();
            break;
        case "crumble":
            doCrumble();
            break;
        case "remove":
            remove();
            
    }
    changeControl.currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}


var uploaded_img = "";


function uploadbtnActive(){
    flag=true;
    fileBtn.click();
   
}


function doGreyScale(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(var i = 0; i < data.length; i += 4){
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
}


function doSepia(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(let i = 0; i < data.length; i += 4){
        data[i]*=1.07;
        data[i + 1]*=0.74;
        data[i + 2]*=0.43;
    }
    ctx.putImageData(imageData, 0, 0);
}


function doLark(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    brightness(data,0.08);
    rgbAdjust(data,[1,1.03,1.05]);
    saturation(data,0.12);
    ctx.putImageData(imageData, 0, 0);
}


function doAmaro(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    brightness(data,0.15);
    saturation(data,0.3);
    ctx.putImageData(imageData, 0, 0);
}


function doFlip(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(let i = 0; i < data.length; i += 4){
        var d1=data[i];
        var d2= data[i+1];
        var d3=data[i+2];
        data[i]=d2;
        data[i + 1]=d3;
        data[i + 2]=d1;
    }
    ctx.putImageData(imageData, 0, 0);
}


function doSunset(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(let i=0;i<data.length;i+=4){
        data[i]=255;
    }
    ctx.putImageData(imageData, 0, 0);

}


function doRainbow(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
   for(let i=0;i<data.length;i+=4){
       var avg= (data[i]+data[i+1]+data[i+2])/3;
       if(i>=0 && i<data.length/7){
           if(avg<128){
               data[i]=2*avg;
               data[i+1]=0;
               data[i+2]=0;
           }
           else if(avg>=128){
               data[i]=255;
               data[i+1]=(2*avg)-255;
               data[i+2]=(2*avg)-255;
           }
       }

       if(i>=data.length/7 && i<(data.length*2)/7){
        if(avg<128){
            data[i]=2*avg;
            data[i+1]=0.8*avg;
            data[i+2]=0;
        }
        else if(avg>=128){
            data[i]=255;
            data[i+1]=(1.2*avg)-51;
            data[i+2]=(2*avg)-255;
        }
       }

       if( i>=(data.length*2)/7 && i<data.length*3/7){
        if(avg<128){
            data[i]=2*avg;
            data[i+1]=2*avg;
            data[i+2]=0;
        }
        else if(avg>=128){
            data[i]=255;
            data[i+1]=255;
            data[i+2]=(2*avg)-255;
        }
       }

       if( i>=data.length*3/7 && i<data.length*4/7){
        if(avg<128){
            data[i]=0;
            data[i+1]=2*avg;
            data[i+2]=0;
        }
        else if(avg>=128){
            data[i]=(2*avg)-255;
            data[i+1]=255;
            data[i+2]=(2*avg)-255;
        }
       }

       if( i>=data.length*4/7 && i<data.length*5/7){
        if(avg<128){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=2*avg;
        }
        else if(avg>=128){
            data[i]=(2*avg)-255;
            data[i+1]=(2*avg)-255;
            data[i+2]=255;
        }
       }

       if( i>=data.length*5/7 && i<data.length*6/7){
        if(avg<128){
            data[i]=0.8*avg;
            data[i+1]=0;
            data[i+2]=2*avg;
        }
        else if(avg>=128){
            data[i]=(1.2*avg)-51;
            data[i+1]=(2*avg)-255;
            data[i+2]=255;
        }
       }

       if( i>=data.length*6/7 ){
        if(avg<128){
            data[i]=1.6*avg;
            data[i+1]=0;
            data[i+2]=1.6*avg;
        }
        else if(avg>=128){
            data[i]=(0.4*avg)+153;
            data[i+1]=(2*avg)-255;
            data[i+2]=(0.4*avg)+153;
        }
       }

        

   }
    ctx.putImageData(imageData, 0, 0);

}



function doPrison(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(let i=0;i<data.length;i+=4){
        if(i>=0 && i<1195){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=0;
        }
        if(i>=data.length/6 && i<(data.length/6)+10+1195){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=0;
        }
        if(i>=data.length*2/6 && i<(data.length*2/6)+10+1195){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=0;
        }
        if(i>=data.length*3/6 && i<(data.length*3/6)+10+1195){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=0;
        }
        if(i>=data.length*4/6 && i<(data.length*4/6)+10+1195){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=0;
        }
        if(i>=data.length*5/6 && i<(data.length*5/6)+10+1195){
            data[i]=0;
            data[i+1]=0;
            data[i+2]=0;
        }
       
    }

    ctx.putImageData(imageData, 0, 0);
}


//crumble filter
function doCrumble(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(let i=0;i<data.length;i+=4){
        var ran=Math.random();
        if(ran>0.5){
            var p=i+1;
            data[p]=data[i];
            data[p+1]=data[i+1];
            data[p+2]=data[i+2];

        }
    }
    ctx.putImageData(imageData, 0, 0);
}


function brightness(data,val){
    if(val<=-1){
        val=-1;
    }
    if(val>=1){
        val=1;
    }
    val=~~(255*val);
    for(let i=0;i<data.length;i+=1){
        data[i]+=val;
    }
}


function saturation(data,val){
    if(val<=-1){
        val=-1;
    }
    for(let i=0;i<data.length;i+=4){
        let gray=0.2989*data[i]+0.1140*data[i+2]+0.5870*data[i+1];
        data[i]= -gray*val+data[i]*(1+val);
        data[i+1]= -gray*val+data[i+1]*(1+val);
        data[i+2]= -gray*val+data[i+2]*(1+val);
    }
}


function rgbAdjust(data,vals){
    for(let i=0;i<data.length;i+=4){
        data[i]*=vals[0];
        data[i+1]*=vals[1];
        data[i+2]*=vals[2];
    }
}


rangeInput = document.getElementById('range');

container = document.getElementsByClassName('img-box')[0];

rangeInput.addEventListener("mousemove",function(){
container.style.filter = "brightness(" + rangeInput.value + "%)";
});


saveBtn.addEventListener("click", function(){
    if(flag) {alert("Please upload image");}
  else  {
        flag=true;
    const downloadImg = canvas.toDataURL("image/png");
    saveBtn.href = downloadImg;
    saveBtn.download = "image.png";
    flag=true;
    }
   
});


fileBtn.addEventListener('change', function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const reader = new FileReader();
    reader.addEventListener('load',() => {
        uploaded_img = reader.result;
        const image = new Image();
        image.src = uploaded_img;
      
        image.onload = () => {
            document.querySelector("div.uploaded-img-container").style.display = "none";
            canvas.style.display = "block";
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            changeControl.currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            flag=false;
        };
    });
    reader.readAsDataURL(this.files[0]);
});

cropButtonDOM.addEventListener("click", cropImage);


let saturate = 100;
let huerotate = 0;
let blur = 0;
let opacity = 100;

const imgture = document.getElementById("img-box");

const saturateSlider = document.getElementById("saturate-slider");
const saturateValue = document.getElementById("saturate");

const hueSlider = document.getElementById("hue-slider");
const hueValue = document.getElementById("hue");

const blurSlider = document.getElementById("blur-slider");
const blurValue = document.getElementById("blur");

const opacitySlider = document.getElementById("opacity-slider");
const opacityValue = document.getElementById("opacity");

function updateFilter() {
    imgture.style.filter =
        "saturate(" +
        saturate +
        "%) hue-rotate(" +
        huerotate +
        "deg) blur(" +
        blur +
        "px) opacity(" +
        opacity +
        "%)";
}

saturateSlider.addEventListener("input", function() {
    saturateValue.innerHTML =  saturateSlider.value + "%";
    saturate =  saturateSlider.value;
    updateFilter();
});

hueSlider.addEventListener("input", function() {
    hueValue.innerHTML = hueSlider.value + "°";
    huerotate = hueSlider.value;
    updateFilter();
});

blurSlider.addEventListener("input", function() {
    blurValue.innerHTML = blurSlider.value + "px";
    blur = blurSlider.value;
    updateFilter();
});

opacitySlider.addEventListener("input", function() {
    opacityValue.innerHTML = 100 - opacitySlider.value + "%";
    opacity = 100 - opacitySlider.value;
    updateFilter();
});