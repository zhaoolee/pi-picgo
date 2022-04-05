import picgo from 'picgo'
const fs = require("fs-extra");
const request = require('request');

// 上传图片
async function upload_file(local_image_path: string, ctx: any) {
  // 填写host 例如: https://fangyuanxiaozhan.com
  const host = ctx.getConfig('picgo-plugin-pi-picgo.host');
  // 填写客户端请求的端口号,例如 443
  const client_port = ctx.getConfig('picgo-plugin-pi-picgo.client_port');
  // secret_token (客户端和服务端会同时添加secret_token鉴权，防止被他人滥用) 生成规则见 https://github.com/zhaoolee/EasyTypora
  const secret_token = ctx.getConfig('picgo-plugin-pi-picgo.secret_token');
  console.log(`client_port${client_port}client_port${client_port}secret_token${secret_token}`)
  const url = `${host}:${client_port}/upload_file`;
  const formData = {
    file: fs.createReadStream(local_image_path),
    secret_token: secret_token
  };
  return new Promise(async (resolve, reject) => {
    await request.post({ url: url, formData: formData }, function optionalCallback(err, httpResponse, body) {
      if (err) {
        // 如果请求出错，则返回一张猫爪图
        console.log("\nerr==>>", err, "\nhttpResponse==>>", httpResponse, "\nbody==>>", body, "\nurl===>>", url);
        resolve("https://www.v2fy.com/wp-content/uploads/2020/05/keycat1000.jpg")
      } else {
        // 如果请求正常，则返回图片地址
        resolve(body);
      }
    })
  })
}

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.uploader.register('pi-picgo', {
      async handle(ctx) {
        let input = ctx.input
        for(let m = 0; m < input.length; m++){
          await (async (index)=>{
            let newImage: string = (await upload_file(input[index], ctx)).toString();
            ctx.output[index]["imgUrl"] = newImage;
            ctx.output[index]["url"] = newImage;
          })(m)
        }
        return ctx;
      }
    })
  }

  const pluinConfig = ctx => {
    return [
      {
        name: 'host',
        type: 'input',
        default: '',
        required: true
      },
      {
        name: 'client_port',
        type: 'input',
        default: '',
        required: true
      }, 
      {
        name: 'secret_token',
        type: 'input',
        default: '',
        required: true
      }
    ]
  }
  

  return {
    uploader: 'pi-picgo',
    config: pluinConfig,
    register
  }
}
