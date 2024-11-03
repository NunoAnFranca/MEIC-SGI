# SGI 2024/2025 - TP1

## Group T08G10
| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Luís Alves       | 202108727 | 202108727@up.pt    |
| Nuno França      | 201807530 | 201807530@up.pt    |

----
## Project information

- (items describing main strong points)
- Scene
  - (Brief description of the created scene)
  - (relative link to the scene)
----
## Issues/Problems

- Only known problem, is related to how the materials in the surfaces are constructed. Surfaces should be built from both sides and therefore the material is built with this attribute, **side: THREE.DoubleSide**. 
A mesh with this kind of material, while being able to cast/receive shadows, creates pixelated shadows. It's a known issue from THREEjs and such can be observed in the flowers/journal in the scene, when lights are casting shadows. That's also the reason why the couch doesn't have shadows, the cast/receive shadow attribute is turned off in order to not get pixelated.