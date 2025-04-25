//helper utility file for snail movement to find a random point in a polygon
//so snails know where to navigate

import inside from "point-in-polygon";

export default function getRandomPointInPolygon(polygon) {
  const xs = polygon.map(p => p.x);
  const ys = polygon.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  while (true) {
    const x = Math.floor(Math.random() * (maxX - minX)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
    if (inside([x, y], polygon.map(p => [p.x, p.y]))) {
      return { x, y };
    }
  }
}
