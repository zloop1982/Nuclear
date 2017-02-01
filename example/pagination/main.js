import Omi from '../../src/index.js';
import Pagination from './pagination.js';
import Content from './content.js';

Omi.makeHTML(Pagination);
Omi.makeHTML(Content);

class Main extends Omi.Component {
    constructor(data) {
        super(data);
    }

    installed(){
        this.content.goto(this.pagination.data.currentPage+1);
    }
    handlePageChange(index){
        this.content.goto(index+1);
    }

    render () {
        return `<div>
                    <h1>Pagination Example</h1>
                    <Content name="content" />
                    <Pagination
                        name="pagination"
                        data-total="100"
                        data-page-size="10"
                        data-num-edge="1"
                        data-num-display="4"����������
                        onPageChange="handlePageChange" />
                </div>`;
    }
}

Omi.render( new Main(),'body');