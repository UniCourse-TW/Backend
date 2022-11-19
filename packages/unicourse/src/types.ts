import type {
    Course,
    CourseProgram,
    Entity,
    Post,
    PostType,
    Teacher,
    UserProfile
} from "@unicourse-tw/prisma";
import type { CoursePack } from "course-pack";

export type MethodInterface = [any, any];
export type Method = "GET" | "POST" | "PUT" | "DELETE";
export const GET: unique symbol = Symbol("GET");
export const POST: unique symbol = Symbol("POST");
export const PUT: unique symbol = Symbol("PUT");
export const DELETE: unique symbol = Symbol("DELETE");
export const PATCH: unique symbol = Symbol("PATCH");
export type MethodSymbol = typeof GET | typeof POST | typeof PUT | typeof DELETE | typeof PATCH;

export interface MethodSymbolMapping {
    [GET]: "GET"
    [POST]: "POST"
    [PUT]: "PUT"
    [DELETE]: "DELETE"
    [PATCH]: "PATCH"
    GET: typeof GET
    POST: typeof POST
    PUT: typeof PUT
    DELETE: typeof DELETE
    PATCH: typeof PATCH
}

export type _EndpointInterface = Partial<Record<MethodSymbol, MethodInterface>>;

export type EndpointInterface =
    _EndpointInterface & { [GET]: MethodInterface } |
    _EndpointInterface & { [POST]: MethodInterface } |
    _EndpointInterface & { [PUT]: MethodInterface } |
    _EndpointInterface & { [DELETE]: MethodInterface };

export type PathNode =
    | EndpointInterface
    | {
        [key: string]: PathNode | MethodInterface
    };

export interface PathTree {
    [key: string]: PathNode | MethodInterface
}

export type Join<K, P> = K extends string | number
    ? P extends string
        ? `${K}${P extends "" ? "" : "/"}${P}`
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
                ? Parent[K] extends PathNode
                    ? `${K}` | Join<K, PathBuilder<Parent[K], Prev[Depth]>>
                    : never
                : never;
        }[keyof Parent]
        : unknown;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EndpointTree = {
    auth: {
        login: {
            [POST]: [
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
            [POST]: [
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
        "send-verify": {
            [POST]: [
                never,
                {
                    email: string
                }
            ]
        }
        verify: {
            [GET]: [
                {
                    id: string
                },
                {
                    success: true
                }
            ]
        }
    }
    courses: {
        [POST]: [
            {
                q: string
            },
            Course[]
        ]
        [key: string]: {
            [GET]: [
                never,
                Course & {
                    provider: Entity
                    programs: CourseProgram[]
                    teachers: Teacher[]
                }
            ]
        }
    }
    health: {
        [GET]: [
            never,
            {
                server: "ok" | "error"
                database: "ok" | "error"
                version: string
            }
        ]
    }
    posts: {
        [GET]: [
            {
                q: string
                limit?: number
                offset?: number
                type?: PostType
            },
            (Post & {
                vote: {
                    up: number
                    down: number
                }
                replies: {
                    author_id: string
                    content: string
                }[]
            })[]
        ]
        [POST]: [{
            type: PostType
            title: string
            content: string
            tags: string[]
            course?: string
        },
        Post
        ]
        tags: {
            [GET]: [
                {
                    q: string
                    limit?: number
                    offset?: number
                },
                string[]
            ]
        }
        latest: {
            [GET]: [
                never,
                (Post & {
                    vote: {
                        up: number
                        down: number
                    }
                    replies: {
                        author_id: string
                        content: string
                    }[]
                })[]
            ]
        }
    } & {
        [key: string]: {
            [GET]: [
                never,
                Post
            ]
            [PUT]: [
                never,
                Post
            ]
            replies: {
                [GET]: [
                    {
                        limit: number
                        offset: number
                    },
                    Post[]
                ]
            }
            vote: {
                [PUT]: [
                    {
                        type: 0 | 1 | -1
                    },
                    {}
                ]
            }
        }
    }
    profile: {
        [key: string]: {
            [GET]: [
                never,
                UserProfile
            ]
            [PATCH]: [
                Partial<Omit<UserProfile, "id" | "user_id">>,
                UserProfile
            ]
        }
    }
    manage: {
        import: {
            [POST]: [
                CoursePack,
                {
                    teachers: string[]
                    courses: string[]
                    programs: string[]
                }
            ]
        }
    }
    me: {
        [GET]: [
            never,
            {
                username: string
                email: {
                    email: string
                    verified: boolean
                }
                profile: {
                    email: string
                    name: string
                    bio: string
                    school: string
                    location: string
                    banner: string
                    avatar: string
                    extra: unknown
                }
                perms: string[]
                groups: {
                    name: string
                }[]
            }
        ]
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
                ? P[T] extends infer I
                    ? { [K in keyof I as K extends MethodSymbol ? K : never]: I[K] }
                    : never
                : never
            : never;

export type EndpointMethodSymbol<T extends string = EndpointPath>
    = Endpoint<T> extends EndpointInterface
        ? keyof Endpoint<T> extends MethodSymbol
            ? keyof Endpoint<T>
            : never
        : never;

export type EndpointMethod<T extends string = EndpointPath>
    = EndpointMethodSymbol<T> extends MethodSymbol
        ? MethodSymbolMapping[EndpointMethodSymbol<T>]
        : never;

export type EndpointBody<
    T extends string = EndpointPath,
    M extends EndpointMethodSymbol<T> = EndpointMethodSymbol<T>
>
    = Endpoint<T> extends EndpointInterface
        ? Endpoint<T>[M]
        : never;

export type EndpointRequestBody<
    T extends string = EndpointPath,
    M extends EndpointMethodSymbol<T> = EndpointMethodSymbol<T>
>
    = EndpointBody<T, M> extends [infer Req, any]
        ? Req
        : never;

export type EndpointResponseBody<
    T extends string = EndpointPath,
    M extends EndpointMethodSymbol<T> = EndpointMethodSymbol<T>
>
    = EndpointBody<T, M> extends [any, infer Res]
        ? Res
        : never;

export type EndpointRequestInit<
    T extends string = EndpointPath,
    M extends EndpointMethod<T> = EndpointMethod<T>
> = Omit<RequestInit, "method" | "body"> & ({
    method: M
    body: EndpointRequestBody<
    T,
    MethodSymbolMapping[M] extends EndpointMethodSymbol<T>
        ? MethodSymbolMapping[M]
        : never
    >
} | {
    method: "GET"
    body?: never
});
