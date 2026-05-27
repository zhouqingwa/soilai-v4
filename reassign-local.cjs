const fs = require('fs');
const file = 'src/lib/articles.ts';
let content = fs.readFileSync(file, 'utf8');

const map = [
  "/journal/yellow-leaves.jpg", // 1. Yellow leaves
  "/journal/monstera-fenestration.jpg", // 2. Monstera
  "/journal/brown-leaf-tips.jpg", // 3. Brown tips 
  "/journal/drooping-plant.jpg", // 4. Drooping wilting
  "/journal/fungus-gnats-sticky-trap.svg", // 5. Fungus gnats
  "/journal/mealybug-white-spots.jpg", // 6. White spots
  "/journal/drooping-plant.jpg", // 7. Root rot
  "/journal/yellow-leaves.jpg", // 8. Overwatered
  "/journal/brown-leaf-tips.jpg", // 9. Underwatered
  "/journal/yellow-leaves.jpg", // 10. Watering guidelines
  "/journal/brown-leaf-tips.jpg", // 11. Losing leaves
  "/journal/brown-leaf-tips.jpg", // 12. Curling
  "/journal/mealybug-white-spots.jpg", // 13. Black spots
  "/journal/fungus-gnats-sticky-trap.svg", // 14. White mold
  "/journal/mealybug-white-spots.jpg", // 15. Spider mites
  "/journal/monstera-fenestration.jpg", // 16. Leggy
  "/journal/yellow-leaves.jpg", // 17. Pothos
  "/journal/drooping-plant.jpg", // 18. Peace Lily
  "/journal/brown-leaf-tips.jpg", // 19. Calathea
  "/journal/drooping-plant.jpg" // 20. Snake plant
];

let index = 0;
content = content.replace(/imageUrl:\s*\"[^\"]*\"/g, () => {
    const url = map[index] || map[0];
    index++;
    return 'imageUrl: \"' + url + '\"';
});

fs.writeFileSync(file, content);
console.log('Replaced ' + index + ' urls');
