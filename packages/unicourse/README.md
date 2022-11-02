# UniCourse Client

This is the client library for UniCourse.

If you are looking for the command line tool, see [@unicourse-tw/cli](https://www.npmjs.com/package/@unicourse-tw/cli).

This library is targeting Node.js and browsers, it should work in both environments.

## Examples

The following examples are in TypeScript (ESM). However, you can use it in CommonJS format as well.

```ts
import { UniCourse } from "unicourse";

const uni = new UniCourse();
const user = await uni.login("username", "password");
console.log("Logged in as", user.username);
```

You can also point the client to a different UniCourse server:

```ts
const uni = new UniCourse(undefined, {
    server: "https://unicourse.example.com"
});
```

Reuse a existing token is also possible:

```ts
const uni = new UniCourse("token");
```
