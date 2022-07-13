import { Service } from "egg";
import md5 from "md5";
import { User } from "../types";

export default class UserService extends Service {
  public async getUser(username?: string, password?: string) {
    try {
      const { ctx, app } = this;
      const _where = password
        ? { username, password: md5(password + app.config.salt) }
        : { username };
      const res = await ctx.model.User.findOne({
        where: _where,
      });
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async add(params: User) {
    try {
      const { ctx } = this;
      const res = await ctx.model.User.create(params);
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
