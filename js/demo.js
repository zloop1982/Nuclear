var HelloMessage = Nuclear.extend({
    render: function () {
        return '<div>Hello , {{name}} !</div>';
    }
})
new HelloMessage("#helloContainer", { name: "Nuclear" });

var Timer = Nuclear.extend({
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

var TodoApp = Nuclear.extend({
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

var MarkdownEditor = Nuclear.extend({
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