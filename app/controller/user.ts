import { Controller } from "egg";
import md5 from "md5";

export default class UserController extends Controller {
  public async register() {
    const { ctx, app } = this;
    const params = ctx.request.body;
    const user = await ctx.service.user.getUser(params.username);
    if (user) {
      ctx.body = {
        status: 500,
        eggMsg: "该用户已经存在",
      };
      return;
    }
    const res = await ctx.service.user.add({
      ...params,
      password: md5(params.password + app.config.salt),
      createTime: ctx.helper.time(),
    });
    if (res) {
      ctx.body = {
        status: 200,
        data: {
          ...ctx.helper.unPick(res.dataValues, ["password"]),
          createTime: ctx.helper.timestamp(res.createTime),
        },
      };
    } else {
      ctx.body = {
        status: 500,
        errMsg: "注册用户失败",
      };
    }
  }
  public async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    const user = await ctx.service.user.getUser(username, password);
    if (user) {
      ctx.session.userId = user.id;
      ctx.body = {
        status: 200,
        data: {
          ...ctx.helper.unPick(user.dataValues, ["password"]),
          createTime: ctx.helper.time(),
        },
      };
    } else {
      ctx.body = {
        status: 500,
        errMsg: "用户名密码不匹配",
      };
    }
  }
}
