import type { UserProfile } from "@unicourse-tw/prisma";
import type { CoursePack } from "course-pack";

export type MethodInterface = [any, any];
export type Method = "GET" | "POST" | "PUT" | "DELETE";

export type _EndpointInterface = Partial<Record<Method, MethodInterface>>;

export type EndpointInterface =
    _EndpointInterface & { GET: MethodInterface } |
    _EndpointInterface & { POST: MethodInterface } |
    _EndpointInterface & { PUT: MethodInterface } |
    _EndpointInterface & { DELETE: MethodInterface };

export type PathNode =
    | undefined
    | EndpointInterface
    | {
        [key: string]: PathNode
    };

export interface PathTree {
    [key: string]: PathNode
}

export type Join<K, P> = K extends string | number
    ? P extends string | number
        ? `${K}${"" extends P ? "" : "/"}${P}`
        : never
    : never;

export type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

export type PathBuilder<
    Parent extends PathNode,
    Depth extends number = 5
> = Prev[Depth] extends never
    ? unknown
    : Parent extends PathTree
        ? {
            [K in keyof Parent]-?: K extends string
                ? K extends keyof EndpointInterface
                    ? never
                    : `${K}` | Join<K, PathBuilder<Parent[K], Prev[Depth]>>
                : never;
        }[keyof Parent]
        : unknown;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EndpointTree = {
    auth: {
        login: {
            POST: [
                {
                    username: string
                    password: string
                },
                {
                    token: string
                }
            ]
        }
        register: {
            POST: [
                {
                    username: string
                    password: string
                    email: string
                },
                {
                    username: string
                    email: string
                }
            ]
        }
    }
    health: {
        GET: [
            never,
            {
                server: "ok" | "error"
                database: "ok" | "error"
            }
        ]
    }
    profile: {
        [key: string]: {
            GET: [
                never,
                UserProfile
            ]
        }
    }
    manage: {
        import: {
            POST: [
                CoursePack,
                {
                    teachers: string[]
                    courses: string[]
                    programs: string[]
                }
            ]
        }
    }
};

export type EndpointPath = PathBuilder<EndpointTree>;

export type Endpoint<T extends string = EndpointPath, P extends PathNode = EndpointTree>
    = T extends `${infer K}/${infer Rest}`
        ? K extends keyof P
            ? P[K] extends PathTree
                ? Endpoint<Rest, P[K]>
                : never
            : never
        : T extends keyof P
            ? P[T] extends EndpointInterface
                ? P[T]
                : never
            : never;

export type EndpointMethod<T extends string = EndpointPath>
    = Endpoint<T> extends EndpointInterface
        ? keyof Endpoint<T> extends Method
            ? keyof Endpoint<T>
            : never
        : never;

export type EndpointBody<
    T extends string = EndpointPath,
    M extends EndpointMethod<T> = EndpointMethod<T>
>
    = Endpoint<T> extends EndpointInterface
        ? Endpoint<T>[M]
        : never;

export type EndpointRequestBody<
    T extends string = EndpointPath,
    M extends EndpointMethod<T> = EndpointMethod<T>
>
    = EndpointBody<T, M> extends [infer Req, any]
        ? Req
        : never;

export type EndpointResponseBody<
    T extends string = EndpointPath,
    M extends EndpointMethod<T> = EndpointMethod<T>
>
    = EndpointBody<T, M> extends [any, infer Res]
        ? Res
        : never;

export type EndpointRequestInit<
    T extends string = EndpointPath,
    M extends EndpointMethod<T> = EndpointMethod<T>
> = Omit<RequestInit, "method" | "body"> & {
    method: M
    body: EndpointRequestBody<T, M>
};
