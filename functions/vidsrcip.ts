import axios from "axios";
// @ts-ignore
import cryptoJs from "crypto-js";
var baseUrl = "https://moviesapi.club/";
var secretKey = "1FHuaQhhcsKgpTRB";

const decrypt = (jsonStr: any, password: any) => {
  return JSON.parse(
    cryptoJs.AES.decrypt(jsonStr, password, {
      format: {
        parse: (jsonStr: any) => {
          var j = JSON.parse(jsonStr);

          var cipherParams = cryptoJs.lib.CipherParams.create({
            ciphertext: cryptoJs.enc.Base64.parse(j.ct),
          });
          if (j.iv) cipherParams.iv = cryptoJs.enc.Hex.parse(j.iv);
          if (j.s) cipherParams.salt = cryptoJs.enc.Hex.parse(j.s);
          return cipherParams;
        },
      },
    }).toString(cryptoJs.enc.Utf8)
  );
};

export const getSource = async (id: any, isMovie: any, s: any, e: any) => {
  const url = baseUrl + (isMovie ? `movie/${id}` : `tv/${id}-${s}-${e}`);
  console.log(url);

  const iframe = (
    await axios.get(url, {
      headers: { Referer: baseUrl },
    })
  ).data.match(/<iframe.* src="(.*?)"/)[1];

  const jsonStr = (
    await axios.get(iframe, { headers: { Referer: baseUrl } })
  ).data.match(/<script type="text\/javascript">.*'(.*?)'.*<\/script>/)[1];
  
  var decryptedString = decrypt(jsonStr, secretKey);
  
  const sourceReg = /sources\s*:\s*(\[.*?\])/;

  var tracksReg = /tracks\s*:\s*(\[.*?\])/;
  var media = {
    sources: JSON.parse(decryptedString.match(sourceReg)[1]),
    tracks: JSON.parse(decryptedString.match(tracksReg)[1]),
    referer: baseUrl,
    provider: "Movieapi.club",
  };
  console.log(media);
};
