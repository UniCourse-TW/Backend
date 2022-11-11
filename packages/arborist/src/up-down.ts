import type { Prisma } from "@unicourse-tw/prisma";
import type { Prev } from "./types";

export type DownArgs<
    T extends Prisma.EntityFindManyArgs,
    N extends number = 9
> = Prev[N] extends never
    ? T
    : T & {
        include: {
            children: DownArgs<T, Prev[N]>
        }
    };

export type UpArgs<
    T extends Prisma.EntityFindManyArgs,
    N extends number = 9
> = Prev[N] extends never
    ? T
    : T & {
        include: {
            parent: UpArgs<T, Prev[N]>
        }
    };

/**
 * Recursively get all the children of a node.
 * @example
 * ```ts
 * const root = await prisma.entity.findUnique({
 *     where: { id },
 *     ...down({
 *         include: {
 *             courses: {
 *                 include: {
 *                     programs: true,
 *                     teachers: true,
 *                     prerequisites: {
 *                         select: { id: true }
 *                     }
 *                 }
 *             }
 *         }
 *     })
 * });
 * ```
 */
export function down<
    T extends Prisma.EntityFindManyArgs,
    N extends number = 9
>(
    find: T = {} as T,
    depth: N = 9 as N
): DownArgs<T, Prev[N]> {
    if (depth <= 0) {
        return find as DownArgs<T, Prev[N]>;
    }
    return {
        ...find,
        include: {
            ...find.include,
            children: down(find, depth - 1)
        }
    };
}

/**
 * Recursively get all the parents of a node.
 * @example
 * ```ts
 * const root = await prisma.entity.findUnique({
 *     where: { id },
 *     ...up({
 *         include: {
 *             courses: {
 *                 include: {
 *                     programs: true,
 *                     teachers: true,
 *                     prerequisites: {
 *                         select: { id: true }
 *                     }
 *                 }
 *             }
 *         }
 *     })
 * });
 * ```
 */
export function up<
    T extends Prisma.EntityFindManyArgs,
    N extends number = 9
>(
    find: T = {} as T,
    depth: N = 9 as N
): UpArgs<T, Prev[N]> {
    if (depth <= 0) {
        return find as UpArgs<T, Prev[N]>;
    }
    return {
        ...find,
        include: {
            ...find.include,
            parent: up(find, depth - 1)
        }
    };
}
