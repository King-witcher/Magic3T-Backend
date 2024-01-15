import { models } from '@/firebase/models'

export async function countMatches() {
  const userMap: Record<
    string,
    { wins: number; draws: number; defeats: number }
  > = {}

  const initial = {
    wins: 0,
    draws: 0,
    defeats: 0,
  }

  function add(uid: string, result: 'win' | 'draw' | 'defeat') {
    if (userMap[uid]) {
      userMap[uid][result + 's']++
    } else {
      userMap[uid] = { ...initial }
      add(uid, result)
    }
  }

  const matchesSnap = await models.matches.collection.get()

  for (const matchSnap of matchesSnap.docs) {
    const match = matchSnap.data()
    switch (match.winner) {
      case 'white':
        add(match.white.uid, 'win')
        add(match.black.uid, 'defeat')
        break
      case 'black':
        add(match.white.uid, 'defeat')
        add(match.black.uid, 'win')
        break
      case 'none':
        add(match.white.uid, 'draw')
        add(match.black.uid, 'draw')
        break
    }
  }

  for (const uid of Object.keys(userMap))
    [
      models.users.collection.doc(uid).update({
        stats: userMap[uid],
      }),
    ]
}
