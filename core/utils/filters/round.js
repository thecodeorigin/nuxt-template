export default (val, roundLimit = 3) => {
  return Math.floor(+val * 10 ** (roundLimit + 1)) / 10 ** (roundLimit + 1)
}
