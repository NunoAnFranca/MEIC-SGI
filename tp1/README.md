# SGI 2024/2025 - TP1

## Group T08G10
| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Luís Alves       | 202108727 | 202108727@up.pt    |
| Nuno França      | 201807530 | 201807530@up.pt    |

----
## Project information

  The scene was created with an idea of an older room, 80s/90s room. Most objects in this scene were created as something we wanted to do, not particulary to create an already known room.

A broad view of the scene can be seen in the next two images. Images showcasing the request objects come after.

|![image1](images\image1.png)                |
|:------------------------------------------:|
| Image 1 - The scene                          |

|![image2](images\image2.png)                |
|:------------------------------------------:|
| Image 2 - The scene                          |


### Table, Plate, Cake and Candles

The table was created as requested, while the cake has created with 3 different cylinders, allowing for the multi level feel of the brown/strawberry flavours. The cake also has an iteration of candles, where every candle as a pointlight in the middle in order to resemble a flame.

|![image3](images\image3.png)                |
|:------------------------------------------:|
| Image 3 - Table, Plate, Cake and Candles     |

- [Cake](contents\MyCake.js)


### Floor and Walls

Floor and walls can be seen in the Image 1, they were created with the interface in mind, so as it can be seen in Image 4, there are multiple controls to change their appearance.

|![image4](images\image4.png)                |
|:------------------------------------------:|
| Image 4 - Floor and walls interface        |

As it can be seen, in Image 5, changing the controls completly changes the scene.

|![image5](images\image5.png)                |
|:------------------------------------------:|
| Image 5 - Floor and walls interface changes|

- [Floor/Wall](contents\MyRoom.js)


### Two students pictures

The two student pictures are framed in the wall can can be seen in the following image.

|![image6](images\image6.png)                |
|:------------------------------------------:|
| Image 6 - Two student pictures             |

The pictures also have two spotlights to showcase the pictures. Those spotlights can be enabled and disabled and the attributes can be changed in the interface, both spotlights have an helper, in order to better understand the flow of the light.

|![image7](images\image7.png)                |
|:------------------------------------------:|
| Image 7 - Floor and walls interface changes|

- [Student Spotlights](contents\MySpotStudent.js)

- [Student Frames](contents\MyRoom.js)

### Window landscape

The window landscape was built with an interved sphere, in order to resemble an actual landscape from the inside the room with different viewing angles

|![image8](images\image8.png)                |
|:------------------------------------------:|
| Image 8 - Window landscape                 |

|![image9](images\image9.png)                |
|:------------------------------------------:|
| Image 9 - Window landscape                  |

- [Window landscape](contents\MyRoom.js)

### Cake Spot Light

The spot light for the cake is similar to the students, also has a viewable geometry and controls in the interface.

|![image10](images\image10.png)                |
|:------------------------------------------:|
| Image 10 - Cake Spot light                |

- [Cake Spot Light](contents\MySpotCake.js)


### Beetle and 2D Flower with bezier curves

The following image shows the mandatory beetle and an optional flower with bezier curves, both objects were created with an iteration, in order to change to look and give a little thickness.

|![image11](images\image11.png)                |
|:------------------------------------------:|
| Image 11 - Beetle and Flower                |

- [Beetle and Flower](contents\MyCurveObjects.js)

### Spiral Spring and Journal

The following image shows the journal build as a surface and a spring, build with bezier curves and with a tube geometry to give thickness. The spring was build with an iteration of y value of each point, in order to give a proper spring look.

|![image12](images\image12.png)                |
|:------------------------------------------:| 
| Image 12 - Spiral Spring and Journal         |

- [Spiral Spring](contents\MySpring.js)

- [Journal](contents\MyJournal.js)


### Vase and 3D Flower

The following image shows both the vase built with two surfaces and a flower built with a sphereGeometry, tubeGeometry and surfaces for the petals. A problem related to the shadows is detailed in the **Issues/Problems** section.

|![image13](images\image13.png)                |
|:------------------------------------------:| 
| Image 13 - Vase and 3D Flower         |

- [Vase](contents\MyVase.js)

- [3D Flower](contents\MyFlower.js)

### Shadows

Currently it can be seen in the scene three lights casting shadow, point Light 1, Point Light 2 and Directional light, the cast of shadows can be disabled in the interface separately for each light.

|![image14](images\image14.png)                |
|:------------------------------------------:| 
| Image 14 - Shadows         |

- [Shadows and Lights](contents\MyRoomLights.js)


### Lights and helpers

All the lights in the scene have helpers and changeable atributes in the interface.

|![image15](images\image15.png)             |
|:------------------------------------------:| 
| Image 15 - Lights and helpers         |

|![image16](images\image16.png)             |
|:------------------------------------------:| 
| Image 16 - Lights and helpers with changes       |

- [Lights](contents\MyRoomLights.js)

- [Student Spotlights](contents\MySpotStudent.js)

- [Cake Spot Light](contents\MySpotCake.js)


### Additional furniture

There was developed additional furniture in order to complete the romm and fill it with personality, some of this additional furnituer can be changed with the interface.

|![image17](images\image17.png)             |
|:------------------------------------------:| 
| Image 17 - Chairs         |

The following image of the spring guy was built with mostly simple geometrys, but uses springs for the conjunction of body parts and a surface for the hat. The spring guy also has some controllable options in the interface.

|![image18](images\image18.png)             |
|:------------------------------------------:| 
| Image 18 - Spring guy with presents to give perspective of falling |

|![image19](images\image19.png)             |
|:------------------------------------------:| 
| Image 19 - Spring guy interface |

Television built with geometries and a surface for the billboard.

|![image20](images\image20.png)             |
|:------------------------------------------:| 
| Image 20 - Television and billboard |

|![image21](images\image21.png)             |
|:------------------------------------------:| 
| Image 21 - Lamp |

|![image22](images\image22.png)             |
|:------------------------------------------:| 
| Image 22 - Radio |

The two following images, show the most complex object in the scene, the couch, this object was created solely with surfaces for the 4 parts of the couch and another surface for the pillow.

|![image23](images\image23.png)             |
|:------------------------------------------:| 
| Image 23 - Couch | 

|![image24](images\image24.png)             |
|:------------------------------------------:| 
| Image 24 - Couch | 

- [Chairs](contents\MyChairs.js)

- [Spring guy](contents\MySpringGuy.js)

- [Television](contents\MyTelevision.js)

- [BillBoard](contents\MyBillboard.js)

- [Lamp](contents\MyLamp.js)

- [Radio](contents\MyRadio.js)

- [Couch](contents\MyCouch.js)


### Interface and multiple cameras

In the following image the full interface can be seen, there's also an option to choose different cameras.

|![image25](images\image25.png)             |
|:------------------------------------------:| 
| Image 25 - Interface         |
 
|![image26](images\image26.png)             |
|:------------------------------------------:| 
| Image 26 - Different perspective with a different FOV         |

---- 
## Issues/Problems

- Only known problem, is related to how the materials in the surfaces are constructed. Surfaces should be built from both sides and therefore the material is built with this attribute, **side: THREE.DoubleSide**. 
A mesh with this kind of material, while being able to cast/receive shadows, creates pixelated shadows. It's a known issue from THREEjs and such can be observed in the flowers/journal in the scene, when lights are casting shadows. That's also the reason why the couch doesn't have shadows, the cast/receive shadow attribute is turned off in order to not get pixelated.