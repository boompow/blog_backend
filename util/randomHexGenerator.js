// random hex generator for creating custom token secret code
function randomHex(digit) {
  let randomHexedDigit = "";
  for (let i = 0; i < digit; i++) {
    const randomDec = Math.floor(Math.random() * 255);
    const hexed = randomDec.toString(16);
    randomHexedDigit += hexed;
  }
  return randomHexedDigit;
}

export default randomHex;
