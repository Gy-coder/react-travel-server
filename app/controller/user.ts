import { Controller } from "egg";
import md5 from "md5";

export default class UserController extends Controller {
  private async jwtSign() {
    const { ctx, app } = this;
    const username = ctx.request.body.username;
    const token = app.jwt.sign({ username }, app.config.jwt.secret);
    ctx.session[username] = 1;
    return token;
  }
  public async register() {
    const { ctx, app } = this;
    const params = ctx.request.body;
    const user = await ctx.service.user.getUser(params.username);
    if (user) {
      ctx.response.status = 500;
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
      const token = await this.jwtSign();
      ctx.response.status = 200;
      ctx.body = {
        status: 200,
        data: {
          ...ctx.helper.unPick(res.dataValues, ["password"]),
          createTime: ctx.helper.timestamp(res.createTime),
          token,
        },
      };
    } else {
      ctx.response.status = 500;
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
      const token = await this.jwtSign();
      ctx.response.status = 200;
      ctx.body = {
        status: 200,
        data: {
          ...ctx.helper.unPick(user.dataValues, ["password"]),
          createTime: ctx.helper.time(),
          token,
        },
      };
    } else {
      ctx.response.status = 500;
      ctx.body = {
        status: 500,
        errMsg: "用户名密码不匹配",
      };
    }
  }
  public async detail() {
    const { ctx } = this;
    const user = await ctx.service.user.getUser(ctx.username);
    if (user) {
      ctx.response.status = 200;
      ctx.body = {
        status: 200,
        data: {
          ...ctx.helper.unPick(user.dataValues, ["password"]),
          createTime: ctx.helper.time(),
        },
      };
    } else {
      ctx.response.status = 500;
      ctx.body = {
        status: 500,
        errMsg: "该用户不存在",
      };
    }
  }
  public async logout() {
    const { ctx } = this;
    try {
      ctx.session[ctx.username] = null;
      ctx.response.status = 200;
      ctx.body = {
        status: 200,
        data: "ok",
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.body = {
        status: 500,
        errMsg: "退出登陆失败",
      };
    }
  }
}
