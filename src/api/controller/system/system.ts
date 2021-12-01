import { controller, BaseHttpController, httpGet } from 'inversify-express-utils';
import { celebrate, Joi } from 'celebrate';

@controller('/v1/system')
export class SystemController extends BaseHttpController {
  @httpGet(
    '/',
    celebrate({
      body: Joi.object().empty(),
      query: Joi.object().empty(),
    }),
  )
  async head(): Promise<void> {
    this.httpContext.response.json({});
  }
}
