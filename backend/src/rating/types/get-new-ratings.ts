export type GetNewRatingsParams = {
  first: {
    rating: number
    k: number
  }
  second: {
    rating: number
    k: number
  }
  scoreOfFirst: number
}

export type GetNewRatingsResult = {
  first: {
    rating: number
    k: number
  }
  second: {
    rating: number
    k: number
  }
}
