/* ==========================================================
   Catalogue Squishland
   rise = temps de remontée (s) · soft = douceur /5
   ========================================================== */
const CATEGORIES = {
  animaux: 'Animaux',
  gourmandises: 'Gourmandises',
  fruits: 'Fruits',
  fantaisie: 'Fantaisie',
  sensoriel: 'Sensoriel',
  halloween: 'Halloween'
};

const PRODUCTS = [
  { id: 'tube-paillettes-halloween', name: 'Tube Paillettes Halloween', shape: 'mochi', c1: '#F7CFEA', c2: '#C2338F', cat: 'halloween', price: 2, rise: 2, soft: 5, rating: 4.9, reviews: 64, tags: ['new'], rank: -45,
    desc: "Un tube de gel rose et violet rempli de paillettes, de nœuds et de petites chauves-souris qui flottent. On le presse, tout tourbillonne." },
  { id: 'citrouille-doree', name: 'Citrouille Dorée', shape: 'peach', c1: '#FFE7A8', c2: '#F2B33D', cat: 'halloween', price: 2, rise: 6, soft: 5, rating: 4.9, reviews: 58, tags: ['new'], rank: -44,
    desc: "Une citrouille jaune doré avec son visage sculpté en relief. Elle s'écrase en douceur et remonte lentement." },
  { id: 'pomme-araignee', name: 'Pomme Toile d\'Araignée', shape: 'peach', c1: '#FFC7A8', c2: '#F2541B', cat: 'halloween', price: 2, rise: 3, soft: 4, rating: 4.8, reviews: 51, tags: ['new'], rank: -43,
    desc: "Une pomme d'amour orange translucide décorée d'une toile d'araignée. Brillante, gélatineuse et un peu effrayante." },
  { id: 'pochettes-gel', name: 'Pochettes Gel Mellow', shape: 'mochi', c1: '#BFEFEA', c2: '#3FBFB0', cat: 'sensoriel', price: 2, rise: 2, soft: 5, rating: 4.9, reviews: 96, tags: ['new'], rank: -42,
    desc: "Une pochette souple remplie de gel transparent qui ondule sous les doigts. On la presse, on la tord, elle reprend sa forme. Turquoise, rose, clair, vert ou rouge." },
  { id: 'boule-mouchetee', name: 'Boule Mouchetée', shape: 'mochi', c1: '#F4F1E8', c2: '#D9D2BF', cat: 'sensoriel', price: 2, rise: 5, soft: 5, rating: 4.9, reviews: 188, tags: ['best'], rank: -41,
    desc: "Une boule toute douce façon œuf de caille, avec ses petites taches noires. Elle s'écrase entièrement dans la main et remonte doucement." },
  { id: 'boule-rose-douce', name: 'Boule Rose Douce', shape: 'mochi', c1: '#FFD6E6', c2: '#FF9CC2', cat: 'sensoriel', price: 2, rise: 4, soft: 5, rating: 4.9, reviews: 172, tags: ['best'], rank: -40,
    desc: "Une boule rose pastel au toucher velouté, moelleuse comme un mochi. Simple, douce et impossible à lâcher." },
  { id: 'donut-menthe', name: 'Donut Menthe Givrée', shape: 'donut', c1: '#D8F3EC', c2: '#8FD9C6', cat: 'gourmandises', price: 2, rise: 4, soft: 4, rating: 4.8, reviews: 141, tags: ['best'], rank: -38,
    desc: "Un donut couleur menthe à l'eau, souple et rebondissant. On l'étire, on l'écrase, il revient toujours en forme." },
  { id: 'pot-miel-chiboki', name: 'Pot de Miel Chiboki', shape: 'mochi', c1: '#FFE3A6', c2: '#FFAA2B', cat: 'gourmandises', price: 2, rise: 3, soft: 4, rating: 4.9, reviews: 77, tags: ['new'], rank: -37,
    desc: "Un pot de miel en gel orangé avec sa petite cuillère en bois. Le gel coule et pétille de paillettes dorées quand on le presse." },
  { id: 'lait-chiboki', name: 'Bouteille de Lait Chiboki', shape: 'mochi', c1: '#E9F7EE', c2: '#A8DDB9', cat: 'gourmandises', price: 2, rise: 3, soft: 4, rating: 4.8, reviews: 68, tags: ['new'], rank: -36,
    desc: "Une petite bouteille de lait en gel, version vanille ou matcha, avec des perles qui flottent à l'intérieur. Douce, fraîche et ultra satisfaisante." },
  { id: 'fiole-potion', name: 'Fiole Potion Magique', shape: 'mochi', c1: '#FFE0EC', c2: '#F28AB5', cat: 'halloween', price: 2, rise: 2, soft: 4, rating: 4.9, reviews: 83, tags: ['new'], rank: -35,
    desc: "Une fiole en gel rose et violet avec une mini potion qui flotte dedans. Retourne-la, presse-la et regarde le liquide danser." },
  { id: 'bocal-fruits-gelee', name: 'Bocal Fruits en Gelée', shape: 'mochi', c1: '#FFE6B8', c2: '#FFB347', cat: 'fruits', price: 2, rise: 2, soft: 4, rating: 4.8, reviews: 59, tags: ['new'], rank: -34,
    desc: "Une boule de gelée transparente remplie de morceaux de fruits : orange, fraise, fruit du dragon… On voit les fruits bouger quand on l'écrase." },
  { id: 'pomme-verte', name: 'Pomme Verte Squishy', shape: 'avocado', c1: '#DDF3B5', c2: '#7CC43E', cat: 'fruits', price: 2, rise: 6, soft: 4, rating: 4.8, reviews: 64, tags: ['new'], rank: -33,
    desc: "Une pomme verte brillante plus vraie que nature. Elle s'enfonce sous le doigt et remonte lentement." },
  { id: 'cube-fromage', name: 'Cube Fromage Squishy', shape: 'toast', c1: '#FFF8EA', c2: '#EDE1C4', cat: 'gourmandises', price: 2, rise: 7, soft: 5, rating: 4.8, reviews: 52, tags: ['new'], rank: -32,
    desc: "Un cube de fromage blanc avec ses trous en relief, à écraser à pleine main. Mousse dense qui remonte en 7 secondes." },
  { id: 'mochi-coeur-colore', name: 'Mochi Cœur Coloré', shape: 'mochi', c1: '#FFF4F0', c2: '#F5D3CB', cat: 'sensoriel', price: 2, rise: 3, soft: 5, rating: 4.9, reviews: 71, tags: ['new'], rank: -31,
    desc: "Une boule mochi translucide avec un cœur de couleur au centre : jaune, rouge ou vert. Le cœur se déforme quand on la presse." },
  { id: 'boule-ocean-perles', name: 'Boule Océan Perles', shape: 'cloud', c1: '#C9F0F7', c2: '#3EC1D8', cat: 'sensoriel', price: 2, rise: 2, soft: 5, rating: 4.9, reviews: 90, tags: ['new'], rank: -30,
    desc: "Une grosse boule bleu lagon remplie de perles de gel et de perles nacrées. Les perles roulent sous les doigts comme des vagues." },
  { id: 'boule-choco-caramel', name: 'Boule Choco Caramel', shape: 'mochi', c1: '#EBD3C0', c2: '#A9653B', cat: 'gourmandises', price: 2, rise: 2, soft: 4, rating: 4.7, reviews: 47, tags: ['new'], rank: -29,
    desc: "Une boule de gel transparente remplie de petits morceaux façon chocolat et caramel. Gourmande à regarder, satisfaisante à écraser." },
  { id: 'guimauve-marbree', name: 'Guimauve Marbrée', shape: 'cloud', c1: '#E7F1FB', c2: '#F4D9A8', cat: 'sensoriel', price: 2, rise: 4, soft: 5, rating: 4.8, reviews: 66, tags: ['new'], rank: -28,
    desc: "Une pâte façon guimauve marbrée bleu, rose et jaune qui s'étire et craquelle sous les doigts. Chaque squish change son motif." },
  { id: 'donut-fleuri', name: 'Donut Fleuri', shape: 'donut', c1: '#E6F5EC', c2: '#F2B6C8', cat: 'gourmandises', price: 2, rise: 5, soft: 4, rating: 4.8, reviews: 44, tags: ['new'], rank: -27,
    desc: "Un donut décoré de petites fleurs roses et vertes, comme une couronne de printemps. Doux, rebondissant et trop joli." },
  { id: 'pochette-galaxie', name: 'Pochette Paillettes Galaxie', shape: 'mochi', c1: '#F7D0EF', c2: '#B03E9C', cat: 'fantaisie', price: 2, rise: 2, soft: 5, rating: 4.8, reviews: 62, tags: ['new'], rank: -25,
    desc: "Une pochette de gel rose et violet pleine de paillettes et d'étoiles qui tourbillonnent quand on la presse." },
  { id: 'citrouille-jelly', name: 'Citrouille Jelly', shape: 'mochi', c1: '#FFE0B8', c2: '#FF9A2F', cat: 'halloween', price: 2, rise: 3, soft: 5, rating: 4.8, reviews: 49, tags: ['new'], rank: -24,
    desc: "Une galette de gel orange avec une petite maison hantée à l'intérieur. Le squishy parfait pour Halloween." },
  { id: 'petit-fantome', name: 'Petit Fantôme', shape: 'ghost', c1: '#FFFFFF', c2: '#E3DDF2', cat: 'halloween', price: 2, rise: 6, soft: 5, rating: 4.9, reviews: 73, tags: ['new'], rank: -23,
    desc: "Un petit fantôme tout blanc aux joues roses et au grand sourire. Mousse douce qui remonte lentement." },
  { id: 'porte-cles-perles', name: 'Porte-clés Perles Bleues', shape: 'mochi', c1: '#D6ECFF', c2: '#3B7BD9', cat: 'sensoriel', price: 2, rise: 2, soft: 4, rating: 4.7, reviews: 55, tags: ['new'], rank: -22,
    desc: "Trois perles de gel bleu nuit étoilé sur un porte-clés. À accrocher au sac pour avoir toujours un squishy sous la main." },
  { id: 'bretzel-choco', name: 'Bretzel Choco Menthe', shape: 'donut', c1: '#E9D6C8', c2: '#7A4A2E', cat: 'gourmandises', price: 2, rise: 5, soft: 4, rating: 4.7, reviews: 46, tags: ['new'], rank: -21,
    desc: "Un bretzel nappé de chocolat avec un filet menthe, qui s'étire et se tord sans casser." },
  { id: 'oursons-gummy', name: 'Oursons Gummy Géants', shape: 'bear', c1: '#FFC2E6', c2: '#F28AC9', cat: 'animaux', price: 2, rise: 3, soft: 4, rating: 4.9, reviews: 142, tags: ['new', 'best'], rank: -19,
    desc: "Des oursons en gomme translucide façon bonbon, doux et rebondissants. On les écrase, on les étire, ils reprennent leur forme instantanément. Bleu, rose, violet ou jaune." },
  { id: 'tubes-gel', name: 'Tubes Gel Bubbles', shape: 'mochi', c1: '#BFE3FF', c2: '#6FB5F2', cat: 'sensoriel', price: 2, rise: 2, soft: 5, rating: 4.8, reviews: 88, tags: ['new'], rank: -18,
    desc: "Un tube rempli de gel visqueux et de grosses bulles colorées. Ça s'écrase, ça coule entre les doigts et ça ne colle pas. Citron, fraise, myrtille ou kiwi." },
  { id: 'mangue-squishy', name: 'Mangue Slow Rising', shape: 'avocado', c1: '#E8F08A', c2: '#B7CF4A', cat: 'fruits', price: 2, rise: 9, soft: 5, rating: 4.9, reviews: 64, tags: ['new'], rank: -17,
    desc: "Une mangue au toucher velouté, ultra réaliste, qui s'enfonce profondément sous le doigt et remonte en 9 secondes. Dégradé vert et jaune." },
  { id: 'glacons-squishy', name: 'Glaçons Squishy', shape: 'mochi', c1: '#D4EEFF', c2: '#9DD3F7', cat: 'sensoriel', price: 2, rise: 2, soft: 3, rating: 4.7, reviews: 51, tags: ['new'], rank: -16,
    desc: "Des cubes transparents qui ressemblent à de vrais glaçons, mais tout mous. Fraîcheur visuelle garantie, à écraser par poignées. Bleu ou rose." },
  { id: 'beurre-sale-jaune', name: 'Beurre Salé Jaune', shape: 'toast', c1: '#FFF1A6', c2: '#F5CE3C', cat: 'gourmandises', price: 2, rise: 8, soft: 5, rating: 4.8, reviews: 58, tags: [], rank: -15,
    desc: "La plaquette de beurre salé classique en version squishy : mousse slow rising lisse et dense, remontée lente de 8 secondes." },
  { id: 'raisin-perles', name: 'Raisin Perles Géantes', shape: 'mochi', c1: '#F3B6F0', c2: '#D56BD0', cat: 'sensoriel', price: 2, rise: 2, soft: 5, rating: 4.9, reviews: 264, tags: ['best'], rank: -14,
    desc: "Une grappe de raisin faite de grosses perles de gel qui roulent sous les doigts. Ultra relaxant à malaxer, livrée dans son sachet refermable. Existe en violet et en vert." },
  { id: 'beurre-mochi', name: 'Beurre Mochi Étirable', shape: 'toast', c1: '#FFF4C8', c2: '#F2D98A', cat: 'gourmandises', price: 2, rise: 3, soft: 5, rating: 5.0, reviews: 158, tags: ['new'], rank: -13,
    desc: "Un bloc de « beurre » à la texture mochi : il se déchire, s'étire en longs fils et se remodèle à l'infini. La sensation la plus satisfaisante du moment, vue des millions de fois sur TikTok." },
  { id: 'fruits-billes', name: 'Fruits Billes Gel', shape: 'strawberry', c1: '#FF8FA3', c2: '#F0506E', cat: 'sensoriel', price: 2, rise: 2, soft: 4, rating: 4.8, reviews: 301, tags: [], rank: -12,
    desc: "Fraise, pastèque, ananas, raisin… des balles anti-stress en forme de fruits, remplies de billes de gel colorées. Modèle surprise parmi la collection." },
  { id: 'lingot-or', name: "Lingot d'Or Squishy", shape: 'toast', c1: '#F2D27A', c2: '#C79A2E', cat: 'fantaisie', price: 2, rise: 6, soft: 4, rating: 4.8, reviews: 73, tags: ['limited'], rank: -11,
    desc: "Le lingot d'or 999.9 le plus doux du monde. Finition dorée brillante, mousse slow rising dense. Existe aussi en version plaquette de beurre dorée." },
  { id: 'batons-perles', name: 'Bâtons Perles Sensoriels', shape: 'mochi', c1: '#A8F0E0', c2: '#4FCFB5', cat: 'sensoriel', price: 2, rise: 2, soft: 4, rating: 4.7, reviews: 119, tags: ['new'], rank: -10,
    desc: "Des tubes souples remplis de petites perles d'eau qui roulent et crépitent sous les doigts. Parfaits pour occuper les mains en classe ou au bureau. Turquoise, jaune, rose, bleu ou rouge." },
  { id: 'boule-perles', name: 'Boule Perles Arc-en-ciel', shape: 'cloud', c1: '#D6ECFF', c2: '#9BC7F5', cat: 'sensoriel', price: 2, rise: 2, soft: 5, rating: 4.9, reviews: 186, tags: [], rank: -9,
    desc: "Une grosse boule remplie de perles nacrées multicolores. Elle se déforme dans tous les sens avec une sensation incroyable de perles qui glissent." },
  { id: 'savons-squishy', name: 'Savon Squishy', shape: 'mochi', c1: '#DCEEFF', c2: '#9FCBF2', cat: 'fantaisie', price: 2, rise: 7, soft: 5, rating: 4.7, reviews: 94, tags: ['new'], rank: -8,
    desc: "Il ressemble à une vraie savonnette… mais il s'écrase comme un nuage. Mousse slow rising, gravure SOAP en relief. Bleu, blanc ou rose." },
  { id: 'beurre-sale-rose', name: 'Beurre Salé Rose', shape: 'toast', c1: '#FFD1E0', c2: '#F5A3C0', cat: 'gourmandises', price: 2, rise: 8, soft: 5, rating: 4.8, reviews: 67, tags: [], rank: -7,
    desc: "Une plaquette de beurre salé version rose bonbon. Mousse slow rising lisse et douce, remontée lente de 8 secondes." },
  { id: 'boules-paillettes', name: 'Boules Paillettes Kawaii', shape: 'mochi', c1: '#FFD1E3', c2: '#FF9CC2', cat: 'sensoriel', price: 2, rise: 3, soft: 4, rating: 4.9, reviews: 212, tags: ['best', 'new'], rank: -6,
    desc: "Des boules anti-stress remplies de gel et de paillettes holographiques, avec une petite bouille trop mignonne. Elles s'étirent, se déforment et reprennent leur forme instantanément. Existe en rose, vert et violet." },
  { id: 'donuts-pastel', name: 'Donut Pastel Glacé', shape: 'donut', c1: '#FFC7DA', c2: '#FF9CC2', cat: 'gourmandises', price: 2, rise: 6, soft: 4, rating: 4.8, reviews: 176, tags: ['new'], rank: -5,
    desc: "Un donut au glaçage brillant ultra réaliste, avec ses vermicelles. Mousse slow rising douce et légèrement parfumée. Coloris au choix : rose, pistache, citron, bleu ou chocolat." },
  { id: 'pasteque-juicy', name: 'Pastèque Juicy', shape: 'strawberry', c1: '#FF8A94', c2: '#F25A6A', cat: 'fruits', price: 2, rise: 7, soft: 5, rating: 4.9, reviews: 143, tags: ['best'], rank: -4,
    desc: "Une tranche de pastèque toute ronde qui s'enfonce sous le doigt puis remonte doucement. Dégradé rouge, blanc et vert fidèle au vrai fruit, avec ses pépins en relief." },
  { id: 'tablette-choco', name: 'Tablette Chocolat Squishy', shape: 'toast', c1: '#B98062', c2: '#7A4A2E', cat: 'gourmandises', price: 2, rise: 5, soft: 4, rating: 4.7, reviews: 98, tags: ['new'], rank: -3,
    desc: "Une tablette de chocolat au lait plus vraie que nature, qui se plie et s'écrase carré par carré. Brillante, souple et incroyablement satisfaisante." },
  { id: 'beurre-rose', name: 'Butter Soft & Chewy Rose', shape: 'mochi', c1: '#FFD1E3', c2: '#F7A8C6', cat: 'gourmandises', price: 2, rise: 4, soft: 5, rating: 4.8, reviews: 121, tags: ['new'], rank: -2,
    desc: "Le squishy tendance du moment : une plaquette de beurre dans son emballage rose, moelleuse et étirable. Existe aussi en version menthe." },
  { id: 'beurre-jelly', name: 'Butter Jelly Géant', shape: 'mochi', c1: '#FFF1A6', c2: '#FFD24D', cat: 'gourmandises', price: 2, rise: 2, soft: 5, rating: 4.9, reviews: 87, tags: ['limited'], rank: -1,
    desc: "Une plaquette de beurre en gel translucide qui s'étire à l'infini et reprend sa forme en un instant. La texture la plus satisfaisante de la boutique." },
];

/* Personnages dessinés : décor du site uniquement (logo, accueil, Squish Lab…), pas en vente */
const MASCOTS = [
  { id: 'momo-peche', name: 'Momo la Pêche', shape: 'peach', c1: '#FFC7B8', c2: '#FF8E86', cat: 'fruits', price: 2, rise: 9, soft: 5, rating: 4.9, reviews: 1284, tags: ['best'], rank: 1,
    desc: "Notre best-seller absolu. Momo est une pêche ultra moelleuse qui s'écrase entièrement dans la main et remonte en 9 longues secondes. Légèrement parfumée à la pêche." },
  { id: 'neko-mochi', name: 'Neko Mochi', shape: 'cat', c1: '#FFF0F5', c2: '#F9BCD3', cat: 'animaux', price: 2, rise: 7, soft: 5, rating: 4.9, reviews: 962, tags: ['best'], mood: 'cat', rank: 2,
    desc: "Un petit chat tout rond avec des oreilles qui rebondissent. Sa mousse haute densité offre une résistance parfaite, idéale pendant les appels vidéo interminables." },
  { id: 'panda-dodo', name: 'Panda Dodo', shape: 'panda', c1: '#FFFFFF', c2: '#E4DEEE', cat: 'animaux', price: 2, rise: 8, soft: 4, rating: 4.8, reviews: 731, tags: ['best'], mood: 'sleepy', rank: 3,
    desc: "Il dort tout le temps, sauf quand tu l'écrases. Panda Dodo est le compagnon idéal de bureau pour les pauses anti-stress." },
  { id: 'fraisie', name: 'Fraisie', shape: 'strawberry', c1: '#FF8FA3', c2: '#F0506E', cat: 'fruits', price: 2, rise: 6, soft: 4, rating: 4.7, reviews: 418, tags: [], rank: 9,
    desc: "Une fraise pétillante avec de petites graines en relief pour une sensation tactile encore plus satisfaisante. Parfum fraise tagada." },
  { id: 'nuage-calin', name: 'Nuage Câlin', shape: 'cloud', c1: '#EEF4FF', c2: '#B7CBF4', cat: 'fantaisie', price: 2, rise: 10, soft: 5, rating: 5.0, reviews: 356, tags: ['new'], mood: 'sleepy', rank: 4,
    desc: "Le plus doux de toute la collection. Sa mousse aérée donne l'impression d'écraser un vrai nuage. Remontée hypnotique de 10 secondes." },
  { id: 'donut-rose', name: 'Donut Rose Glacé', shape: 'donut', c1: '#FFB5D0', c2: '#FF7FAE', cat: 'gourmandises', price: 2, rise: 5, soft: 4, rating: 4.8, reviews: 588, tags: [], rank: 6,
    desc: "Glaçage rose, vermicelles multicolores et parfum vanille. Si réaliste que tu vas avoir envie de le croquer (ne le fais pas)." },
  { id: 'toast-beurre', name: 'Toast Beurre', shape: 'toast', c1: '#FFF1CF', c2: '#E3A86A', cat: 'gourmandises', price: 2, rise: 7, soft: 4, rating: 4.6, reviews: 274, tags: [], rank: 12,
    desc: "Une tranche de pain de mie dorée avec sa petite noix de beurre. Le squishy du petit-déjeuner, parfum brioche." },
  { id: 'avo-calin', name: 'Avo-Câlin', shape: 'avocado', c1: '#E8F6B8', c2: '#A9D46A', cat: 'fruits', price: 2, rise: 6, soft: 3, rating: 4.7, reviews: 391, tags: [], rank: 10,
    desc: "Un avocat trop mignon avec son noyau tout doux. Plus ferme que les autres, parfait pour les squisheurs qui aiment la résistance." },
  { id: 'grenouille-bubu', name: 'Grenouille Bubu', shape: 'frog', c1: '#B8EFA8', c2: '#6FC96A', cat: 'animaux', price: 2, rise: 5, soft: 4, rating: 4.8, reviews: 507, tags: [], rank: 8,
    desc: "Bubu a de grands yeux et un sourire contagieux. Ses deux petites bosses sont la partie la plus satisfaisante à écraser." },
  { id: 'boo-fantome', name: 'Boo le Fantôme', shape: 'ghost', c1: '#FFFFFF', c2: '#DCD3F2', cat: 'fantaisie', price: 2, rise: 8, soft: 5, rating: 4.9, reviews: 203, tags: ['limited'], mood: 'wow', rank: 7,
    desc: "Édition limitée. Boo brille légèrement dans le noir après avoir été exposé à la lumière. Pas effrayant du tout, promis." },
  { id: 'etoile-filante', name: 'Étoile Filante', shape: 'star', c1: '#FFF3B0', c2: '#FFCB45', cat: 'fantaisie', price: 2, rise: 4, soft: 3, rating: 4.6, reviews: 188, tags: [], rank: 14,
    desc: "Une étoile dorée à cinq branches, rebondissante et pleine d'énergie. Remontée rapide pour les squisheurs impatients." },
  { id: 'mochi-matcha', name: 'Mochi Matcha', shape: 'mochi', c1: '#DDF2CF', c2: '#9ACF84', cat: 'gourmandises', price: 2, rise: 9, soft: 5, rating: 4.8, reviews: 644, tags: ['best'], rank: 5,
    desc: "Le mochi japonais dans toute sa splendeur. Format poche, douceur maximale et remontée ultra lente. Parfum thé vert." },
  { id: 'cupcake-licorne', name: 'Cupcake Licorne', shape: 'cupcake', c1: '#E7D9FF', c2: '#B69CFF', cat: 'gourmandises', price: 2, rise: 6, soft: 4, rating: 4.7, reviews: 152, tags: ['new'], rank: 11,
    desc: "Crème lavande, cerise et paillettes. Un cupcake magique au parfum barbe à papa." },
  { id: 'lapin-guimauve', name: 'Lapin Guimauve', shape: 'bunny', c1: '#FFF7F0', c2: '#F5CDB8', cat: 'animaux', price: 2, rise: 9, soft: 5, rating: 4.9, reviews: 478, tags: [], rank: 13,
    desc: "Doux comme une guimauve, avec de grandes oreilles qui se plient quand tu l'écrases. Parfum marshmallow." },
  { id: 'ourson-miel', name: 'Ourson Miel', shape: 'bear', c1: '#F7D7A8', c2: '#D9A064', cat: 'animaux', price: 2, rise: 7, soft: 4, rating: 4.8, reviews: 332, tags: [], rank: 15,
    desc: "Un ourson tout rond couleur miel, avec un museau encore plus moelleux que le reste. Le câlin parfait." },
  { id: 'poussin-pompon', name: 'Poussin Pompon', shape: 'chick', c1: '#FFF1A6', c2: '#FFD24D', cat: 'animaux', price: 2, rise: 5, soft: 4, rating: 4.7, reviews: 245, tags: [], rank: 16,
    desc: "Petit poussin, gros effet. Ses ailes minuscules et sa mèche rebelle en font le chouchou des plus jeunes." },
  { id: 'peche-geante', name: 'Pêche Géante XXL', shape: 'peach', c1: '#FFD2C2', c2: '#FF9A8B', cat: 'fruits', price: 2, rise: 12, soft: 5, rating: 5.0, reviews: 97, tags: ['xxl', 'new'], xxl: true, rank: 17,
    desc: "30 cm de pur bonheur. La version géante de Momo, à écraser à deux mains ou à utiliser comme coussin. Remontée record de 12 secondes." },
  { id: 'neko-lavande', name: 'Neko Lavande', shape: 'cat', c1: '#E6DBFF', c2: '#AE95F5', cat: 'animaux', price: 2, rise: 8, soft: 5, rating: 4.9, reviews: 139, tags: ['limited'], mood: 'cat', rank: 18,
    desc: "Édition limitée de Neko Mochi dans une teinte lavande apaisante, parfumée à la lavande de Provence." },
  { id: 'donut-choco', name: 'Donut Choco', shape: 'donut', c1: '#B98062', c2: '#8A5638', cat: 'gourmandises', price: 2, rise: 5, soft: 4, rating: 4.7, reviews: 301, tags: [], rank: 19,
    desc: "Glaçage chocolat fondant et vermicelles arc-en-ciel. Parfum cacao irrésistible." },
  { id: 'nuage-geant', name: 'Nuage Géant XXL', shape: 'cloud', c1: '#FFF5FB', c2: '#F2C4E0', cat: 'fantaisie', price: 2, rise: 14, soft: 5, rating: 5.0, reviews: 64, tags: ['xxl', 'limited'], xxl: true, mood: 'sleepy', rank: 20,
    desc: "Notre squishy le plus lent : 14 secondes de remontée. Un nuage rose géant de 35 cm, parfait pour les siestes." },
  { id: 'ourson-geant', name: 'Ourson Géant XXL', shape: 'bear', c1: '#FFE3EE', c2: '#F7A8C6', cat: 'animaux', price: 2, rise: 11, soft: 5, rating: 4.9, reviews: 81, tags: ['xxl'], xxl: true, rank: 21,
    desc: "Le plus gros câlin de la boutique. 35 cm de mousse slow rising ultra dense, livré dans sa boîte cadeau." },
  { id: 'mochi-sakura', name: 'Mochi Sakura', shape: 'mochi', c1: '#FFE4EC', c2: '#FFADC6', cat: 'gourmandises', price: 2, rise: 9, soft: 5, rating: 4.8, reviews: 420, tags: ['new'], mood: 'cat', rank: 22,
    desc: "Le mochi de printemps parfumé à la fleur de cerisier. Tout petit, tout doux, tout mignon." },
  { id: 'boo-citrouille', name: 'Boo Citrouille', shape: 'ghost', c1: '#FFD9A8', c2: '#FF9F43', cat: 'fantaisie', price: 2, rise: 7, soft: 4, rating: 4.8, reviews: 58, tags: ['limited', 'new'], rank: 23,
    desc: "Le cousin orange de Boo, sorti spécialement pour Halloween. Parfum épices et citrouille." },
  { id: 'grenouille-cerise', name: 'Grenouille Cerise', shape: 'frog', c1: '#FFC9DA', c2: '#FF8BB0', cat: 'animaux', price: 2, rise: 6, soft: 4, rating: 4.7, reviews: 112, tags: [], rank: 24,
    desc: "Bubu en version rose bonbon. Même sourire, même bosses irrésistibles, parfum cerise." }
];

/* Liens de paiement par taille de panier (2 € / squishy).
   On prend toujours le palier le plus cher dont le prix ne dépasse pas le
   sous-total : le client ne paie jamais plus que 2 € × quantité. */
const MAX_ITEMS = 10;
const PACKS = [
  { min: 1,  price: 2.00,  url: 'https://t.trklinkx.com/click?pid=4784&offer_id=10936' },
  { min: 2,  price: 3.95,  url: 'https://t.trklinkx.com/click?pid=4784&offer_id=12325' },
  { min: 5,  price: 9.99,  url: 'https://t.trklinkx.com/click?pid=4784&offer_id=13179&sub3=9,99' },
  { min: 10, price: 19.99, url: 'https://t.trklinkx.com/click?pid=4784&offer_id=13057&sub3=19' }
];
function packFor(n) {
  const sub = n * 2;
  return PACKS.filter(p => n >= p.min && p.price <= sub).pop() || null;
}
function nextPack(n) { return PACKS.find(p => p.min > n) || null; }

/* Calendrier de l'Avent : commande à part (hors panier), avec son propre lien. */
const CALENDAR = {
  name: "Calendrier de l'Avent Squishy",
  price: 19.99,
  doors: 24,
  url: 'https://t.trklinkx.com/click?pid=4784&offer_id=13057&sub3=19'
};

const COLOR_VARIANTS = [
  { name: 'Rose', c1: '#FFD1E3', c2: '#FF9CC2' },
  { name: 'Lavande', c1: '#E6DBFF', c2: '#B69CFF' },
  { name: 'Menthe', c1: '#D2F5E8', c2: '#7FD9B8' },
  { name: 'Citron', c1: '#FFF3B8', c2: '#FFD24D' },
  { name: 'Ciel', c1: '#DCEEFF', c2: '#8EC5FF' }
];

const SIZES = [
  { id: 'S', label: 'Mini', dim: '7 cm', delta: 0 },
  { id: 'M', label: 'Classique', dim: '11 cm', delta: 0 },
  { id: 'L', label: 'Jumbo', dim: '18 cm', delta: 0 }
];

const REVIEWS = [
  { name: 'Léa', meta: '14 ans', stars: 5, product: 'raisin-perles', text: "Je l'ai emmené au collège et toute ma classe veut le même. Les perles sous les doigts, c'est hypnotisant." },
  { name: 'Thomas', meta: 'papa de 2 enfants', stars: 5, product: 'beurre-sale-jaune', text: "Commandé pour ma fille, finalement il est sur mon bureau. Parfait pendant les réunions." },
  { name: 'Inès', meta: 'étudiante', stars: 5, product: 'beurre-mochi', text: "La texture qui s'étire est complètement folle. Mon rituel anti-stress pendant les partiels." },
  { name: 'Maëlys', meta: 'collectionneuse', stars: 5, product: 'donuts-pastel', text: "J'ai plus de 40 squishies et le donut est un des plus réalistes que j'ai." },
  { name: 'Yanis', meta: '11 ans', stars: 4, product: 'oursons-gummy', text: "Les oursons sont trop drôles, on dirait des vrais bonbons. Livré super vite." },
  { name: 'Camille', meta: 'infirmière', stars: 5, product: 'glacons-squishy', text: "Petit format qui tient dans la poche de ma blouse. Ça m'aide vraiment à décompresser entre deux gardes." },
  { name: 'Sarah', meta: 'maman', stars: 5, product: 'pasteque-juicy', text: "Bien emballé, ma fille était aux anges. Aucune odeur chimique." },
  { name: 'Hugo', meta: 'développeur', stars: 5, product: 'lingot-or', text: "Le lingot d'or sur le bureau, c'est ma balle anti-stress quand le code ne compile pas. 10/10." }
];

const FAQ = [
  { q: "Qu'est-ce qu'un squishy « slow rising » ?", a: "C'est un squishy fabriqué en mousse polyuréthane haute densité qui reprend sa forme très lentement après avoir été écrasé. Chez nous, le temps de remontée est indiqué sur chaque fiche : de 4 secondes pour les plus rebondissants à 14 secondes pour les plus lents." },
  { q: 'Vos squishies sont-ils sans danger ?', a: "Oui. Toutes nos mousses sont certifiées EN71 (norme européenne de sécurité des jouets), sans phtalates et testées en laboratoire. Nos parfums sont légers et hypoallergéniques. Recommandé à partir de 3 ans." },
  { q: 'Combien de squishies puis-je commander ?', a: "Pour que tout le monde puisse en profiter, tu peux en prendre jusqu'à 10 par commande. Plus tu en prends, moins tu paies : 1 squishy 2 €, 2 à 4 squishies 3,95 €, 5 à 9 squishies 9,99 €, 10 squishies 19,99 €." },
  { q: 'Quels sont les délais de livraison ?', a: "Ta commande arrive en 3 jours, et la livraison est gratuite. Les commandes passées avant 14 h partent le jour même." },
  { q: 'Comment entretenir mon squishy ?', a: "Nettoie-le délicatement avec un chiffon humide et un peu de savon doux, puis laisse-le sécher à l'air libre. Évite la machine à laver, le sèche-cheveux et le soleil direct qui peuvent abîmer la mousse." },
  { q: 'Puis-je retourner un article ?', a: "Bien sûr. Tu as 30 jours après réception pour nous retourner un article non utilisé dans son emballage d'origine. Le remboursement est effectué sous 5 jours ouvrés." }
];
