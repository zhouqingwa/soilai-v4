const fs = require('fs');

const goodImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Chlorosis.jpg/800px-Chlorosis.jpg", // 1. Yellow leaves
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Monstera_deliciosa2.jpg/800px-Monstera_deliciosa2.jpg", // 2. Monstera
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Spider_plant_chlorosis.jpg/800px-Spider_plant_chlorosis.jpg", // 3. Brown tips 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Tigridia_pavonia_-_wilted_overnight_-_2018-07-25_focus_stack.jpg/800px-Tigridia_pavonia_-_wilted_overnight_-_2018-07-25_focus_stack.jpg", // 4. Drooping wilting
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sciara_hemerobioides_-_Flickr_-_gailhampshire.jpg/800px-Sciara_hemerobioides_-_Flickr_-_gailhampshire.jpg", // 5. Fungus gnats
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Powdery_mildew_on_oak_leaf.jpg/800px-Powdery_mildew_on_oak_leaf.jpg", // 6. White spots powdery mildew
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Root_rot_in_avocado.jpg/800px-Root_rot_in_avocado.jpg", // 7. Root rot
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Watering_indoor_plants.jpg/800px-Watering_indoor_plants.jpg", // 8. Overwatered
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Dry_earth.jpg/800px-Dry_earth.jpg", // 9. Underwatered
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Watering_can_green.jpg/800px-Watering_can_green.jpg", // 10. Watering guidelines
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Fallen_leaves_on_the_ground.jpg/800px-Fallen_leaves_on_the_ground.jpg", // 11. Losing leaves
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Leaf_curl_virus_on_tomato.jpg/800px-Leaf_curl_virus_on_tomato.jpg", // 12. Curling
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Black_spot_disease_on_rose_leaf.jpg/800px-Black_spot_disease_on_rose_leaf.jpg", // 13. Black spots
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Mold_in_flower_pot.jpg/800px-Mold_in_flower_pot.jpg", // 14. White mold
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Red_spider_mite_%28Tetranychus_urticae%29.jpg/800px-Red_spider_mite_%28Tetranychus_urticae%29.jpg", // 15. Spider mites
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Etiolation_in_potatoes.jpg/800px-Etiolation_in_potatoes.jpg", // 16. Leggy
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Epipremnum_aureum_3.jpg/800px-Epipremnum_aureum_3.jpg", // 17. Pothos
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Spathiphyllum_floribundum_1.jpg/800px-Spathiphyllum_floribundum_1.jpg", // 18. Peace Lily
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Calathea_makoyana_01.jpg/800px-Calathea_makoyana_01.jpg", // 19. Calathea
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sansevieria_trifasciata_2.jpg/800px-Sansevieria_trifasciata_2.jpg" // 20. Snake plant
];

const file = 'src/lib/articles.ts';
let content = fs.readFileSync(file, 'utf8');

let index = 0;
content = content.replace(/imageUrl:\s*\"[^\"]*\"/g, () => {
    const url = goodImages[index] || goodImages[0];
    index++;
    return 'imageUrl: \"' + url + '\"';
});

fs.writeFileSync(file, content);
console.log('Replaced ' + index + ' urls');
