/**
 * Convert date to academic year and term
 * @param date Date to convert
 * @returns [year, term]
 */
export function date2term(date = new Date()): [number, number] {
    const year = date.getFullYear() - 1911;
    const month = date.getMonth() + 1;

    const prev = month >= 2 && month <= 7;
    return [year - +prev - +(month === 1), prev ? 2 : 1];
}
