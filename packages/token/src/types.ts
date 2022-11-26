export interface Token {
    /** Cuid of the token */
    token: string
    /** Cuid of the owner */
    user: string
    /** Owner of the token */
    username: string
    /** Expiration date number (in seconds) */
    expires: number
    /** Traits of the token */
    traits: string[]
}
