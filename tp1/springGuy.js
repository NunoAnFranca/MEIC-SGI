import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';



class MySpringGuy  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.roomHeight = null;
        this.roomWidth = null;
    }

    buildBase() {
        console.log("Hello");

    }

    buildSpringGuy(roomHeight, roomWidth) {
        this.roomHeight = roomHeight;
        this.roomWidth = roomWidth;

        this.buildBase()
    }
}
export { MySpringGuy };