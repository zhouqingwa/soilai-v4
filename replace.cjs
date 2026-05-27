const fs = require('fs');
const file = 'src/lib/articles.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/https:\/\/image\.pollinations\.ai\/prompt\/A%20yellow%20leaf%20on%20a%20beautiful%20green%20houseplant%20indoors,%20cinematic%20lighting,%20realistic%20photography/g, 'https://images.unsplash.com/photo-1596547609652-9cb5d8dceddf?w=800&q=80&fit=crop');

content = content.replace(/https:\/\/image\.pollinations\.ai\/prompt\/A%20healthy%20Monstera%20leaf%20with%20beautiful%20splits%20and%20holes,%20aesthetic%20indoor%20plant,%20cinematic%20lighting/g, 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80&fit=crop');

content = content.replace(/https:\/\/image\.pollinations\.ai\/prompt\/Close%20up%20of%20a%20beautiful%20houseplant%20leaf%20with%20crispy%20brown%20tips,%20cinematic%20lighting,%20macro%20photography/g, 'https://images.unsplash.com/photo-1595123565551-789a8c1f06be?w=800&q=80&fit=crop');

content = content.replace(/https:\/\/image\.pollinations\.ai\/prompt\/A%20drooping%20wilted%20Monstera%20houseplant%20in%20a%20beautiful%20terracotta%20pot,%20soft%20indoor%20lighting,%20realistic%20photography/g, 'https://images.unsplash.com/photo-1549558913-c21516e53093?w=800&q=80&fit=crop');

content = content.replace(/https:\/\/image\.pollinations\.ai\/prompt\/A%20houseplant%20in%20a%20stylish%20pot%20with%20a%20yellow%20sticky%20trap%20for%20insects,%20indoor%20gardening,%20cinematic%20lighting/g, 'https://images.unsplash.com/photo-1622383563227-04403abdd2fb?w=800&q=80&fit=crop');

content = content.replace(/https:\/\/image\.pollinations\.ai\/prompt\/Macro%20photography%20of%20a%20houseplant%20leaf%20with%20white%20fuzzy%20mealybug%20spots,%20high%20resolution,%20cinematic%20lighting/g, 'https://images.unsplash.com/photo-1598444391693-0182ecb822c9?w=800&q=80&fit=crop');

fs.writeFileSync(file, content);
console.log('Replacement done.');
