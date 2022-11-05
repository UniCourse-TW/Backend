# Course Pack

Course Pack is a serialized collection of courses, instructors, programs and providers.

> Course Pack is the official supported data source format of UniCourse.

## Verify Course Pack

You can use `verify` function to type-safe verify a Course Pack.

```ts
import fs from "node:fs";
import type { CoursePack } from "course-pack";
import { verify } from "course-pack";

const pack: unknown = JSON.parse(fs.readFileSync("course-pack.json", "utf-8"));
try {
    const verified: CoursePack = verify(pack);
    console.log(verified);
} catch (error) {
    console.error(error);
}
```
