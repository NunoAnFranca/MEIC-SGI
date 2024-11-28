import { MyApp } from './MyApp.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { MyContents } from './MyContents.js';

// create the application object
let app = new MyApp()
// initializes the application
app.init()

// create the contents object
let contents = new MyContents(app)
// initializes the contents
contents.init()
// hooks the contents object in the application object
app.setContents(contents);

// create the gui interface object
let gui = new MyGuiInterface(app)
// set the contents object in the gui interface object
gui.setContents(contents)

// we call the gui interface init 
// after contents were created because
// interface elements may control contents items
gui.init();

// set the gui interface object in the contents object
contents.setGui(gui);

// main animation loop - calls every 50-60 ms.
app.render()
