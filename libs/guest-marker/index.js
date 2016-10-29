function createGuestUid() {
  var nu = (Math.random() * 1e14).toString().slice(0, 7) + (Math.random() * 1e14).toString().slice(0, 7);
  nu = Math.floor(Math.random() * 9 + 1) + nu.slice(-13);

  var xorRes = "";

  for (var i = 0, len = nu.length; i < len / 2; i++) {
    xorRes += nu[i] ^ nu[len - 1 - i] + i;
  }

  nu = parseInt(nu);
  var nu2 = nu.toString(16);
  var xorRes2 = parseInt(xorRes).toString(16);

  while (nu2.length < 12) {
    nu2 = "0" + nu2;
  }

  return nu2 + xorRes2;
}

function checkHexEcnode(hex) {
  if (typeof hex !== 'string') {
    return false
  }
  if (hex.length < 12 || !/^[0-9a-f]+$/i.test(hex)) {
    return false;
  }

  var nu = parseInt(hex.slice(0, 12), 16).toString(), xor = parseInt(hex.slice(12), 16);
  if (nu === "0") {
    return false;
  }
  var xorRes = "";

  for (var i = 0, len = nu.length; i < len / 2; i++) {
    xorRes += nu[i] ^ nu[len - 1 - i] + i;
  }


  xorRes = parseInt(xorRes, 10);
  return xorRes === xor;
}

exports.createGuestUid = createGuestUid;
