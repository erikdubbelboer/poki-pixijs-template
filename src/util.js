const PI = Math.PI;
const PI2 = PI * 2;

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function mod(a, n) {
    return ((a % n) + n) % n;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// See: https://easings.net/#easeOutSine
export function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}

// Distances

export function linePointDistance(p1, p2, c) {
    var ac = { x: c.x - p1.x, y: c.y - p1.y };
    var ab = { x: p2.x - p1.x, y: p2.y - p1.y };
    var ab2 = dot(ab, ab);
    var acab = dot(ac, ab);
    var t = acab / ab2;
    t = t < 0 ? 0 : t;
    t = t > 1 ? 1 : t;
    var h = { x: ab.x * t + p1.x - c.x, y: ab.y * t + p1.y - c.y };
    var h2 = dot(h, h);
    return Math.sqrt(h2);
}

// Lines

// smoothLine draws a line from from to to with a smooth transition from fromSize to toSize and fromColor to toColor.
// g should be a PIXI.Graphics object.
export function smoothLine(g, from, to, fromSize, toSize, fromColor, toColor, fromAlpha, toAlpha) {
    const lx = from.x;
    const ly = from.y;
    let dx = to.x - lx;
    let dy = to.y - ly;
    const d = Math.sqrt(dx * dx + dy * dy);

    dx /= d;
    dy /= d;

    const steps = Math.floor(d / 2);
    const stepSize = d / steps;

    for (let i = 0; i < steps; i++) {
        g.lineStyle(lerp(fromSize, toSize, i / steps), lerpColor(fromColor, toColor, i / steps), lerp(fromAlpha, toAlpha, i / steps));
        g.lineTo(lx + dx * stepSize * i, ly + dy * stepSize * i);
    }
}

// Intersections (see also: https://davidfig.github.io/intersects/)

// lineLineIntersection returns true if the lines intersect, false otherwise.
export function lineLineIntersection(p1, p2, p3, p4) {
    var s1_x = p2.x - p1.x;
    var s1_y = p2.y - p1.y;
    var s2_x = p4.x - p3.x;
    var s2_y = p4.y - p3.y;
    var s = (-s1_y * (p1.x - p3.x) + s1_x * (p1.y - p3.y)) / (-s2_x * s1_y + s1_x * s2_y);
    var t = (s2_x * (p1.y - p3.y) - s2_y * (p1.x - p3.x)) / (-s2_x * s1_y + s1_x * s2_y);
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

// lineBoxIntersection returns the intersection points of a line and a box.
export function lineBoxIntersection(v1, v2, box) {
    const [xmin, xmax, ymin, ymax] = box;
    let t0 = 0,
        t1 = 1;
    const dx = v2.x - v1.x,
        dy = v2.y - v1.y;
    let p, q, r;

    for (let edge = 0; edge < 4; edge++) {
        if (edge === 0) {
            p = -dx;
            q = -(xmin - v1.x);
        }
        if (edge === 1) {
            p = dx;
            q = xmax - v1.x;
        }
        if (edge === 2) {
            p = -dy;
            q = -(ymin - v1.y);
        }
        if (edge === 3) {
            p = dy;
            q = ymax - v1.y;
        }

        r = q / p;

        if (p === 0 && q < 0) {
            return null;
        }

        if (p < 0) {
            if (r > t1) {
                return null;
            } else if (r > t0) {
                t0 = r;
            }
        } else if (p > 0) {
            if (r < t0) {
                return null;
            } else if (r < t1) {
                t1 = r;
            }
        }
    }

    return [
        { x: v1.x + t0 * dx, y: v1.y + t0 * dy },
        { x: v1.x + t1 * dx, y: v1.y + t1 * dy },
    ];
}

// polygonPolygonIntersection returns true if the polygons intersect, false otherwise.
export function polygonPolygonIntersection(points1, points2) {
    var a = points1;
    var b = points2;
    var polygons = [a, b];
    var minA, maxA, projected, minB, maxB, j;
    for (var i = 0; i < polygons.length; i++) {
        var polygon = polygons[i];
        for (var i1 = 0; i1 < polygon.length; i1 += 2) {
            var i2 = (i1 + 2) % polygon.length;
            var normal = { x: polygon[i2 + 1] - polygon[i1 + 1], y: polygon[i1] - polygon[i2] };
            minA = maxA = null;
            for (j = 0; j < a.length; j += 2) {
                projected = normal.x * a[j] + normal.y * a[j + 1];
                if (minA === null || projected < minA) {
                    minA = projected;
                }
                if (maxA === null || projected > maxA) {
                    maxA = projected;
                }
            }
            minB = maxB = null;
            for (j = 0; j < b.length; j += 2) {
                projected = normal.x * b[j] + normal.y * b[j + 1];
                if (minB === null || projected < minB) {
                    minB = projected;
                }
                if (maxB === null || projected > maxB) {
                    maxB = projected;
                }
            }
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
}

// pointPolygonIntersection returns true if the point is inside the polygon, false otherwise.
export function pointPolygonIntersection(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x,
            yi = polygon[i].y;
        const xj = polygon[j].x,
            yj = polygon[j].y;

        const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

// Functions related to angles

// deltaAngle returns the difference between two angles in radians.
export function deltaAngle(a, b) {
    const c = mod(a - b, PI2);
    const d = mod(b - a, PI2);

    return c < d ? -c : d;
}

// rotateWithSpeed rotates the shortest angle from from to to with a maximum rotation of delta.
export function rotateWithSpeed(from, to, delta) {
    // Normalize the angles to be within [0, 2π)
    from = from % (2 * Math.PI);
    to = to % (2 * Math.PI);

    if (from < 0) from += 2 * Math.PI;
    if (to < 0) to += 2 * Math.PI;

    // Calculate the differences in both directions
    let diff = to - from;
    let diffAlt = from - to;

    // Normalize the differences to be within [0, 2π)
    if (diff < 0) diff += 2 * Math.PI;
    if (diffAlt < 0) diffAlt += 2 * Math.PI;

    // Choose the smallest difference and apply the delta
    if (Math.abs(diff) < Math.abs(diffAlt)) {
        if (Math.abs(diff) > delta) {
            return (from + Math.sign(diff) * delta) % (2 * Math.PI);
        }
    } else {
        if (Math.abs(diffAlt) > delta) {
            return (from - Math.sign(diffAlt) * delta) % (2 * Math.PI);
        }
    }

    return to;
}

// rotateXY rotates the point p by angle radians.
export function rotateXY(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
    };
}

// Functions related to colors

// lerpColor lerps between two colors in 0xrrggbb format.
export function lerpColor(a, b, t) {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;
    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;
    const rr = ar + (br - ar) * t;
    const rg = ag + (bg - ag) * t;
    const rb = ab + (bb - ab) * t;
    return (rr << 16) | (rg << 8) | rb;
}

// Randomness functions

// mulberry32 is a fast deterministic random number generator.
// See: https://stackoverflow.com/a/47593316
export function mulberry32(a) {
    const r = () => {
        let t = (r.state += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.state = a;
    return r;
}

// Fisher-Yates shuffle.
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i
        let j = Math.floor(Math.random() * (i + 1));

        // Swap elements at index i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function randomPointInPolygon(polygon) {
    const boundingBox = polygon.reduce(
        (box, vertex) => {
            return {
                minX: Math.min(vertex.x, box.minX),
                minY: Math.min(vertex.y, box.minY),
                maxX: Math.max(vertex.x, box.maxX),
                maxY: Math.max(vertex.y, box.maxY),
            };
        },
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    let point;
    do {
        point = {
            x: boundingBox.minX + Math.random() * (boundingBox.maxX - boundingBox.minX),
            y: boundingBox.minY + Math.random() * (boundingBox.maxY - boundingBox.minY),
        };
    } while (!pointPolygonIntersection(point, polygon));

    return point;
}
