import Omi from '../../src/index.js';

class List extends Omi.Component {
    constructor(data) {
        super(data);
    }

    style() {
        return `
        li.title{
            font-size: 16px;
            font-weight: bold;
            margin-bottom:10px;
            margin-top:10px;
            text-indent: 23px;
        }
        li{
            margin-bottom:3px;
            text-indent: 33px;
        }
        li a{
            display:block;
            font-size:14px;
            height:20px;
            line-height:20px;
            color: #666;
        }
        li a:hover{
            background-color:#b3d4fc;
            color:white;
        }
        `;
    }

    render () {
        return `
        <ul>
            <li class="title">{{title}}</li>
            {{#list}} <li><a href="#{{name}}">{{name}}</a></li> {{/list}}
        </ul>`;
}
}

export default List;
