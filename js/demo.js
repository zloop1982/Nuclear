var HelloMessage = Nuclear.create({
    render: function () {
        return '<div>Hello , {{name}} !</div>';
    }
})
new HelloMessage("#helloContainer", { name: "Nuclear" });

var Timer = Nuclear.create({
    install: function () {
        //react这里不需要加bind(this),会导致对javascript上下文的误解
        this.interval = setInterval(this.tick.bind(this), 1000);
    },
    uninstall: function () {
        clearInterval(this.interval);
    },
    tick: function () {
        this.option.secondsElapsed++;
    },
    render: function () {
        return ' <div>Seconds Elapsed: {{secondsElapsed}}</div>';
    }
});

new Timer("#timerContainer", { secondsElapsed: 0 });

var TodoApp = Nuclear.create({
    onRefresh: function () {
        this.form = this.node.querySelector("form");
        this.textBox = this.node.querySelector("input");
        this.form.addEventListener("submit", function (evt) {
            evt.preventDefault();
            this.option.items.push(this.textBox.value);
        }.bind(this), false);
    },
    render: function () {
        return '<div>\
                    <h3>TODO</h3>\
                    <ul> {{#items}} <li>{{.}}</li> {{/items}}</ul>\
                    <form >\
                    <input type="text"  />\
                    <button>Add #{{items.length}}</button>\
                    </form>\
                </div>';
    }
});

new TodoApp("#todoContainer", { items: [] });

var MarkdownEditor = Nuclear.create({
    install: function () {
        this.option.html = marked(this.option.value);
    },
    installed: function () {
        this.textarea = this.node.querySelector("textarea");
        this.textarea.addEventListener("keyup", function () {
            this.option.html = marked(this.textarea.value);
        }.bind(this), false);
    },
    onRefresh: function () {
        this.content = this.node.querySelector(".content");
        this.content.style.cursor = "pointer";
        this.content.addEventListener("click", function () {
            this.content.style.backgroundColor = "#A5E4F5";
        }.bind(this), false);
    },
    render: function () {
        return '<div>\
                    <h3>Input</h3>\
                    <textarea rows="10" cols="25">{{value}}</textarea>\
                    <h3>Output</h3>\
                    <div class="content" nc-refresh >\
                        {{{html}}}\
                    </div>\
                </div>';

    }
});

new MarkdownEditor("#markdownContainer",
                   { value: 'Type some *markdown* here!', html: '' })


var Progress = Nuclear.create({
    install: function () {
        this.option.percent = function () {
            return this.value * 100 + "%";
        }
    },
    render: function () {
        if (this.option.displayNumber) {
            return '<div class="progress">\
                                    <div style="width:{{percent}};" class="progress-bar progress-bar-primary">{{percent}}</div>\
                                </div>';
        } else {
            return '<div class="progress">\
                                    <div style="width:{{percent}};" class="progress-bar progress-bar-primary"></div>\
                                </div>';
        }
    }
})
var progress = new Progress("#progressContainer", { value: 0.6, displayNumber: true });
//操作数据自动刷新Dom
progress.option.value = 0.3;
var progress = new Progress("#progressContainer2", { value: 0.6, displayNumber: false });


var Button = Nuclear.create({
    install: function () {
        this.option.disable = false;
    },
    installed: function () {
        this.node.addEventListener("click", function (evt) {
            if (this.option.onClick) {
                this.option.onClick.call(this.node, evt);
            }
        }.bind(this), false);
    },
    render: function () {
        return ' <a class="btn {{#disable}}disable{{/disable}}">{{text}}</a>';
    }
})

var SwitchButton = Button.create({
    installed: function () {
        this.node.addEventListener("click", function (evt) {
            this.option.disable = !this.option.disable;
            if (this.option.disable) {
                this.option.close && this.option.close();
            } else {
                this.option.open && this.option.open();
            }
        }.bind(this), false);
    }
})

var CountdownButton = Button.create({
    install: function () {
        //可通过访问父类方法
        // this._super();              
    },
    installed: function () {
        this.node.addEventListener("click", function (evt) {
            if (!this.option.disable) {
                this.option.textBak = this.option.text;
                this.option.valueBak = this.option.value;
                this.option.value--;
                this.option.text = this.option.waitingText.replace("{}", this.option.value);
                this.option.disable = !this.option.disable;
                this.interval = setInterval(this.tick.bind(this), 1000);
            }
        }.bind(this), false);
    },
    tick: function () {
        if (this.option.value === 1) {
            this.option.disable = !this.option.disable;
            clearInterval(this.interval);
            this.option.text = this.option.textBak;
            this.option.value = this.option.valueBak;
            if (this.option.complete) this.option.complete();
        } else {
            this.option.value--;
            this.option.text = this.option.waitingText.replace("{}", this.option.value);
        }
    }
})

new Button("#buttonContainer",
    {
        text: "普通按钮",
        onClick: function (evt) {
            alert(1);
        }
    });

new SwitchButton("#switchButtonContainer",
    {
        text: "开关按钮",
        open: function () {
        },
        close: function () {
        }
    });

new CountdownButton("#countdownButtonContainer",
     {
         text: "获取短信验证码",
         waitingText: "{}秒后可以重试",
         value: 10,
         complete: function () {
             console.log(11);
         }
     });

var Drag = Nuclear.create({
    install: function () {
        var option = this.option;
        this.currentPosition = { x: 0, y: 0 };
        this.moveElement = typeof option.moveElement === "string" ? document.querySelector(option.moveElement) : option.moveElement;
        this.dragElement = typeof option.dragElement === "string" ? document.querySelector(option.dragElement) : option.dragElement;
        Nuclear.css(this.moveElement, "position", "absolute");
        Nuclear.css(this.dragElement, "cursor", option.cursor || "move");
        Nuclear.addEvent(this.dragElement, "mousedown", this._mousedown.bind(this));
        var offset = Nuclear.offset(this.moveElement);
        if (Nuclear.css(this.moveElement, "top") === "auto") Nuclear.css(this.moveElement, "top", offset.top + "px");
        if (Nuclear.css(this.moveElement, "left") === "auto") Nuclear.css(this.moveElement, "left", offset.left + "px");

        this._docMove = this._mousemove.bind(this);
        this._docUp = this._mouseup.bind(this);
    },
    _mousedown: function (evt) {
        this.currentPosition.x = evt.pageX;
        this.currentPosition.y = evt.pageY;
        Nuclear.addEvent(document, "mousemove", this._docMove);
        Nuclear.addEvent(document, "mouseup", this._docUp);
        if (this.option.start) {
            this.option.start(evt);
        }
    },
    _mousemove: function (evt) {
        var dx = evt.pageX - this.currentPosition.x;
        var dy = evt.pageY - this.currentPosition.y;
        if (this.option.direction) {
            if (this.option.direction.toUpperCase() == "X") dy = 0;
            if (this.option.direction.toUpperCase() == "Y") dx = 0;
        }
        Nuclear.css(this.moveElement, "left", (parseInt(Nuclear.css(this.moveElement, "left")) + dx) + "px");
        Nuclear.css(this.moveElement, "top", (parseInt(Nuclear.css(this.moveElement, "top")) + dy) + "px");
        if (this.option.move) {
            this.option.move(evt);
        }
        this.currentPosition.x = evt.pageX;
        this.currentPosition.y = evt.pageY;
        evt.preventDefault();

    },
    _mouseup: function (evt) {
        Nuclear.removeEvent(document, "mousemove", this._docMove);
        Nuclear.removeEvent(document, "mouseup", this._docUp);
        if (this.option.end) {
            this.option.end(evt);
        }

    }
})

new Drag({
    dragElement: "#dragger1",
    moveElement: "#dragger1",
    direction: "y",
    cursor: "n-resize"
})

new Drag({
    dragElement: "#dragger2",
    moveElement: "#dragger2",
    start: function () {},
    move: function () {},
    end: function () {}
})

new Drag({
    dragElement: "#dragger3",
    moveElement: "#dragger3",
    cursor: "e-resize",
    direction: "x"
})

var PieChart = Nuclear.createCanvas({
    sector: function (x, y, r, begin, end, color, clock, isStroke, lineWidth) {
        var ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        if (lineWidth) ctx.lineWidth = lineWidth;
        ctx[isStroke ? "strokeStyle" : "fillStyle"] = color;
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, begin, end, clock)
        ctx.lineTo(x, y);
        ctx[isStroke ? "stroke" : "fill"]();
        ctx.restore();
    },
    render: function () {
        var option = this.option;
        var ctx = this.ctx;
        var totalCount = 0, begin = 0;
        var i = 0, len = option.data.length;
        for (; i < len; i++) {
            totalCount += option.data[i].count;
        }
        //Sector
        for (i = 0; i < len; i++) {
            var item = option.data[i];
            var end = Math.PI * 2 * (item.count / totalCount) + begin;
            this.sector(option.x, option.y, option.r, begin, end, item.color);
            begin = end;
        }
        //Sector Border
        for (i = 0; i < len; i++) {
            var item = option.data[i];
            var end = Math.PI * 2 * (item.count / totalCount) + begin;
            this.sector(option.x, option.y, option.r, begin, end, "white", true, true, 2);
            begin = end;
        }
        //Text
        for (i = 0; i < len; i++) {
            var item = option.data[i];
            var end = Math.PI * 2 * (item.count / totalCount) + begin;
            var angle = begin + (end - begin) / 2;
            var x = option.x + option.r * Math.cos(angle);
            var y = option.y + option.r * Math.sin(angle);
            ctx.save();
            ctx.font = "bold 14px Arial";
            ctx.fillText(item.name, x - ctx.measureText(item.name).width / 2, y);
            ctx.restore();
            begin = end;
        }
    }
})

var pc = new PieChart("#pieChartContainer", 300, 300, {
    x: 140,
    y: 140,
    r: 120,
    data: [
       { name: "Javascript", count: 100, color: "#A8322E" },
       { name: "C#", count: 97, color: "#8FB443" },
       { name: "C++", count: 109, color: "#2D9EBC" },
       { name: "Java", count: 12, color: "#D3731F" },
       { name: "PHP", count: 55, color: "#FA9416" }
    ]
});
//更改数据自动刷新Canvas
pc.option.data[0].count = 200;