export interface Member {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Developer' | 'Read-only'
  projects: number
  joined: Date
}

const first = ['Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Edsger', 'Frances', 'Tim']
const last = ['Lovelace', 'Hopper', 'Turing', 'Torvalds', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Perlman', 'Dijkstra']
const roles: Member['role'][] = ['Owner', 'Admin', 'Developer', 'Developer', 'Read-only']

// Deterministic sample data (no Math.random), so the preview and its golden snapshot
// render the same rows every time.
export const members: Member[] = Array.from({ length: 42 }, (_, i) => {
  const name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`
  return {
    id: `m${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@example.com`,
    role: roles[(i * 3) % roles.length],
    projects: (i * 13) % 17,
    joined: new Date(Date.UTC(2024, i % 12, ((i * 5) % 27) + 1)),
  }
})
