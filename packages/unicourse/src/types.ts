export type PathNode =
    | undefined
    | string
    | {
        [key: string]: PathNode
    };

export interface PathTree {
    [key: string]: PathNode
}

type Join<K, P> = K extends string | number
    ? P extends string | number
        ? `${K}${"" extends P ? "" : "/"}${P}`
        : never
    : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

export type PathBuilder<
    Parent extends PathNode,
    Depth extends number = 5
> = Prev[Depth] extends never
    ? unknown
    : Parent extends PathTree
        ? {
            [K in keyof Parent]-?: K extends string
                ? `${K}` | Join<K, PathBuilder<Parent[K], Prev[Depth]>>
                : never;
        }[keyof Parent]
        : unknown;

export const ENDPOINT_TREE = {
    auth: {
        login: undefined,
        register: undefined
    }
} as const;

export type EndpointPath = PathBuilder<typeof ENDPOINT_TREE>;

export const ENDPOINT_RESPONSE = {
    "auth": undefined,
    "auth/login": {
        token: ""
    },
    "auth/register": {
        username: "",
        email: ""
    }
} as const;

export type EndpointResponse<P extends EndpointPath = EndpointPath> = {
    [K in P]: K extends keyof typeof ENDPOINT_RESPONSE
        ? typeof ENDPOINT_RESPONSE[K] extends undefined
            ? never
            : typeof ENDPOINT_RESPONSE[K]
        : never;
};
