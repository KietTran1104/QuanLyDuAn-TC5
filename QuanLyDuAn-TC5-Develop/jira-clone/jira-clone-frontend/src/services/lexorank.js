/**
 * LexoRank Utility – Frontend
 *
 * Giao thức boardPosition: "bucket|rank:"
 * Ví dụ: "0|000001:" — bucket='0', rank='000001'
 *
 * Thuật toán tính rank trung điểm giữa 2 chuỗi dựa trên
 * base-36 character space (0-9 a-z, code 48-122).
 */

// Các ký tự hợp lệ cho rank: '0'-'9' (48-57), 'a'-'z' (97-122)
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const BASE = ALPHABET.length  // 36

const BUCKET = '0'
const MIN_RANK = 'aaaaaa'  // giá trị đầu mảng (không phải '000000' vì '0' nhỏ hơn 'a')
const MAX_RANK = 'zzzzzz'  // giá trị cuối mảng

function charToVal(ch) {
  const idx = ALPHABET.indexOf(ch)
  return idx === -1 ? 0 : idx
}

function valToChar(v) {
  return ALPHABET[Math.max(0, Math.min(BASE - 1, v))]
}

/**
 * Tính chuỗi trung điểm giữa `a` và `b` (lexicographic order, a < b).
 * Cả hai là rank strings (không có "bucket|" hay ":").
 */
function midRank(a, b) {
  // Pad đến cùng độ dài bằng ký tự đầu tiên của alphabet ('0')
  const len = Math.max(a.length, b.length)
  const A = a.padEnd(len, '0')
  const B = b.padEnd(len, '0')

  // Chuyển sang mảng giá trị số
  const aVals = A.split('').map(charToVal)
  const bVals = B.split('').map(charToVal)

  // Tính tổng a + b (dạng big-number base-36)
  const sum = new Array(len).fill(0)
  let carry = 0
  for (let i = len - 1; i >= 0; i--) {
    const s = aVals[i] + bVals[i] + carry
    sum[i] = s % BASE
    carry = Math.floor(s / BASE)
  }

  // Chia đôi (giống chia số nguyên lớn cho 2)
  const result = new Array(len).fill(0)
  let rem = carry  // nếu vẫn còn carry sẽ xử lý bên dưới
  for (let i = 0; i < len; i++) {
    const cur = rem * BASE + sum[i]
    result[i] = Math.floor(cur / 2)
    rem = cur % 2
  }

  const mid = result.map(valToChar).join('')

  // Nếu trùng với một trong hai thì append ký tự giữa ('h' ≈ giữa bảng)
  if (mid === a || mid === b) {
    return a + 'h'
  }
  return mid
}

/**
 * Parse rank từ boardPosition string "0|xxxxxx:"
 */
function parseRank(pos) {
  if (!pos) return MIN_RANK
  const pipeIdx = pos.indexOf('|')
  const colonIdx = pos.lastIndexOf(':')
  if (pipeIdx === -1 || colonIdx === -1) return pos
  return pos.substring(pipeIdx + 1, colonIdx)
}

/**
 * Tạo full boardPosition từ rank
 */
function toPosition(rank) {
  return `${BUCKET}|${rank}:`
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * So sánh 2 boardPosition strings (dùng cho Array.sort)
 */
export function compareBoardPosition(a, b) {
  const ra = a || toPosition(MIN_RANK)
  const rb = b || toPosition(MIN_RANK)
  if (ra < rb) return -1
  if (ra > rb) return 1
  return 0
}

/**
 * Tính boardPosition mới khi kéo issue vào vị trí `insertIndex`
 * trong `columnIssues` (đã sorted, không chứa activeIssue).
 *
 * @param {Array<{boardPosition: string}>} columnIssues - issues đích (đã bỏ active ra)
 * @param {number} insertIndex - chèn TRƯỚC phần tử này (0 = đầu, length = cuối)
 * @returns {string} boardPosition mới
 */
export function calculateNewBoardPosition(columnIssues, insertIndex) {
  const n = columnIssues.length

  // Cột rỗng
  if (n === 0) {
    return toPosition(midRank(MIN_RANK, MAX_RANK))
  }

  // Chèn đầu
  if (insertIndex <= 0) {
    const firstRank = parseRank(columnIssues[0].boardPosition)
    return toPosition(midRank(MIN_RANK, firstRank))
  }

  // Chèn cuối
  if (insertIndex >= n) {
    const lastRank = parseRank(columnIssues[n - 1].boardPosition)
    return toPosition(midRank(lastRank, MAX_RANK))
  }

  // Chèn giữa
  const prevRank = parseRank(columnIssues[insertIndex - 1].boardPosition)
  const nextRank = parseRank(columnIssues[insertIndex].boardPosition)
  return toPosition(midRank(prevRank, nextRank))
}

/**
 * Tạo boardPosition cho issue mới (thêm vào cuối danh sách)
 */
export function generateInitialBoardPosition(existingIssues) {
  if (!existingIssues || existingIssues.length === 0) {
    return toPosition(midRank(MIN_RANK, MAX_RANK))
  }
  const sorted = [...existingIssues].sort((a, b) =>
    compareBoardPosition(a.boardPosition, b.boardPosition)
  )
  const lastRank = parseRank(sorted[sorted.length - 1].boardPosition)
  return toPosition(midRank(lastRank, MAX_RANK))
}
