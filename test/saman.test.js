const saman = require('../dist/index.js').default
let client = new Saman('11')
const run = async ()=>{
  console.log("🚀 ~ file: index.ts ~ line 72 ~ client", await client.getToken('https://website.org','0940','123',10000))
}
  run()
