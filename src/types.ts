import type { DefaultContextExtends, DefaultStateExtends } from "koa";
import type { Token } from "@unicourse-tw/token";

export interface UniState extends DefaultStateExtends {
    token?: Token
    raw_token?: string
}

export interface UniContext extends DefaultContextExtends {
    ok: (data: any) => void
    err: (error: string, extra?: { code?: number; data?: any }) => void
}
