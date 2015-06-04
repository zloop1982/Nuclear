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
