import { MyNode } from './MyNode.js';

/**
 *  This class contains the contents of our application
 */
class MyGraph {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app, node) {
        this.app = app;
        this.node = node;
        this.rootid = node.rootid;
        this.rootNode = new MyNode(this.rootid, this.node, "", false, false);
    }
}

export { MyGraph };