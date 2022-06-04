
const [ w, h ] = [ screen.width, screen.height ]

let images = []
for(let i = 0; i < 4; i ++){
    const img = document.createElement("img")
    document.body.appendChild(img);
    img.src = "java.png"
    img.style.position = "absolute";
    images.push(img)
}

images[3].src = "ult1.png"

const bm = new uGBodyManager();

bm.addAttractor(new uVector3(w / 2, h / 2, 0), 100)

bm.addBody(new uVector3(w / 2.5, h / 2.5, 0), 10, new uVector3(0, 200, 0))
bm.addBody(new uVector3(w / 1.5, h / 1.5, 0), 10, new uVector3(0, -200, 0))
bm.addBody(new uVector3(w / 1.5, h / 2, 0), 10, new uVector3(0, -200, 0))

const show = function(frames, body, index, isBody){
    if(isBody) {
        images[index].style.left = body.getX() + "px"
        images[index].style.top  = body.getY() + frames / 2 + "px"
    } else {
        images[3].style.left = body.getX() + "px"
        images[3].style.top  = body.getY() + frames / 2 + "px"
    }
}

bm.run(show)

document.onclick = function (){
    if(!bm.shouldStop)
        bm.stop();
    else {
        bm.restart().run(show)
    }
}
