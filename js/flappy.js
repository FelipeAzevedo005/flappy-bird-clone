function newElement(tagName, className) {
    const element = document.createElement(tagName);
    element.className = className;
    
    return element;
}

class Pipe {
    constructor(reverse = false) {
        this.element = newElement('div', 'pipe');

        const edge = newElement('div', 'edge');
        const body = newElement('div', 'body');
        
        this.element.appendChild(reverse ? body : edge);
        this.element.appendChild(reverse ? edge : body);
        
        this.setHeight = height => body.style.height = `${height}px`;
    }
}

class PairOfPipes {
    constructor(canvasHeight, passage, canvasWidth) {
        this.element = newElement('div', 'pair-of-pipes');

        this.superior = new Pipe(true);
        this.inferior = new Pipe(false);

        this.element.appendChild(this.superior.element);
        this.element.appendChild(this.inferior.element);
        
        // this function create a new pipe's height randomly
        this.randomPassage = () => {
            const heightSuperior = Math.random() * (canvasHeight - passage);
            const heightInferior = canvasHeight - passage - heightSuperior;
            
            this.superior.setHeight(heightSuperior);
            this.inferior.setHeight(heightInferior);
        }

        this.getPositionX = () => parseInt(this.element.style.left.split('px')[0]);

        this.setPositionX = leftDistance => this.element.style.left = `${leftDistance}px`;

        this.getWidth = () => this.element.clientWidth;

        this.randomPassage();
        this.setPositionX(canvasWidth);
    }
}

class Pipes {
    constructor(width, height, passage, space, increaseScore) {
        this.pairs = [
            new PairOfPipes(height, passage, width),
            new PairOfPipes(height, passage, width + space),
            new PairOfPipes(height, passage, width + space * 2),
            new PairOfPipes(height, passage, width + space * 3)
        ];
        const shift = 3; // number of pixels that the tubes will walk per frame.
        
        /* this function returns true if a pipe cross the middle of screen,
         * it means that the bird crossed the pipe.
        */
        function crossTheMiddle(pair) {
            const middle = width / 2;
            const pairBeforeShift = pair.getPositionX() + shift;
            const pairAfterShift = pair.getPositionX();

            if (pairBeforeShift >= middle
            && pairAfterShift < middle) {
                return true;
            } else return false;
        }

        this.animate = () => {
            this.pairs.forEach(pair => {
                pair.setPositionX(pair.getPositionX() - shift);
                
                // checks if a pair comes out on the left, if true, sends to the end of the queue.
                if (pair.getPositionX() < -pair.getWidth()) {
                    pair.setPositionX(pair.getPositionX() + space * this.pairs.length);
                    pair.randomPassage();
                }

                if (crossTheMiddle(pair))
                increaseScore();
            })
        }
    }
}

class Bird {
    constructor(canvasHeight) {
        this.element = newElement('img', 'bird');
        
        this.element.src = 'imgs/bird.png';
        let fly = false;
        
        window.onkeydown =  event => {
            if (event.keyCode === 32) {
                fly = true;
            }
        }

        window.onkeyup = event => {
            if (event.keyCode === 32) {
                fly = false;
            }
        }

        this.getPositionY = () => parseInt(this.element.style.bottom.split('px')[0]);

        this.setPositionY = y => this.element.style.bottom = `${y}px`;
        
        this.animate = () => {
            const maxHeight = canvasHeight - this.element.clientHeight;
            const newPositionY = this.getPositionY() + (fly ? 8 : -5);

            if (newPositionY <= 0) {
                this.setPositionY(0);
            }
            else if (newPositionY >= maxHeight) {
                this.setPositionY(maxHeight);
            }
            else {
                this.setPositionY(newPositionY);
            }
        }

        this.setPositionY(canvasHeight / 2);
    }
}

class Progress {
    constructor() {
        this.element = newElement('span', 'progress');
        this.score = 0;
        this.updateScore = score => {
            this.element.innerHTML = this.score;
        }

        this.increaseScore = () => {
            this.updateScore(++this.score);
        }
        
        this.updateScore(this.score);
    }
}

function overlap(elemA, elemB) {
    const elementA = elemA.getBoundingClientRect();
    const elementB = elemB.getBoundingClientRect();
    
    const horizontal = elementA.left + elementA.width >= elementB.left
    && elementB.left + elementB.width >= elementA.left;
    const vertical = elementA.top + elementA.height >= elementB.top
    && elementB.top + elementB.height >= elementA.top;
    
    return horizontal && vertical;
}

function hit(bird, pipes) {
    let hit = false;
    
    pipes.pairs.forEach(pairOfPipes => {
        if (!hit) {
            hit = overlap(bird.element, pairOfPipes.superior.element)
                || overlap(bird.element, pairOfPipes.inferior.element);
        }
    });
    
    return hit;
}

class GameOver {
    constructor(canvas) {
        this.element = newElement("div", "game-over");
        this.element.innerHTML = "GAME OVER";
        
        canvas.appendChild(this.element);
    }
}

class FlappyClone {
    constructor() {
        const canvas = document.querySelector('[canvas]');
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;
        const passage = 230;
        const space = 400;
        const progress = new Progress();
        const pipes = new Pipes(canvasWidth, canvasHeight, passage, space, progress.increaseScore);
        const bird = new Bird(canvasHeight);

        canvas.appendChild(progress.element);
        canvas.appendChild(bird.element);
        pipes.pairs.forEach(pair => canvas.appendChild(pair.element));

        this.start = () => {
            pipes.animate();
            bird.animate();
            if (!hit(bird, pipes)) {
                // requestAnimationFrame makes the loop smoother than setInterval.
                window.requestAnimationFrame(this.start);
            } else {
                new GameOver(canvas);
                window.onkeypress = event => {
                    if (event.keyCode === 13) {
                        location.reload(false);
                    }
                }
            }
        }
    }
}

new FlappyClone().start();