var HelloMessage = Nuclear.create({
    render: function () {
        return '<div>Hello , {{name}} !</div>';
    }
})
new HelloMessage( { name: "Nuclear" },"#helloContainer");

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

new Timer({ secondsElapsed: 0 },"#timerContainer");

var TodoList = Nuclear.create({
    render: function () {
        return '<ul> {{#items}} <li>{{.}}</li> {{/items}}</ul>';
    }
});

var TodoApp = TodoList.create({
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
                         <h3>TODO</h3>'
                  + this._super() +
                  '<form >\
                           <input type="text"  />\
                           <button>Add #{{items.length}}</button>\
                         </form>\
                       </div>';
    }
});

new TodoApp( { items: [] },"#todoContainer");

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

new MarkdownEditor({ value: 'Type some *markdown* here!', html: '' }, "#markdownContainer");

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
var progress = new Progress({ value: 0.6, displayNumber: true },"#progressContainer");
//操作数据自动刷新Dom
progress.option.value = 0.3;
var progress = new Progress({ value: 0.6, displayNumber: false },"#progressContainer2");


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

new Button({
        text: "普通按钮",
        onClick: function (evt) {
            alert(1);
        }
       }, "#buttonContainer");

new SwitchButton({
        text: "开关按钮",
        open: function () {},
        close: function () {}
    },"#switchButtonContainer");

new CountdownButton({
         text: "获取短信验证码",
         waitingText: "{}秒后可以重试",
         value: 10,
         complete: function () {}
     },"#countdownButtonContainer");

var Drag = Nuclear.createAction({
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

var pc = new PieChart(300, 300, {
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
},"#pieChartContainer");
//更改数据自动刷新Canvas
pc.option.data[0].count = 200;


var LineChart = Nuclear.createCanvas({
    render: function () {
        var canvas = this.canvas, option = this.option,
            offset = [option.offset[0], option.offset[1]],
            xLen = option.xValueGrid.length,
            yLen = option.yValueGrid.length,
            cellHeight = Math.ceil((canvas.height - offset[1]) / yLen),
            cellWidth = Math.ceil((canvas.width - offset[0]) / xLen),
            bottom = offset[1] + cellHeight * (yLen - 1);
        this.renderGird(offset, xLen, yLen, cellWidth, cellHeight, bottom);
        this.renderData(cellWidth, bottom);

    },
    renderGird: function (offset, xLen, yLen, cellWidth, cellHeight, bottom) {
        var option = this.option, canvas = this.canvas, ctx = this.ctx;
        ctx.strokeStyle = option.gridBoderColor,
        ctx.fillStyle = option.gridFontColor,
        ctx.lineWidth = 2;
        var f = offset[0] + cellWidth * (xLen - 1);
        ctx.fillStyle = option.fontColor;
        ctx.fillText(option.yUnit, offset[0] - 22, offset[1] - 15);
        ctx.beginPath();


        for (var c = 0; c < yLen; c++) {
            ctx.moveTo(offset[0], offset[1]),
            ctx.fillText(option.yValueGrid[yLen - c - 1], offset[0] - 22, offset[1] + 5),
            ctx.lineTo(f, offset[1]),
            offset[1] += cellHeight;
        }

        offset = [option.offset[0], option.offset[1]];
        for (var c = 0; c < xLen; c++) {
            ctx.moveTo(offset[0], offset[1]),
            ctx.fillText(option.xValueGrid[c] + option.xUnit, offset[0] - 10, bottom + 15),
            ctx.lineTo(offset[0], bottom),
            offset[0] += cellWidth;
        }
        ctx.stroke();
    },
    renderData: function (cellWidth, bottom) {
        var option = this.option, ctx = this.ctx;
        var h = option.yValueGrid[option.yValueGrid.length - 1] - option.yValueGrid[0];
        offset = [option.offset[0], option.offset[1]];
        for (var c = 0, p = option.lines.length; c < p; c++) {
            var d = option.lines[c];
            ctx.strokeStyle = d.lineColor,
            ctx.beginPath();
            for (var v = 0, m = d.data.length - 1; v < m; v++) ctx.moveTo(offset[0] + cellWidth * v, bottom - (bottom - offset[0]) * d.data[v] / h),
            ctx.lineTo(offset[0] + cellWidth * (v + 1), bottom - (bottom - offset[0]) * d.data[v + 1] / h);
            ctx.stroke()
        }

        offset = [option.offset[0], option.offset[1]];
        for (var c = 0, p = option.lines.length; c < p; c++) {
            var d = option.lines[c];
            ctx.strokeStyle = d.lineColor;
            for (var v = 0, m = d.data.length; v < m; v++) {
                var g = offset[0] + cellWidth * v,
                y = bottom - (bottom - offset[0]) * d.data[v] / h;
                ctx.beginPath(),
                ctx.lineWidth = 3,
                ctx.arc(g, y, 4, 0, Math.PI * 2, !1),
                ctx.stroke(),
                ctx.beginPath(),
                ctx.fillStyle = option.fontColor;
                ctx.arc(g, y, 4, 0, Math.PI * 2, !1),
                ctx.fill(),
                v === m - 1 && (ctx.fillText(d.data[v], g + 10, y + 10))
            }
        }
    }

})

var lineChart = new LineChart(600, 300, {
    offset: [40, 40],
    fontColor: "white",
    gridBoderColor: "#ccc",
    gridFontColor: "black",
    yValueGrid: [0, 50, 100, 150, 200, 250, 300],
    yUnit: "万元/㎡",
    xValueGrid: [10, 11, 12, 1, 2, 3],
    xUnit: "月",
    lines: [{
        lineColor: "#A8322E",
        data: [23, 40, 33, 76, 20, 19]
    },
    {
        lineColor: "#8FB443",
        data: [123, 10, 23, 176, 200, 34]
    },
    {
        lineColor: "#2D9EBC",
        data: [13, 2, 7, 76, 100, 134]
    },
    {
        lineColor: "#FA9416",
        data: [11, 60, 33, 116, 1, 119]
    }]
}, "#lcContainer")

setInterval(function () {
    //数据改变自动通知视图
    lineChart.option.lines[0].data = [random1To200(), random1To200(), random1To200(), random1To200(), random1To200(), random1To200()];
    lineChart.option.lines[1].data = [random1To200(), random1To200(), random1To200(), random1To200(), random1To200(), random1To200()];
    lineChart.option.lines[2].data = [random1To200(), random1To200(), random1To200(), random1To200(), random1To200(), random1To200()];
    lineChart.option.lines[3].data = [random1To200(), random1To200(), random1To200(), random1To200(), random1To200(), random1To200()];
}, 1000)

function random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function random1To200() {
    return random(1, 200);
}

var Marquee = Nuclear.create({
    installed: function () {
        this.scroll = this.node.querySelector(".marquee-scroll");
        this.end = -20 + parseInt(window.getComputedStyle(this.scroll)["width"]) * -1;
        this.loop = setInterval(function () {
            this.option.left -= 5;
            if (this.option.left < this.end) this.option.left = this.option.width;
        }.bind(this), 100);
    },
    update: function () {
        this.scroll.style.left = this.option.left + "px";
    },
    render: function () {
        return '<div style="width:{{width}}px;overflow:hidden;position:relative;"><div  style="visibility:hidden;">a核</div><div class="marquee-scroll" style="position:absolute; white-space:nowrap;left:{{left}}px;top:0;">{{content}}</div></div>';
    }
});
new Marquee({ width: 280, left: 280, content: "张三中了 笔记本电脑  李四中了 苹果手机  王五中了 QQ靓号  孙六中了 马尔代夫双人游  ", }, "#marqueeContainer");

var Tab = Nuclear.create({
    onRefresh: function () {
        this.tabs = this.node.querySelectorAll('.nuclear-tab-nav a');
        var self = this;
        Nuclear.addEvent(this.tabs, "click", function () {
            self.option.selectedIndex = Nuclear.getNodeIndex(this);
        });
    },
    render: function () {
        var tpl = '<div class="nuclear-tab">\
                        <div class="nuclear-tab-nav">', selectedIndex = this.option.selectedIndex;
                this.option.tabs.map(function (tab, index) {
                    tpl += '<a class="' + (selectedIndex === index ? "nuclear-tab-navActive" : "") + '">' + tab.title + '</a>';
                }.bind(this));
                tpl += '</div>\
                        <div class="nuclear-tab-content">\
                            <div>' + this.option.tabs[selectedIndex].content + '</div>\
                        </div>\
                    </div>';
        return tpl;
    }
});

new Tab({
    tabs: [
           { title: "tab1", content: "tab1-content" },
           { title: "tab2", content: '<a href="##">tab2-content</a>' },
           { title: "tab3", content: "<em>tab3-content</em>" }
          ],
    selectedIndex: 0
}, "#tabContainer");

var Alert = Nuclear.create({
    installed: function () {
        this.ok.addEventListener("click", function (evt) {
            this.option.display = false;
            evt.stopPropagation();
        }.bind(this), false);
    },
    render: function () {
        if (!this.option.display) return;
        return '<div>\
                    <div class="ui-mask" style="height:' + (Math.max(document.body.scrollHeight, document.body.clientHeight) - 1) + 'px;"></div>\
                    <div class="ui-dialog" style="top:' + (document.body.scrollTop+window.innerHeight/2) + 'px">\
                        <div class="ui-dialog-title">\
                            <h3>{{title}}</h3>\
                        </div>\
                        <div class="ui-dialog-content">\
                            <div title="{{msg}}">\
                                <p>{{msg}}</p></div>\
                            </div>\
                        <div nc-id="ok" class="ui-dialog-btns"><a class="ui-btn ui-btn-1">好</a>\
                        </div>\
                    </div>\
                </div>';
    }
});
Nuclear.alert = function (msg, title) {
    new Alert({ msg: msg, title: title || "提示", display: true }, "body");
};

new Button({
    text: "点我试试alert",
    onClick: function () {
        Nuclear.alert("Nuclear大法好");
    }
}, "#alertContainer");