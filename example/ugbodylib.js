
/**
 * Ult1's Gravitational Body,  
 * _**don't use this class**_, instead call new `uGBodyManager().addBody(...)` or `(...).addAttractor(...)`
 * 
 * you should also probably call: `bmanager.run( function(frames, crntBody, bodysIndex){ ... } )`
 * 
 * If you want to seperate your stuff, just make a new instance of uGBodyManager
*/
class uGBody {

    /**
     * Variable for gravitational attraction. You can change this if you'd like, it should look better if it is only changed at the very start however.
     * @default 0.01 just a nice value.
     * @static
     * 
    */
    static G = 0.01

    /**
     * @param {uVector3} pos starting position
     * @param {Number}  mass mass of this object
     * @param {uVector3} vel starting velocity
    */
    constructor (pos, mass, vel){
        /**@private*/
        this.position = pos;
        /**@private*/
        this.velocity = vel;
        /**@private*/
        this.UUID = uGBody.getUUID()
        /**@private*/
        this.mass = mass | 1;
    }

    /**
     * Main gravity function. Is called internally.
     * @private
    */
    gravity(bodies, attractors) {
        // F = G * (m1*m2) / r^2
        let overall = new uVector3();

        for(let i = 0; i < bodies.length - -attractors.length; i ++){
            const body = i < bodies.length ? bodies[i] : attractors[i - (bodies.length)]
            
            if(this.UUID == body.UUID)
                continue;

            const m = this.mass * body.mass;
            const r2 = this.position.dist(body.position);

            const force = uGBody.G * ((m / r2) * r2);
            const direction = body.position.subtract(this.position).normalize();

            direction.mulf(force);
            overall.add(direction);

        }

        this.velocity.add(overall)
        return this;
    }

    /**
     * `this.position.add(this.velocity.dividef(this.mass))`  
     * ~that's it.
     * @private
    */
    updatePosition() {
        this.position.add(this.velocity.dividef(this.mass))
        return this;
    }

    getPosition(){
        return this.position;
    }

    getX(){return this.position.x;}
    getY(){return this.position.y;}
    getZ(){return this.position.z;}

    /**
     * It might be useful to make an actual UUID gen, but I can't be bothered right now & if you have enough objects affected by gravity for this to matter, why are you reading this right now? This is a Javascript library for fun.
    */
    static getUUID(){
        let UUID = Math.random();
        return UUID;
    }

}

/**
 * #### My custom, basic (x, y, z) vector class.  
 * vector3.add(), .sub(), mul..., div aren't pure.  
 * mulf, divf, dividef accept a number as an argument.  
 * subtract ... are pure and simply return the result.  
*/
class uVector3 {
    constructor(x, y, z){ this.x = x || 0; this.y = y || 0; this.z = z || 0; }
    add (vec){ this.x += vec.x; this.y += vec.y; this.z += vec.z; return this; }
    sub (vec){ this.x -= vec.x; this.y -= vec.y; this.z -= vec.z; return this; }
    mul (vec){ this.x *= vec.x; this.y *= vec.y; this.z *= vec.z; return this; }
    div (vec){ this.x /= vec.x; this.y /= vec.y; this.z /= vec.z; return this; }

    mulf (float){ this.x *= float; this.y *= float; this.z *= float; return this; }
    divf (float){ this.x /= float; this.y /= float; this.z /= float; return this; }
    dividef (float){ return new uVector3 ( this.x / float, this.y / float, this.z / float) }

    subtract (vec){ return new uVector3 ( this.x - vec.x, this.y - vec.y, this.z - vec.z ) }
    divide   (vec){ return new uVector3 ( this.x / vec.x, this.y / vec.y, this.z / vec.z) }

    normalize(){
        let a = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)
        return new uVector3( this.x / a, this.y / a, this.z / a )
    }
    dist (vec){
        const x = vec.x - this.x, y = vec.y - this.y, z = vec.z - this.z;
        return Math.sqrt(x*x + y*y + z*z)
    }
}

/**
 * ### Main class
 * 
 * create an instance of this, add a bunch of bodies & (if you want) attractors & call run on it, with your own show() function.
 * 
 * @example
 * const [ w, h ] = [ screen.width, screen.height ]
 * const _id = string => document.getElementById(string)
 * // created with html <p id="p1">body elt #1 with positon: abs...</p>
 * const paragraphaps = [ _id("p1"), _id("p2"), _id("p3"), _id("p_attractor")]
 * 
 * const bm = new uGBodyManager();
 * 
 * bm.addAttractor(new uVector3(w / 2, h / 2, 0), 100)
   bm.addBody(new uVector3(w / 2.5, h / 2.5, 0), 10, new uVector3(0, 200, 0))
   bm.addBody(new uVector3(w / 1.5, h / 1.5, 0), 10, new uVector3(0, -200, 0))
   bm.addBody(new uVector3(w / 1.5, h / 2, 0), 10, new uVector3(0, -200, 0))
 * 
   bm.run(function(frames, body, index, isBody){
        if(isBody) {
            paragraphs[index].style.left = body.position.x + "px"
            paragraphs[index].style.top  = body.position.y + "px"
        } else {
            paragraphs[3].style.left = body.position.x + "px" // attractor in this case!
            paragraphs[3].style.top  = body.position.y + "px"
        }
    })
*/
class uGBodyManager {

    constructor (){
        this.bodies = []
        this.attractors = []
        this.frameCount = 0;
        this.shouldStop = false;
    }

    /** 
     * Adds a body that's affected by gravity and other bodies. Stores these bodies in an array under the hood.
     * @param {uVector3} position - starting x, y, z position
     * @param {float} mass - mass
     * @param {uVector3} velocity - starting x, y, z velocity, good for upward velocity
    */
    addBody(position, mass, velocity){
        this.bodies.push(new uGBody(position, mass, velocity))
        
    }

    /** 
     * Adds a body that ONLY affects other bodies, it itself is not affected by gravity. Stores these bodies in an array under the hood.
     * (this velocity = 0)
     * @param {uVector3} position - starting x, y, z position
     * @param {float} mass - mass
    */
    addAttractor(position, mass){
        this.attractors.push(new uGBody(position, mass, null))
    }

    /**
     * Once called, runs every ~15 milliseconds _(setTimeout(thisFxn(), 15))_,
     * Loops through every body, ~~does~~ it's gravity & position, and calls your `show()` 
     * 
     * **This calls show() TWICE!** Once for bodies & once for attractors!  
     * _"isBody" = true if looping thru bodies_
     * 
     * You can stop this by calling _(uGBodyManager instance/variable)_`.stop()`
     * @param {(frameCount: number, body: uGBody, index: number, isbody: boolean)} show abstract function(you do it) for working with this body's data.
     */
    run(show){
        if(this.shouldStop)
            return this;
        
        let i = 0;
        for(const body of this.bodies){
            body.gravity(this.bodies, this.attractors); 
            body.updatePosition()
            show(this.frameCount, body, i, true)
            i ++
        }

        for(const i in this.attractors)
            show(this.frameCount, this.attractors[i], i, false)

        this.frameCount ++;

        setTimeout(this.run.bind(this, show), 15)
        return this;
    }

    /**
     * **Stops this instance of uGBodyManager.**  
     * Does nothing, if `.run()` was not previously called.  
     * Can be restarted by calling `.restart()` & `.run(yourfxn)` again.
     * */
    stop(){
        this.shouldStop = true;
        return this;
    }

    /**
     * **Restarts this instance of uGBodyManager.**  
     * Does nothing, if `.stop()` was not previously called.  
     * */
    restart(){
        this.shouldStop = false;
        return this;
    }
}

// * An example:    (the one on uGBodyManager, but actually working.)
/* 

const [ w, h ] = [ screen.width, screen.height ]

let paragraphs = []
for(let i = 0; i < 4; i ++){
    const p = document.createElement("p")
    document.body.appendChild(p);
    p.innerText = "body" + i;
    p.style.position = "absolute";
    paragraphs.push(p)
}

paragraphs[3].innerText = "attractor";

const bm = new uGBodyManager();

bm.addAttractor(new uVector3(w / 2, h / 2, 0), 100)
bm.addBody(new uVector3(w / 2.5, h / 2.5, 0), 10, new uVector3(0, 200, 0))
bm.addBody(new uVector3(w / 1.5, h / 1.5, 0), 10, new uVector3(0, -200, 0))
bm.addBody(new uVector3(w / 1.5, h / 2, 0), 10, new uVector3(0, -200, 0))

bm.run(function(frames, body, index, isBody){
     if(isBody) {
         paragraphs[index].style.left = body.position.x + "px"
         paragraphs[index].style.top  = body.position.y + "px"
     } else {
         paragraphs[3].style.left = body.position.x + "px" // attractor in this case!
         paragraphs[3].style.top  = body.position.y + "px"
     }
 })

*/



