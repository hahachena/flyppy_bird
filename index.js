//返回计时器

function getTimer(duration, thisObj, startCallback, stopCallback) {
    let timer = null;

    if (thisObj && startCallback) {
        startCallback = startCallback.bind(thisObj)
    }
    if (thisObj && stopCallback) {
        startCallback = stopCallback.bind(thisObj)
    }
    return {
        start: function () {
            if (!timer) {
                timer = setInterval(function () {
                    if (startCallback) {
                        startCallback(duration)
                    }
                }, duration)
            }
        },
        stop: function () {
            if (timer) {
                clearInterval(timer);
                timer = null;
                if (stopCallback) {
                    stopCallback()
                }
            }
        }
    }
}

var game = {
    width: 800,
    height: 600,
    maxHeight: 600 - 112,
    paused: true,
    dom: document.getElementById('game'),
    isGameOver: false,
    start: function () {
        this.paused = false;
        bird.wingTimer.start()
        skyBg.timer.start()
        landBg.timer.start()
        bird.dropTimer.start()
        pipes.pipesTimer.start()
        pipes.produceTimer.start()
    },
    stop: function () {
        skyBg.timer.stop()
        bird.wingTimer.stop()
        landBg.timer.stop()
        bird.dropTimer.stop()
        pipes.pipesTimer.stop()
        this.paused = true
    },
    gameOver: function () {
        if (bird.top === game.maxHeight - bird.height) {
            this.stop()
            document.querySelector('#game .gameOver').style.display = 'block'
            this.isGameOver = true
            return
        }

        var bx = bird.left + bird.width / 2;
        var by = bird.top + bird.height / 2;
        for (var i = 0; i < pipes.all.length; i++) {
            var p = pipes.all[i]
            var px = p.left + p.width / 2;
            var py = p.top + p.height / 2;

            if (Math.abs(bx - px) < (p.width + bird.width) / 2 &&
                Math.abs(by - py) < (p.height + bird.height) / 2
            ) {
                this.stop()
                document.querySelector('#game .gameOver').style.display = 'block'
                this.isGameOver = true
                return
            }
        }

    }
}

//天空

var skyBg = {
    left: 0,
    dom: document.querySelector('#game .sky'),
    show: function () {
        this.dom.style.left = this.left + 'px'

    }
}

skyBg.timer = getTimer(30, skyBg, function () {
    this.left -= 1;
    if (this.left === -game.width) {
        this.left = 0;
    }
    this.show()
})

//大地

var landBg = {
    left: 0,
    dom: document.querySelector('#game .land'),
    show: function () {
        this.dom.style.left = this.left + 'px'

    }
}

landBg.timer = getTimer(30, landBg, function () {
    this.left -= 2;
    if (this.left === -game.width) {
        this.left = 0;
    }
    this.show()
})

//小鸟

var bird = {
    width: 33,
    height: 26,
    top: 150,
    left: 200,
    dom: document.querySelector('#game .bird'),
    windIndex: 0,
    speed: 0,
    a: 0.002,
    show: function () {
        if (this.windIndex === 0) {
            this.dom.style.backgroundPosition = "-8px -10px"
        } else if (this.windIndex === 1) {
            this.dom.style.backgroundPosition = "-60px -10px"
        } else {
            this.dom.style.backgroundPosition = "-114px -10px"
        }
        this.dom.style.top = this.top + 'px'
    },
    setTop: function (newTop) {
        if (newTop < 0) {
            newTop = 0
        } else if (newTop > game.maxHeight - this.height) {
            newTop = game.maxHeight - this.height;
        }
        this.top = newTop;
    },
    jump: function () {
        this.speed = -0.5
    }

}

bird.wingTimer = getTimer(100, bird, function () {
    this.windIndex = (this.windIndex + 1) % 3;
    this.show()
})

bird.dropTimer = getTimer(16, bird, function (t) {
    var s = this.speed * t + 0.5 * this.a * t * t;
    this.setTop(this.top + s)
    this.speed = this.speed + this.a * t
    this.show()
})

//柱子

var pipes = {
    width: 52,
    getRandom: function (max, min) {
        return Math.floor(Math.random() * (max + min) + min)

    },

    all: [],

    createPair: function () {
        var minHeight = 60,
            gap = 150,
            maxHeight = game.maxHeight - minHeight - gap;

        var h1 = this.getRandom(maxHeight, minHeight)
        h2 = game.maxHeight - h1 - gap

        var div1 = document.createElement('div')
        div1.className = 'pipeup'
        div1.style.height = h1 + 'px'
        div1.style.left = game.width + 'px'
        game.dom.appendChild(div1)

        this.all.push({
            dom: div1,
            height: h1,
            width: this.width,
            top: 0,
            left: game.width
        })

        var div2 = document.createElement('div')
        div2.className = 'pipedown'
        div2.style.height = h2 + 'px'
        div2.style.left = game.width + 'px'
        game.dom.appendChild(div2)
        this.all.push({
            dom: div2,
            height: h2,
            width: this.width,
            top: h1 + gap,
            left: game.width
        })

    }
}


pipes.pipesTimer = getTimer(30, pipes, function () {
    for (var i = 0; i < this.all.length; i++) {
        var p = this.all[i]
        p.left -= 2;
        if (p.left < -p.width) {
            p.dom.remove();
            this.all.splice(i, 1)
            i--;
        } else {
            p.dom.style.left = p.left + 'px'
        }
    }
    game.gameOver()
})

pipes.produceTimer = getTimer(3000, pipes, function () {
    pipes.createPair()
})






document.documentElement.onclick = function () {
    if (game.paused) {
        game.start()
    } else {
        game.stop()
    }
}

document.documentElement.onkeydown = function (e) {
    if (e.key === " ") {
        bird.jump()
    } else if (e.key === 'Enter') {
        if (game.isGameOver) {
            location.reload()
        }else if(game.paused){
            game.start()
        }else{
            game.stop()
        }
    }
}

game.start()


