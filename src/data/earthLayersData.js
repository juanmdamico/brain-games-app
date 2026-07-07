export const earthLayersData = [
  {
    id: 'inner-core',
    name: 'Núcleo Interno',
    color: '#fef08a',
    depth: '5,150 a 6,371 km',
    thickness: '1,221 km',
    temperature: '5,430 °C',
    composition: 'Principalmente hierro y níquel sólidos',
    description: 'Es una esfera sólida súper caliente en el centro exacto de la Tierra. A pesar de que la temperatura es casi igual a la superficie del Sol, la inmensa presión mantiene los metales en estado sólido.',
    radius: 40 // visual size in the diagram
  },
  {
    id: 'outer-core',
    name: 'Núcleo Externo',
    color: '#fbbf24',
    depth: '2,890 a 5,150 km',
    thickness: '2,260 km',
    temperature: '4,000 a 5,000 °C',
    composition: 'Hierro y níquel líquidos',
    description: 'La única capa completamente líquida de la Tierra. El movimiento constante de este metal fundido es el responsable de generar el campo magnético protector de nuestro planeta.',
    radius: 80
  },
  {
    id: 'mantle',
    name: 'Manto',
    color: '#ea580c',
    depth: '35 a 2,890 km',
    thickness: '2,855 km',
    temperature: '500 a 4,000 °C',
    composition: 'Roca de silicato rica en hierro y magnesio',
    description: 'Es la capa más gruesa de la Tierra (84% del volumen total). Está formada por roca muy caliente que fluye lentamente como caramelo espeso a lo largo de millones de años, lo que mueve las placas tectónicas.',
    radius: 180
  },
  {
    id: 'crust',
    name: 'Corteza Terrestre',
    color: '#65a30d',
    depth: '0 a 35 km',
    thickness: '5 a 70 km',
    temperature: 'Ambiente a 400 °C',
    composition: 'Roca sólida (basalto y granito)',
    description: 'Es la delgada capa exterior donde vivimos. Si la Tierra fuera una manzana, la corteza sería más delgada que la piel de la manzana. Incluye tanto los continentes como el fondo de los océanos.',
    radius: 200
  },
  {
    id: 'troposphere',
    name: 'Troposfera (Atmósfera)',
    color: '#60a5fa',
    depth: '0 a 12 km de altura',
    thickness: '12 km',
    temperature: '15 a -56 °C',
    composition: '78% Nitrógeno, 21% Oxígeno, Argón, Vapor de agua',
    description: 'La capa más baja de la atmósfera. Aquí es donde se forma casi todo el clima (nubes, lluvia, nieve) y donde vuelan la mayoría de los aviones comerciales e insectos.',
    radius: 220
  },
  {
    id: 'stratosphere',
    name: 'Estratosfera',
    color: '#3b82f6',
    depth: '12 a 50 km de altura',
    thickness: '38 km',
    temperature: '-56 a -3 °C',
    composition: 'Rica en Ozono',
    description: 'Contiene la famosa "Capa de Ozono", que absorbe la radiación ultravioleta dañina del sol. Curiosamente, a medida que subes en esta capa, la temperatura aumenta.',
    radius: 250
  },
  {
    id: 'mesosphere',
    name: 'Mesosfera',
    color: '#1d4ed8',
    depth: '50 a 85 km de altura',
    thickness: '35 km',
    temperature: '-3 a -90 °C',
    composition: 'Gases dispersos',
    description: 'Es la capa más fría de la atmósfera de la Tierra. Aquí es donde se queman la mayoría de los meteoritos (estrellas fugaces) antes de que puedan golpear la superficie.',
    radius: 280
  },
  {
    id: 'thermosphere',
    name: 'Termosfera',
    color: '#1e3a8a',
    depth: '85 a 600 km de altura',
    thickness: '515 km',
    temperature: 'Llega a 2,000 °C',
    composition: 'Gases muy raros',
    description: 'El aire es tan delgado aquí que se consideraría el vacío espacial. Aquí ocurren las Auroras Boreales y Australes, y orbitan la Estación Espacial Internacional y muchos satélites.',
    radius: 330
  },
  {
    id: 'exosphere',
    name: 'Exosfera',
    color: '#0f172a',
    depth: '600 a 10,000 km de altura',
    thickness: '9,400 km',
    temperature: 'Muy variable',
    composition: 'Hidrógeno y Helio dispersos',
    description: 'El borde más externo de la atmósfera, donde el aire literalmente se desvanece y se funde con el espacio exterior profundo.',
    radius: 400
  }
];
