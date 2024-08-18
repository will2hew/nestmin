import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Observable } from "rxjs";
import { NESTMIN_GUARD } from "./nestmin.constants";

@Injectable()
export class ProxyGuard implements CanActivate {
  constructor(
    @Inject(NESTMIN_GUARD) private guardClass: new () => CanActivate,
    private readonly moduleRef: ModuleRef,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const guard = this.moduleRef.get<CanActivate>(NESTMIN_GUARD);

    return guard.canActivate(context);
  }
}
