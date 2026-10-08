/*
 * A small QR Code encoder (ISO/IEC 18004): byte mode, versions 1-10, error-correction
 * levels L/M/Q/H. That is enough for URLs, Wi-Fi codes and short text (up to 271 bytes at
 * level L, 119 at level H) without a dependency. Longer input throws a RangeError.
 *
 * Steps: pick the smallest version that fits → build the bit stream → split into blocks
 * and add Reed-Solomon codewords → draw the fixed patterns → place the data in the
 * zig-zag order → pick the mask with the lowest penalty → draw format/version info.
 */

export type QRLevel = 'L' | 'M' | 'Q' | 'H'

/** [EC codewords per block, blocks in group 1, data codewords per block, blocks in group 2, data codewords per block] */
type BlockSpec = readonly [number, number, number, number?, number?]

const BLOCKS: Record<QRLevel, readonly BlockSpec[]> = {
  L: [
    [7, 1, 19], [10, 1, 34], [15, 1, 55], [20, 1, 80], [26, 1, 108],
    [18, 2, 68], [20, 2, 78], [24, 2, 97], [30, 2, 116], [18, 2, 68, 2, 69],
  ],
  M: [
    [10, 1, 16], [16, 1, 28], [26, 1, 44], [18, 2, 32], [24, 2, 43],
    [16, 4, 27], [18, 4, 31], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44],
  ],
  Q: [
    [13, 1, 13], [22, 1, 22], [18, 2, 17], [26, 2, 24], [18, 2, 15, 2, 16],
    [24, 4, 19], [18, 2, 14, 4, 15], [22, 4, 18, 2, 19], [20, 4, 16, 4, 17], [24, 6, 19, 2, 20],
  ],
  H: [
    [17, 1, 9], [28, 1, 16], [22, 2, 13], [16, 4, 9], [22, 2, 11, 2, 12],
    [28, 4, 15], [26, 4, 13, 1, 14], [26, 4, 14, 2, 15], [24, 4, 12, 4, 13], [28, 6, 15, 2, 16],
  ],
}

const ALIGNMENT: readonly (readonly number[])[] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
]

const FORMAT_BITS: Record<QRLevel, number> = { L: 1, M: 0, Q: 3, H: 2 }

export const MAX_VERSION = 10

const dataCodewords = (spec: BlockSpec) => spec[1] * spec[2] + (spec[3] ?? 0) * (spec[4] ?? 0)

/** How many bytes of text fit at a level (the largest supported version). */
export function qrCapacity(level: QRLevel) {
  const bits = dataCodewords(BLOCKS[level][MAX_VERSION - 1]) * 8 - 4 - 16
  return Math.floor(bits / 8)
}

// ---- Reed-Solomon over GF(256), polynomial 0x11D -------------------------------------

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
}

const gfMul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]])

function generator(degree: number) {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}

function reedSolomon(data: readonly number[], degree: number) {
  const gen = generator(degree)
  const out = new Array<number>(degree).fill(0)
  for (const byte of data) {
    const factor = byte ^ out[0]
    out.shift()
    out.push(0)
    for (let i = 0; i < degree; i++) out[i] ^= gfMul(gen[i + 1], factor)
  }
  return out
}

// ---- Encoding --------------------------------------------------------------------------

const bit = (value: number, index: number) => ((value >>> index) & 1) === 1

function buildCodewords(bytes: Uint8Array, level: QRLevel) {
  let version = 0
  for (let v = 1; v <= MAX_VERSION; v++) {
    const capacityBits = dataCodewords(BLOCKS[level][v - 1]) * 8
    const countBits = v < 10 ? 8 : 16
    if (4 + countBits + bytes.length * 8 <= capacityBits) {
      version = v
      break
    }
  }
  if (version === 0) {
    throw new RangeError(
      `QR code: ${bytes.length} bytes is more than level ${level} holds (${qrCapacity(level)}).`
    )
  }

  const spec = BLOCKS[level][version - 1]
  const total = dataCodewords(spec)
  const bits: number[] = []
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  push(0b0100, 4)
  push(bytes.length, version < 10 ? 8 : 16)
  for (const b of bytes) push(b, 8)
  push(0, Math.min(4, total * 8 - bits.length))
  while (bits.length % 8 !== 0) bits.push(0)

  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    data.push(parseInt(bits.slice(i, i + 8).join(''), 2))
  }
  for (let pad = 0xec; data.length < total; pad ^= 0xec ^ 0x11) data.push(pad)

  // Split into blocks, add error correction, then interleave.
  const [ecLen, n1, d1, n2 = 0, d2 = 0] = spec
  const blocks: number[][] = []
  let offset = 0
  for (let i = 0; i < n1 + n2; i++) {
    const length = i < n1 ? d1 : d2
    blocks.push(data.slice(offset, offset + length))
    offset += length
  }
  const ecBlocks = blocks.map((block) => reedSolomon(block, ecLen))

  const result: number[] = []
  const longest = Math.max(d1, d2)
  for (let i = 0; i < longest; i++) for (const block of blocks) if (i < block.length) result.push(block[i])
  for (let i = 0; i < ecLen; i++) for (const ec of ecBlocks) result.push(ec[i])
  return { version, codewords: result }
}

// ---- Matrix ------------------------------------------------------------------------------

function penalty(m: boolean[][]) {
  const size = m.length
  let score = 0

  const runs = (get: (i: number, j: number) => boolean) => {
    for (let i = 0; i < size; i++) {
      let run = 1
      for (let j = 1; j <= size; j++) {
        if (j < size && get(i, j) === get(i, j - 1)) run++
        else {
          if (run >= 5) score += 3 + (run - 5)
          run = 1
        }
      }
      // Finder-like 1:1:3:1:1 with a light margin on either side.
      for (let j = 0; j + 10 < size; j++) {
        const w = Array.from({ length: 11 }, (_, k) => get(i, j + k))
        const a = [true, false, true, true, true, false, true, false, false, false, false]
        const b = [false, false, false, false, true, false, true, true, true, false, true]
        if (w.every((v, k) => v === a[k]) || w.every((v, k) => v === b[k])) score += 40
      }
    }
  }
  runs((y, x) => m[y][x])
  runs((x, y) => m[y][x])

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = m[y][x]
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3
    }
  }

  let dark = 0
  for (const row of m) for (const c of row) if (c) dark++
  const percent = (dark * 100) / (size * size)
  score += Math.floor(Math.abs(percent - 50) / 5) * 10
  return score
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

/** Encodes `text` (UTF-8) and returns the module matrix: `true` is a dark module. */
export function encodeQR(text: string, level: QRLevel = 'M'): boolean[][] {
  const { version, codewords } = buildCodewords(new TextEncoder().encode(text), level)
  const size = 17 + 4 * version
  const modules: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const fixed: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))

  const setFixed = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark
    fixed[y][x] = true
  }

  for (let i = 0; i < size; i++) {
    setFixed(6, i, i % 2 === 0)
    setFixed(i, 6, i % 2 === 0)
  }

  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) setFixed(x, y, dist !== 2 && dist !== 4)
      }
    }
  }
  finder(3, 3)
  finder(size - 4, 3)
  finder(3, size - 4)

  const positions = ALIGNMENT[version - 1]
  const last = positions.length - 1
  positions.forEach((cy, i) => {
    positions.forEach((cx, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) setFixed(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    })
  })

  const drawFormat = (mask: number) => {
    const data = (FORMAT_BITS[level] << 3) | mask
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((data << 10) | rem) ^ 0x5412
    for (let i = 0; i <= 5; i++) setFixed(8, i, bit(bits, i))
    setFixed(8, 7, bit(bits, 6))
    setFixed(8, 8, bit(bits, 7))
    setFixed(7, 8, bit(bits, 8))
    for (let i = 9; i < 15; i++) setFixed(14 - i, 8, bit(bits, i))
    for (let i = 0; i < 8; i++) setFixed(size - 1 - i, 8, bit(bits, i))
    for (let i = 8; i < 15; i++) setFixed(8, size - 15 + i, bit(bits, i))
    setFixed(8, size - 8, true)
  }
  drawFormat(0)

  if (version >= 7) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      setFixed(a, b, bit(bits, i))
      setFixed(b, a, bit(bits, i))
    }
  }

  // Data, two columns at a time, snaking up and down from the bottom right.
  let index = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!fixed[y][x] && index < codewords.length * 8) {
          modules[y][x] = bit(codewords[index >>> 3], 7 - (index & 7))
          index++
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) if (!fixed[y][x] && MASKS[mask](x, y)) modules[y][x] = !modules[y][x]
    }
  }

  let best = 0
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask)
    drawFormat(mask)
    const score = penalty(modules)
    if (score < bestScore) {
      best = mask
      bestScore = score
    }
    applyMask(mask) // XOR again to undo
  }
  applyMask(best)
  drawFormat(best)
  return modules
}
