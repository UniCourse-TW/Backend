import type { UserProfile } from "@unicourse-tw/prisma";
import type { CoursePack } from "course-pack";

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

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EndpointTree = {
    auth: {
        login: undefined
        register: undefined
    }
    health: undefined
    profile: { [key: string]: undefined }
    manage: {
        import: undefined
    }
};

export type EndpointPath = PathBuilder<EndpointTree>;

export interface EndpointResponseMapping {
    "auth": never
    "auth/login": {
        token: string
    }
    "auth/register": {
        username: string
        email: string
    }
    "health": {
        server: "ok" | "error"
        database: "ok" | "error"
    }
    [key: `profile/${string}`]: UserProfile
    "manage/import": {
        teachers: string[]
        courses: string[]
        programs: string[]
    }
}

export type EndpointResponse
<P extends keyof EndpointResponseMapping = keyof EndpointResponseMapping>
= {
    [K in P]: K extends keyof EndpointResponseMapping
        ? EndpointResponseMapping[K] : never;
};

export interface EndpointBodyMapping {
    "auth": never
    "auth/login": {
        username: string
        password: string
    }
    "auth/register": {
        username: string
        password: string
        email: string
    }
    "health": never
    [key: `profile/${string}`]: never
    "manage/import": CoursePack
}

export type EndpointBody
<P extends keyof EndpointBodyMapping = keyof EndpointBodyMapping>
= {
    [K in P]: K extends keyof EndpointBodyMapping
        ? EndpointBodyMapping[K] : never;
};

export type EndpointRequestInit<
    T = keyof EndpointBodyMapping
> = (Omit<RequestInit, "body"> & {
    method: "POST"
    body: T extends keyof EndpointBodyMapping
        ? EndpointBody[T] | string
        : (BodyInit | undefined)
}) | (Omit<RequestInit, "body"> & {
    method: "GET"
    body: undefined
});
